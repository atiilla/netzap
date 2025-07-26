"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { ZMap } from "../sdk/src/browser"
import { parseZMapOutput } from "../sdk/src/utils"
import { useToast } from "@/hooks/use-toast"

// Define the enum values directly here to avoid import issues
enum ScanType {
  TCP_SYN = 'tcp_synscan',
  UDP = 'udp',
  ICMP_ECHO = 'icmp_echoscan'
}

// Define basic interface types here instead of importing them
interface ZMapConfig {
  targetPort?: number;
  outputFile?: string;
  probeModule?: string;
  subnet?: string;
  // Add other properties as needed
  [key: string]: any;
}

interface ZMapResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

// Allow scanResults to be either an array of records or a ZMapResult object
type ScanResultsType = Record<string, string>[] | ZMapResult;

interface NetZapContextType {
  sdk: ZMap | null
  isScanning: boolean
  scanProgress: number
  scanResults: ScanResultsType
  scanCommand: string
  startScan: () => Promise<void>
  stopScan: () => void
  updateConfig: (config: Partial<ZMapConfig>) => void
  setScanCommand: (command: string) => void
  error: string | null
}

const NetZapContext = createContext<NetZapContextType | undefined>(undefined)

interface NetZapProviderProps {
  children: ReactNode
}

export function NetZapProvider({ children }: NetZapProviderProps) {
  const { toast } = useToast()
  const [sdk, setSdk] = useState<ZMap | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResults, setScanResults] = useState<ScanResultsType>([])
  const [scanCommand, setScanCommand] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Initialize SDK
  useEffect(() => {
    // Create SDK instance with proper configuration
    const newSdk = new ZMap({}, 'zmap');
    setSdk(newSdk);
  }, []);

  const updateConfig = (config: Partial<ZMapConfig>) => {
    if (sdk) {
      sdk.setConfig(config)
      setScanCommand(buildZMapCommand(sdk.getConfig()))
    }
  }

  // Helper function to build command string
  const buildZMapCommand = (config: ZMapConfig): string => {
    let command = "zmap" // Always use sudo for zmap

    // Extract subnet from config for positional argument
    const subnet = config.subnet
    
    // Process all config options to build command
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined || value === null || key === "subnet") {
        return
      }

      const optionName = key.replace(/([A-Z])/g, "-$1").toLowerCase()
      
      if (typeof value === "boolean") {
        if (value) command += ` --${optionName}`
      } else if (Array.isArray(value)) {
        command += ` --${optionName}=${value.join(",")}`
      } else {
        command += ` --${optionName}=${value}`
      }
    })

    // Add subnet as positional argument
    if (subnet) {
      command += ` ${subnet}`
    }

    return command
  }

  const startScan = async () => {
    if (!sdk || !scanCommand || isScanning) return
    
    // Clear any previous errors
    setError(null)
    setIsScanning(true)
    setScanProgress(0)
    setScanResults([])
    
    try {
      console.log("Executing scan with command:", scanCommand)
      
      // Set initial scan progress
      setScanProgress(10)
      
      // Get the target from the config
      const config = sdk.getConfig()
      const target = config.subnet
      const port = config.targetPort || 80
      const scanType = config.probeModule || 'tcp_synscan'
      
      if (!target) {
        throw new Error("Target IP or subnet is required")
      }
      
      console.log(`Scanning target: ${target} on port ${port} with type ${scanType}`)
      setScanProgress(20)
      
      // Check if we're in browser environment (modify this condition if needed)
      const isBrowser = typeof window !== 'undefined'
      
      let result: ZMapResult;
      
      if (isBrowser) {
        // In browser environment, we call our API endpoint
        setScanProgress(25)
        
        toast({
          title: "Browser scan started",
          description: "Sending scan request to the server API",
        })
        
        try {
          // Call the API endpoint with scan parameters
          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subnet: target,
              port: port,
              scanType: scanType,
              options: config // Pass all other config options
            }),
          });
          
          setScanProgress(50)
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed: ${response.status}`);
          }
          
          // Parse the API response
          const apiResult = await response.json();
          
          result = {
            success: apiResult.success || false,
            output: apiResult.rawOutput || '',
            exitCode: 0
          };
          
          // If API already returned parsed results, use those directly
          if (apiResult.results && Array.isArray(apiResult.results)) {
            setScanResults(apiResult.results);
          } else {
            // If the API didn't process results, set the raw result for the ScanResults component to handle
            setScanResults(result);
          }
          
        } catch (error: any) {
          throw new Error(`API scan failed: ${error.message}`);
        }
      } else {
        // Use the SDK to execute the scan directly (in Node.js environment)
        result = await sdk.execute();
        setScanProgress(50);
        
        if (!result.success) {
          throw new Error(result.error || "Scan failed");
        }
        
        // Try to parse the output into structured results
        let parsedResults = parseZMapOutput(result.output);
        
        // If we got no parsed results but have output, it might be a raw IP list
        if (parsedResults.length === 0 && result.output.trim()) {
          // Split by newline and convert each IP to a result object
          parsedResults = result.output.trim().split('\n')
            .filter(ip => ip.trim())
            .map(ip => ({
              saddr: ip.trim(),
              dport: port.toString(),
              classification: 'synack'
            }));
            
          // If we still have results after parsing the raw IP list, use them
          if (parsedResults.length > 0) {
            setScanResults(parsedResults);
          } else {
            // As a fallback, just set the raw result object
            setScanResults(result);
          }
        } else {
          // If we have parsed results, use them
          setScanResults(parsedResults);
        }
      }
      
      console.log("Scan execution result:", result);
      console.log("Scan results set:", scanResults);
      
      // Complete the progress
      setScanProgress(100)
      
      // Delay setting scanning to false to show 100% for a moment
      setTimeout(() => {
        setIsScanning(false)
      }, 500)
      
      // Get the count of results - this might be an array or an object with output field
      let resultCount = 0;
      if (Array.isArray(scanResults)) {
        resultCount = scanResults.length;
      } else if (scanResults && typeof scanResults === 'object' && 'output' in scanResults) {
        const outputStr = String(scanResults.output || '');
        resultCount = outputStr.trim().split('\n').filter(Boolean).length;
      }
      
      toast({
        title: "Scan completed",
        description: `Found ${resultCount} results for ${target}`,
      })
      
    } catch (error) {
      // Handle error case
      console.error("Scan error:", error)
      
      setIsScanning(false)
      setScanProgress(0)
      
      // Set error message
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setError(errorMessage)
      
      // Display error toast
      toast({
        title: "Scan failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const stopScan = () => {
    // No need to clear interval as we're not using it anymore
    setIsScanning(false)
    setScanProgress(0)
    setError(null)
    
    toast({
      title: "Scan stopped",
      description: "The scan was stopped by user.",
    })
  }

  const value = {
    sdk,
    isScanning,
    scanProgress,
    scanResults,
    scanCommand,
    startScan,
    stopScan,
    updateConfig,
    setScanCommand,
    error
  }

  return (
    <NetZapContext.Provider value={value}>
      {children}
    </NetZapContext.Provider>
  )
}

export function useNetZap() {
  const context = useContext(NetZapContext)
  
  if (context === undefined) {
    throw new Error("useNetZap must be used within a NetZapProvider")
  }
  
  return context
}

// Export the ScanType enum for components to use
export { ScanType } 