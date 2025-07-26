"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NetworkMap } from "@/components/network-map"
import { ScanResults } from "@/components/scan-results"
import { AlertCircle, Play, StopCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export function Dashboard() {
  const { toast } = useToast()
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | undefined>(undefined)
  
  const targetRef = useRef<HTMLInputElement>(null)
  const portRef = useRef<HTMLInputElement>(null)
  const [bandwidth, setBandwidth] = useState(10)
  const [probeModule, setProbeModule] = useState("tcp_syn")
  const [useBlacklist, setUseBlacklist] = useState(false)
  const [randomizeTargets, setRandomizeTargets] = useState(true)
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const startScan = async () => {
    try {
      // Validate inputs
      if (!targetRef.current?.value) {
        toast({
          title: "Missing target",
          description: "Please specify a target network or IP range",
          variant: "destructive",
        })
        return
      }
      
      const target = targetRef.current.value
      const port = parseInt(portRef.current?.value || "80")
      
      // Start scanning UI state
      setScanning(true)
      setShowResults(false)
      setScanProgress(0)
      
      // Start progress simulation for UI feedback
      progressInterval.current = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) return prev
          return prev + (Math.random() * 2)
        })
      }, 1000)
      
      // Build scan options
      const options: Record<string, any> = {
        bandwidth: `${bandwidth}M`
      }
      
      if (useBlacklist) {
        options.blacklistFile = "/etc/zmap/blacklist.conf"
      }
      
      // Send scan request to API
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subnet: target,
          port,
          scanType: probeModule,
          options
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start scan')
      }
      
      const data = await response.json()
      
      // Store the scan ID for results fetching
      setCurrentScanId(data.scanId)
      
      // Complete progress and show results
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      
      setScanProgress(100)
      
      setTimeout(() => {
        setScanning(false)
        setShowResults(true)
      }, 1000)
      
    } catch (error: any) {
      console.error('Error starting scan:', error)
      toast({
        title: "Scan failed",
        description: error.message || "Failed to start network scan",
        variant: "destructive",
      })
      
      // Reset UI state
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      setScanning(false)
    }
  }

  const stopScan = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
    setScanning(false)
    
    toast({
      title: "Scan stopped",
      description: "The scan was stopped before completion",
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Scan Configuration</CardTitle>
          <CardDescription>Configure your network scan parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Target Network/IP Range</Label>
            <Input id="target" placeholder="192.168.1.0/24" ref={targetRef} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Target Port</Label>
            <Input id="port" placeholder="80" type="number" ref={portRef} defaultValue="80" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bandwidth">Bandwidth (Mbps)</Label>
            <Slider 
              id="bandwidth" 
              defaultValue={[bandwidth]} 
              max={1000} 
              step={1} 
              className="py-4" 
              onValueChange={(value) => setBandwidth(value[0])}
            />
            <div className="text-right text-sm text-muted-foreground">{bandwidth} Mbps</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="probe-module">Probe Module</Label>
            <Select 
              defaultValue={probeModule}
              onValueChange={setProbeModule}
            >
              <SelectTrigger id="probe-module">
                <SelectValue placeholder="Select probe module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tcp_syn">TCP SYN</SelectItem>
                <SelectItem value="icmp_echo">ICMP Echo</SelectItem>
                <SelectItem value="udp">UDP</SelectItem>
                <SelectItem value="tcp_synack">TCP SYN+ACK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="blacklist" 
              checked={useBlacklist}
              onCheckedChange={setUseBlacklist}
            />
            <Label htmlFor="blacklist">Use default blacklist</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="random" 
              checked={randomizeTargets}
              onCheckedChange={setRandomizeTargets}
            />
            <Label htmlFor="random">Randomize target order</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={stopScan} disabled={!scanning}>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button onClick={startScan} disabled={scanning}>
            <Play className="mr-2 h-4 w-4" />
            Start Scan
          </Button>
        </CardFooter>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Scan Status</CardTitle>
          <CardDescription>
            {scanning
              ? `Scanning in progress - ${scanProgress.toFixed(1)}% complete`
              : showResults
                ? "Scan completed"
                : "Configure and start a scan"}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {scanning && (
            <div className="space-y-4">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Scanning network - {scanProgress.toFixed(1)}% complete
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Active Scan</AlertTitle>
                <AlertDescription>
                  ZMap is actively scanning the network. This may generate significant network traffic.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {showResults && (
            <Tabs defaultValue="map">
              <TabsList className="mb-4">
                <TabsTrigger value="map">Network Map</TabsTrigger>
                <TabsTrigger value="results">Results Table</TabsTrigger>
              </TabsList>
              <TabsContent value="map">
                <NetworkMap scanId={currentScanId} />
              </TabsContent>
              <TabsContent value="results">
                <ScanResults scanId={currentScanId} />
              </TabsContent>
            </Tabs>
          )}

          {!scanning && !showResults && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">Configure scan parameters and click Start Scan</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

