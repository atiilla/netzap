"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/sidebar"
import { ScanConfiguration } from "@/components/scan-configuration"
import { ScanResults } from "@/components/scan-results"
import { CommandPreview } from "@/components/command-preview"
import { ScanHistory } from "@/components/scan-history"
import { Settings } from "@/components/settings"
import { NetworkMap } from "@/components/network-map"
import { Button } from "@/components/ui/button"
import { Play, StopCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function NetZapInterface() {
  const [scanId, setScanId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("scan")
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanCommand, setScanCommand] = useState("")
  const [showMissingConfigToast, setShowMissingConfigToast] = useState(false)
  const { toast } = useToast()

  // Use useEffect to handle toast calls that were previously in render
  useEffect(() => {
    if (showMissingConfigToast) {
      toast({
        title: "Missing configuration",
        description: "Please configure your scan parameters first.",
        variant: "destructive",
      })
      setShowMissingConfigToast(false)
    }
  }, [showMissingConfigToast, toast])

  const startScan = async () => {
    if (!scanCommand) {
      setShowMissingConfigToast(true)
      return
    }

    setScanning(true)
    setScanProgress(0)

    // Extract subnet from command (simplified parsing)
    const subnetMatch = scanCommand.match(/zmap\s+.*?\s+([0-9\.]+\/[0-9]+)(\s|$)/)
    const subnet = subnetMatch ? subnetMatch[1] : null
    
    if (!subnet) {
      toast({
        title: "Error",
        description: "Could not determine target subnet from command.",
        variant: "destructive",
      })
      setScanning(false)
      return
    }
    
    // Extract port from command
    const portMatch = scanCommand.match(/-p\s+([0-9]+)/)
    const port = portMatch ? portMatch[1] : "80" // Default if not found

    // Extract scan type from command
    let scanType = "tcp_synscan" // Default
    if (scanCommand.includes("-M icmp_echo")) {
      scanType = "icmp_echo"
    } else if (scanCommand.includes("-M udp")) {
      scanType = "udp"
    }

    // Track progress periodically
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        // Move progress forward more slowly for real scans
        const increment = Math.random() * 3
        const newProgress = Math.min(prev + increment, 95) // Cap at 95% until we get confirmation
        return newProgress
      })
    }, 1000)

    try {
      // Call the API to execute the scan
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subnet,
          port: parseInt(port),
          scanType,
          options: {
            // Any other options parsed from command could go here
          }
        }),
      })

      clearInterval(progressInterval)
      
      const errorData = await response.json()
      
      if (!response.ok) {
        // Check if the error is related to ZMap not being installed
        if (errorData.error && errorData.error.includes('ZMap is not installed')) {
          throw new Error(
            'ZMap is not installed on the server. Please install ZMap to use this feature.\n\n' +
            'Visit: https://github.com/zmap/zmap for installation instructions.'
          )
        }
        throw new Error(errorData.error || 'Failed to start scan')
      }

      // Response was successful
      if (errorData.success) {
        setScanId(errorData.scanId)
        setScanProgress(100)
        
        toast({
          title: "Scan completed",
          description: `Found ${errorData.count} hosts.`,
        })
        
        // Navigate to results tab
        setActiveTab("results")
      } else {
        throw new Error(errorData.error || 'Scan failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      console.error("Scan error:", error)
    } finally {
      clearInterval(progressInterval)
      setScanning(false)
    }
  }

  const stopScan = () => {
    setScanning(false)
    setScanProgress(0)
    toast({
      title: "Scan stopped",
      description: "The scan was stopped by user.",
    })
  }

  const handleCommandUpdate = (command: string) => {
    setScanCommand(command)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            {/* <div className="h-6 w-6 rounded-full bg-primary"></div> */}
            <Image src="/logo.webp" alt="NetZap Logo" width={32} height={32} />
            <span>NetZap</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {scanning ? (
              <>
                <Progress value={scanProgress} className="w-40" />
                <Button variant="destructive" size="sm" onClick={stopScan}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Scan
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={startScan}>
                <Play className="mr-2 h-4 w-4" />
                Start Scan
              </Button>
            )}
          </div>
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <ScrollArea className="h-full">
                <div className="p-4 md:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsContent value="scan" className="mt-0">
                      <ScanConfiguration onCommandUpdate={handleCommandUpdate} />
                    </TabsContent>
                    <TabsContent value="results" className="mt-0">
                      <Tabs defaultValue="table">
                        <TabsList>
                          <TabsTrigger value="table">Table</TabsTrigger>
                          <TabsTrigger value="map">Network Map</TabsTrigger>
                        </TabsList>
                        <TabsContent value="table">
                          <ScanResults scanId={scanId || undefined} />
                        </TabsContent>
                        <TabsContent value="map">
                          <NetworkMap />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                    <TabsContent value="history" className="mt-0">
                      <ScanHistory />
                    </TabsContent>
                    <TabsContent value="settings" className="mt-0">
                      <Settings />
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30}>
              <CommandPreview command={scanCommand} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

