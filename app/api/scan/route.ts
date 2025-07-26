import { NextResponse } from 'next/server';
import { createScan, saveScanResults, updateScanStatus } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch scan results from the ZMap backend service
 */
async function fetchScanResults(scanConfig: any) {
  try {
    const response = await fetch('http://netzap-backend:8000/scan-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scanConfig),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform scan');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to fetch scan results:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract and set defaults based on ZMapSDK API parameters
    const { 
      target_port = null, 
      port = 80,
      subnets: providedSubnets = [], 
      subnet = null,
      output_file = "",
      blocklist_file = "",
      allowlist_file = "",
      bandwidth = "",
      probe_module = "tcp_synscan",
      scanType = null,
      rate = 0,
      seed = 0,
      verbosity = 0,
      return_results = true  // Default to true to get results back from API
    } = body;
    
    // Handle both subnet and subnets parameters
    const subnets = providedSubnets.length > 0 ? providedSubnets : (subnet ? [subnet] : []);
    
    // Use provided target_port, or fall back to port
    const finalPort = target_port || port;
    
    // Use provided probe_module, or fall back to scanType
    const finalProbeModule = scanType || probe_module;
    
    if (!subnets || subnets.length === 0) {
      return NextResponse.json(
        { error: 'Target subnets are required' },
        { status: 400 }
      );
    }
    
    // Use the first subnet for DB record (we'll include all in the scan)
    const primarySubnet = subnets[0];
    
    // Prepare scan configuration for the ZMap SDK API
    const scanConfig = {
      target_port: finalPort,
      subnets,
      output_file,
      blocklist_file,
      allowlist_file,
      bandwidth,
      probe_module: finalProbeModule,
      rate,
      seed,
      verbosity,
      return_results
    };
    
    // Create scan record in database
    const scan = await createScan({
      target: subnets.join(', '),
      port: finalPort,
      scanType: finalProbeModule,
      command: JSON.stringify(scanConfig, null, 2),
      hostsScanned: 0,
      hostsUp: 0,
      endTime: null
    });
    
    try {
      // Call the ZMap SDK API
      const result = await fetchScanResults(scanConfig);
      
      // Handle different possible response formats from ZMapSDK
      if (!result) {
        throw new Error("Empty response from scan service");
      }
      
      // If API returns error field
      if (result.error) {
        await updateScanStatus(scan.id, 'failed', {
          error: result.error
        });
        
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      // If scan returned with a failed status
      if (result.status === 'failed') {
        await updateScanStatus(scan.id, 'failed', {
          error: result.error || 'Scan failed with status: failed'
        });
        
        return NextResponse.json(
          { error: result.error || 'Scan failed' },
          { status: 500 }
        );
      }
      
      // Extract IPs from the results - handle different formats
      const ipsFound = result.ips_found || result.results || [];
      
      // Map to our database structure
      const dbResults = ipsFound.map((hostInfo: any) => {
        // Handle both object format and simple IP string format
        const ip = typeof hostInfo === 'object' ? (hostInfo.ip || hostInfo.saddr) : hostInfo;
        const port = typeof hostInfo === 'object' ? (hostInfo.port || parseInt(hostInfo.dport) || finalPort) : finalPort;
        const status = typeof hostInfo === 'object' ? (hostInfo.status || (hostInfo.classification === 'synack' ? 'open' : 'closed')) : 'open';
        
        return {
          ip,
          port,
          protocol: finalProbeModule === 'icmp_echo' ? 'icmp' : 'tcp',
          status,
          scanId: scan.id
        };
      });
      
      // Save results to database
      await saveScanResults(dbResults);
      
      // Update scan status
      await updateScanStatus(scan.id, 'completed', {
        hostsScanned: result.total_hosts_scanned || subnets.reduce((total: number, subnet: string) => {
          if (subnet.includes('/')) {
            const cidrBits = parseInt(subnet.split('/')[1]);
            return total + Math.pow(2, 32 - cidrBits);
          }
          return total + 1;
        }, 0),
        hostsUp: dbResults.length
      });
      
      // Return success response with results
      return NextResponse.json({
        success: true,
        scanId: scan.id,
        results: ipsFound,
        count: ipsFound.length,
        outputFile: result.output_file || null
      });
    } catch (error: any) {
      await updateScanStatus(scan.id, 'failed', {
        error: error.message || 'Unknown error during scan execution'
      });
      
      return NextResponse.json(
        { error: error.message || 'Unknown error during scan execution' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}

