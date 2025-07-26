import { NextResponse } from 'next/server';
import { getScanResults, getScanById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('scanId');
    
    if (!scanId) {
      return NextResponse.json(
        { error: 'Scan ID is required' },
        { status: 400 }
      );
    }
    
    // Check if scan exists
    const scan = await getScanById(scanId);
    
    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }
    
    const results = await getScanResults(scanId);
    
    if (!results.length) {
      return NextResponse.json(
        { error: 'No results found for this scan' },
        { status: 404 }
      );
    }
    
    // Generate CSV content
    const headers = ['IP', 'Port', 'Protocol', 'Status', 'Timestamp'];
    const csvRows = [
      headers.join(','),
      ...results.map(result => 
        [
          result.ip, 
          result.port, 
          result.protocol, 
          result.status, 
          result.timestamp
        ].join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Return as download
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scan-results-${scanId}.csv"`
      }
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
} 