"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { InfoIcon as InfoCircle, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ScanConfigurationProps {
  onCommandUpdate: (command: string) => void
}

export function ScanConfiguration({ onCommandUpdate }: ScanConfigurationProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  
  // Basic arguments
  const [targetPort, setTargetPort] = useState("")
  const [outputFile, setOutputFile] = useState("")
  const [blacklistFile, setBlacklistFile] = useState("")
  const [whitelistFile, setWhitelistFile] = useState("")
  const [subnets, setSubnets] = useState("")

  // Scan options
  const [rate, setRate] = useState("")
  const [bandwidth, setBandwidth] = useState("")
  const [bandwidthUnit, setBandwidthUnit] = useState("M")
  const [maxTargets, setMaxTargets] = useState("")
  const [maxRuntime, setMaxRuntime] = useState("")
  const [maxResults, setMaxResults] = useState("")
  const [probes, setProbes] = useState("1")
  const [cooldownTime, setCooldownTime] = useState("8")
  const [seed, setSeed] = useState("")
  const [retries, setRetries] = useState("10")
  const [dryrun, setDryrun] = useState(false)
  const [shards, setShards] = useState("1")
  const [shard, setShard] = useState("0")

  // Network options
  const [sourcePort, setSourcePort] = useState("")
  const [sourceIp, setSourceIp] = useState("")
  const [gatewayMac, setGatewayMac] = useState("")
  const [sourceMac, setSourceMac] = useState("")
  const [interface_, setInterface] = useState("")
  const [vpn, setVpn] = useState(false)

  // Probe modules
  const [probeModule, setProbeModule] = useState("tcp_synscan")
  const [probeArgs, setProbeArgs] = useState("")

  // Data output
  const [outputFields, setOutputFields] = useState("")
  const [outputModule, setOutputModule] = useState("default")
  const [outputArgs, setOutputArgs] = useState("")
  const [outputFilter, setOutputFilter] = useState("")

  // Logging and metadata
  const [verbosity, setVerbosity] = useState("3")
  const [logFile, setLogFile] = useState("")
  const [logDirectory, setLogDirectory] = useState("")
  const [metadataFile, setMetadataFile] = useState("")
  const [statusUpdatesFile, setStatusUpdatesFile] = useState("")
  const [quiet, setQuiet] = useState(false)
  const [disableSyslog, setDisableSyslog] = useState(false)
  const [notes, setNotes] = useState("")
  const [userMetadata, setUserMetadata] = useState("")

  // Additional options
  const [configFile, setConfigFile] = useState("/etc/zmap/zmap.conf")
  const [maxSendtoFailures, setMaxSendtoFailures] = useState("-1")
  const [minHitrate, setMinHitrate] = useState("0.0")
  const [senderThreads, setSenderThreads] = useState("1")
  const [cores, setCores] = useState("")
  const [ignoreInvalidHosts, setIgnoreInvalidHosts] = useState(false)
  
  // Command state
  const [command, setCommand] = useState("")

  useEffect(() => {
    // Build the zmap command based on the current configuration
    let command = "zmap"

    // Basic arguments
    if (targetPort) command += ` -p ${targetPort}`
    if (outputFile) command += ` -o ${outputFile}`
    if (blacklistFile) command += ` -b ${blacklistFile}`
    if (whitelistFile) command += ` -w ${whitelistFile}`

    // Scan options
    if (rate) command += ` -r ${rate}`
    if (bandwidth) command += ` -B ${bandwidth}${bandwidthUnit}`
    if (maxTargets) command += ` -n ${maxTargets}`
    if (maxRuntime) command += ` -t ${maxRuntime}`
    if (maxResults) command += ` -N ${maxResults}`
    if (probes !== "1") command += ` -P ${probes}`
    if (cooldownTime !== "8") command += ` -c ${cooldownTime}`
    if (seed) command += ` -e ${seed}`
    if (retries !== "10") command += ` --retries=${retries}`
    if (dryrun) command += ` -d`
    if (shards !== "1") command += ` --shards=${shards}`
    if (shard !== "0" || shards !== "1") command += ` --shard=${shard}`

    // Network options
    if (sourcePort) command += ` -s ${sourcePort}`
    if (sourceIp) command += ` -S ${sourceIp}`
    if (gatewayMac) command += ` -G ${gatewayMac}`
    if (sourceMac) command += ` --source-mac=${sourceMac}`
    if (interface_) command += ` -i ${interface_}`
    if (vpn) command += ` -X`

    // Probe modules
    if (probeModule !== "tcp_synscan") command += ` -M ${probeModule}`
    if (probeArgs) command += ` --probe-args="${probeArgs}"`

    // Data output
    if (outputFields) command += ` -f ${outputFields}`
    if (outputModule !== "default") command += ` -O ${outputModule}`
    if (outputArgs) command += ` --output-args="${outputArgs}"`
    if (outputFilter) command += ` --output-filter="${outputFilter}"`

    // Logging and metadata
    if (verbosity !== "3") command += ` -v ${verbosity}`
    if (logFile) command += ` -l ${logFile}`
    if (logDirectory) command += ` -L ${logDirectory}`
    if (metadataFile) command += ` -m ${metadataFile}`
    if (statusUpdatesFile) command += ` -u ${statusUpdatesFile}`
    if (quiet) command += ` -q`
    if (disableSyslog) command += ` --disable-syslog`
    if (notes) command += ` --notes="${notes}"`
    if (userMetadata) command += ` --user-metadata='${userMetadata}'`

    // Additional options
    if (configFile !== "/etc/zmap/zmap.conf") command += ` -C ${configFile}`
    if (maxSendtoFailures !== "-1") command += ` --max-sendto-failures=${maxSendtoFailures}`
    if (minHitrate !== "0.0") command += ` --min-hitrate=${minHitrate}`
    if (senderThreads !== "1") command += ` -T ${senderThreads}`
    if (cores) command += ` --cores=${cores}`
    if (ignoreInvalidHosts) command += ` --ignore-invalid-hosts`

    // Add subnets at the end
    if (subnets) command += ` ${subnets}`

    setCommand(command)
    onCommandUpdate(command)
  }, [
    targetPort,
    outputFile,
    blacklistFile,
    whitelistFile,
    subnets,
    rate,
    bandwidth,
    bandwidthUnit,
    maxTargets,
    maxRuntime,
    maxResults,
    probes,
    cooldownTime,
    seed,
    retries,
    dryrun,
    shards,
    shard,
    sourcePort,
    sourceIp,
    gatewayMac,
    sourceMac,
    interface_,
    vpn,
    probeModule,
    probeArgs,
    outputFields,
    outputModule,
    outputArgs,
    outputFilter,
    verbosity,
    logFile,
    logDirectory,
    metadataFile,
    statusUpdatesFile,
    quiet,
    disableSyslog,
    notes,
    userMetadata,
    configFile,
    maxSendtoFailures,
    minHitrate,
    senderThreads,
    cores,
    ignoreInvalidHosts,
    onCommandUpdate,
  ])

  const startScan = async () => {
    if (!subnets) {
      toast({
        title: "Error",
        description: "You must specify at least one target subnet",
        variant: "destructive",
      })
      return
    }

    if (!targetPort && probeModule !== "icmp_echo" && probeModule !== "icmp_echoscan") {
      toast({
        title: "Error",
        description: "Target port is required for this scan type",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subnet: subnets,
          port: targetPort ? parseInt(targetPort) : undefined,
          scanType: probeModule,
          options: {
            probeArgs,
            rate: rate ? parseInt(rate) : undefined,
            bandwidth: bandwidth ? `${bandwidth}${bandwidthUnit}` : undefined,
            interface: interface_ || undefined,
            sourceIP: sourceIp || undefined,
            sourcePort: sourcePort || undefined,
            // Add other options as needed
          }
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Scan started",
          description: `Found ${result.count} hosts. Redirecting to results...`,
        })
        
        // Navigate to the results page
        router.push('/results')
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start scan",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the API",
        variant: "destructive",
      })
      console.error("Scan error:", error)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <TooltipProvider>
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="scan">Scan Options</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="probe">Probe Modules</TabsTrigger>
          <TabsTrigger value="output">Data Output</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Arguments */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Arguments</CardTitle>
              <CardDescription>Configure the essential parameters for your ZMap scan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="target-port">Target Port</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Port number to scan (for TCP and UDP scans)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="target-port"
                    placeholder="e.g., 80"
                    value={targetPort}
                    onChange={(e) => setTargetPort(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="output-file">Output File</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>File to write results to (default: stdout)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="output-file"
                    placeholder="e.g., results.csv"
                    value={outputFile}
                    onChange={(e) => setOutputFile(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="subnets">Target Subnets</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Space-separated list of subnets to scan (CIDR notation)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="subnets"
                  placeholder="e.g., 192.168.0.0/16 10.0.0.0/8"
                  value={subnets}
                  onChange={(e) => setSubnets(e.target.value)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="blacklist-file">Blacklist File</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>File of subnets to exclude, in CIDR notation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="blacklist-file"
                    placeholder="e.g., blacklist.conf"
                    value={blacklistFile}
                    onChange={(e) => setBlacklistFile(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="whitelist-file">Whitelist File</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>File of subnets to constrain scan to, in CIDR notation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="whitelist-file"
                    placeholder="e.g., whitelist.conf"
                    value={whitelistFile}
                    onChange={(e) => setWhitelistFile(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <div>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(command)}>
                    Copy Command
                  </Button>
                </div>
                <div>
                  <Button onClick={startScan} disabled={isScanning}>
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
                      </>
                    ) : (
                      "Start Scan"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan Options */}
        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Scan Options</CardTitle>
              <CardDescription>Configure scan rate, timing, and other scan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rate">Send Rate (packets/sec)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set send rate in packets per second</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="rate" placeholder="e.g., 10000" value={rate} onChange={(e) => setRate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bandwidth">Bandwidth</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set send rate in bits per second (supports G, M, K suffixes)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="bandwidth"
                      placeholder="e.g., 10"
                      value={bandwidth}
                      onChange={(e) => setBandwidth(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={bandwidthUnit} onValueChange={setBandwidthUnit}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="K">Kbps</SelectItem>
                        <SelectItem value="M">Mbps</SelectItem>
                        <SelectItem value="G">Gbps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="max-targets">Max Targets</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cap number of targets to probe (as a number or a percentage)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="max-targets"
                    placeholder="e.g., 1000 or 10%"
                    value={maxTargets}
                    onChange={(e) => setMaxTargets(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="max-runtime">Max Runtime (seconds)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cap length of time for sending packets</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="max-runtime"
                    placeholder="e.g., 300"
                    value={maxRuntime}
                    onChange={(e) => setMaxRuntime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="max-results">Max Results</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cap number of results to return</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="max-results"
                    placeholder="e.g., 1000"
                    value={maxResults}
                    onChange={(e) => setMaxResults(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="probes">Probes per IP</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of probes to send to each IP (default: 1)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="probes" placeholder="e.g., 1" value={probes} onChange={(e) => setProbes(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cooldown-time">Cooldown Time (seconds)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How long to continue receiving after sending last probe (default: 8)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="cooldown-time"
                    placeholder="e.g., 8"
                    value={cooldownTime}
                    onChange={(e) => setCooldownTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="retries">Retries</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Max number of times to try to send packet if send fails (default: 10)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="retries"
                    placeholder="e.g., 10"
                    value={retries}
                    onChange={(e) => setRetries(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="seed">Random Seed</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Seed used to select address permutation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="seed"
                    placeholder="e.g., 123456789"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="shards">Total Shards</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set the total number of shards (default: 1)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="shards" placeholder="e.g., 1" value={shards} onChange={(e) => setShards(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="shard">Shard Number</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set which shard this scan is (0 indexed) (default: 0)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="shard" placeholder="e.g., 0" value={shard} onChange={(e) => setShard(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="dryrun" checked={dryrun} onCheckedChange={setDryrun} />
                <Label htmlFor="dryrun">Dry Run (don't actually send packets)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Options */}
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Options</CardTitle>
              <CardDescription>Configure network interfaces and addressing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="source-port">Source Port</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Source port(s) for scan packets (can be a range, e.g., 40000-50000)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="source-port"
                    placeholder="e.g., 40000 or 40000-50000"
                    value={sourcePort}
                    onChange={(e) => setSourcePort(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="source-ip">Source IP</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Source address(es) for scan packets (can be a range)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="source-ip"
                    placeholder="e.g., 192.168.1.5"
                    value={sourceIp}
                    onChange={(e) => setSourceIp(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gateway-mac">Gateway MAC Address</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Specify gateway MAC address</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="gateway-mac"
                    placeholder="e.g., 00:11:22:33:44:55"
                    value={gatewayMac}
                    onChange={(e) => setGatewayMac(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="source-mac">Source MAC Address</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Source MAC address</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="source-mac"
                    placeholder="e.g., 00:11:22:33:44:55"
                    value={sourceMac}
                    onChange={(e) => setSourceMac(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interface">Network Interface</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Specify network interface to use</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="interface"
                    placeholder="e.g., eth0"
                    value={interface_}
                    onChange={(e) => setInterface(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 self-end">
                  <Switch id="vpn" checked={vpn} onCheckedChange={setVpn} />
                  <Label htmlFor="vpn">VPN Mode (sends IP packets instead of Ethernet)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Probe Modules */}
        <TabsContent value="probe">
          <Card>
            <CardHeader>
              <CardTitle>Probe Modules</CardTitle>
              <CardDescription>Configure the type of probes to send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="probe-module">Probe Module</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select probe module (default: tcp_synscan)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={probeModule} onValueChange={setProbeModule}>
                  <SelectTrigger id="probe-module">
                    <SelectValue placeholder="Select probe module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp_synscan">tcp_synscan</SelectItem>
                    <SelectItem value="icmp_echo">icmp_echo</SelectItem>
                    <SelectItem value="icmp_echoscan">icmp_echoscan</SelectItem>
                    <SelectItem value="udp">udp</SelectItem>
                    <SelectItem value="tcp_synackscan">tcp_synackscan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="probe-args">Probe Arguments</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Arguments to pass to probe module</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="probe-args"
                  placeholder="e.g., file=/path/to/payload"
                  value={probeArgs}
                  onChange={(e) => setProbeArgs(e.target.value)}
                />
              </div>

              <div className="rounded-md bg-secondary p-4">
                <h3 className="mb-2 font-medium">Probe Module Help: {probeModule}</h3>
                {probeModule === "tcp_synscan" && (
                  <p className="text-sm text-muted-foreground">
                    Probe module that sends a TCP SYN packet to a specific port. Possible classifications are: synack
                    and rst. A SYN-ACK packet is considered a success and a reset packet is considered a failed
                    response.
                  </p>
                )}
                {probeModule === "icmp_echo" && (
                  <p className="text-sm text-muted-foreground">
                    Probe module that sends ICMP echo (ping) requests to hosts.
                  </p>
                )}
                {probeModule === "udp" && (
                  <p className="text-sm text-muted-foreground">
                    Probe module that sends UDP packets to a specific port.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Output */}
        <TabsContent value="output">
          <Card>
            <CardHeader>
              <CardTitle>Data Output</CardTitle>
              <CardDescription>Configure how scan results are formatted and output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="output-module">Output Module</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select output module (default: default)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={outputModule} onValueChange={setOutputModule}>
                    <SelectTrigger id="output-module">
                      <SelectValue placeholder="Select output module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">default</SelectItem>
                      <SelectItem value="csv">csv</SelectItem>
                      <SelectItem value="json">json</SelectItem>
                      <SelectItem value="redis">redis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="output-fields">Output Fields</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fields that should be output in result set (comma-separated)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="output-fields"
                    placeholder="e.g., saddr,daddr,sport,dport"
                    value={outputFields}
                    onChange={(e) => setOutputFields(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="output-args">Output Arguments</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Arguments to pass to output module</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="output-args"
                  placeholder="e.g., name=value"
                  value={outputArgs}
                  onChange={(e) => setOutputArgs(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="output-filter">Output Filter</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Specify a filter over the response fields to limit what responses get sent to the output module
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="output-filter"
                  placeholder="e.g., success = 1 && repeat = 0"
                  value={outputFilter}
                  onChange={(e) => setOutputFilter(e.target.value)}
                />
              </div>

              <div className="rounded-md bg-secondary p-4">
                <h3 className="mb-2 font-medium">Output Module Help: {outputModule}</h3>
                {outputModule === "default" || outputModule === "csv" ? (
                  <p className="text-sm text-muted-foreground">
                    By default, ZMap prints out unique, successful IP addresses (e.g., SYN-ACK from a TCP SYN scan) in
                    ASCII form (e.g., 192.168.1.5) to stdout or the specified output file. Internally this is handled by
                    the "csv" output module.
                  </p>
                ) : outputModule === "json" ? (
                  <p className="text-sm text-muted-foreground">
                    The JSON output module produces JSON objects for each result.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Output module that stores results in a Redis database.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Options */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>Configure logging, metadata, and additional parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={["logging", "additional"]}>
                <AccordionItem value="logging">
                  <AccordionTrigger>Logging and Metadata</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="verbosity">Verbosity Level</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Level of log detail (0-5) (default: 3)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={verbosity} onValueChange={setVerbosity}>
                          <SelectTrigger id="verbosity">
                            <SelectValue placeholder="Select verbosity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 - Silent</SelectItem>
                            <SelectItem value="1">1 - Fatal</SelectItem>
                            <SelectItem value="2">2 - Error</SelectItem>
                            <SelectItem value="3">3 - Warning</SelectItem>
                            <SelectItem value="4">4 - Info</SelectItem>
                            <SelectItem value="5">5 - Debug</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="log-file">Log File</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Write log entries to file</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="log-file"
                          placeholder="e.g., zmap.log"
                          value={logFile}
                          onChange={(e) => setLogFile(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="log-directory">Log Directory</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Write log entries to a timestamped file in this directory</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="log-directory"
                          placeholder="e.g., /var/log/zmap"
                          value={logDirectory}
                          onChange={(e) => setLogDirectory(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="metadata-file">Metadata File</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Output file for scan metadata (JSON)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="metadata-file"
                          placeholder="e.g., metadata.json"
                          value={metadataFile}
                          onChange={(e) => setMetadataFile(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="status-updates-file">Status Updates File</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Write scan progress updates to CSV file</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="status-updates-file"
                          placeholder="e.g., status.csv"
                          value={statusUpdatesFile}
                          onChange={(e) => setStatusUpdatesFile(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Inject user-specified notes into scan metadata</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="notes"
                          placeholder="e.g., Scan of internal network"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="user-metadata">User Metadata (JSON)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Inject user-specified JSON metadata into scan metadata</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="user-metadata"
                        placeholder='e.g., {"owner": "security-team", "purpose": "audit"}'
                        value={userMetadata}
                        onChange={(e) => setUserMetadata(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="quiet" checked={quiet} onCheckedChange={setQuiet} />
                        <Label htmlFor="quiet">Quiet (do not print status updates)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="disable-syslog" checked={disableSyslog} onCheckedChange={setDisableSyslog} />
                        <Label htmlFor="disable-syslog">Disable Syslog</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="additional">
                  <AccordionTrigger>Additional Options</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="config-file">Config File</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Read a configuration file (default: /etc/zmap/zmap.conf)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="config-file"
                          placeholder="e.g., /etc/zmap/zmap.conf"
                          value={configFile}
                          onChange={(e) => setConfigFile(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="max-sendto-failures">Max Sendto Failures</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Maximum NIC sendto failures before scan is aborted (default: -1)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="max-sendto-failures"
                          placeholder="e.g., -1"
                          value={maxSendtoFailures}
                          onChange={(e) => setMaxSendtoFailures(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="min-hitrate">Minimum Hitrate</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Minimum hitrate that scan can hit before scan is aborted (default: 0.0)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="min-hitrate"
                          placeholder="e.g., 0.0"
                          value={minHitrate}
                          onChange={(e) => setMinHitrate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="sender-threads">Sender Threads</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Threads used to send packets (default: 1)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="sender-threads"
                          placeholder="e.g., 1"
                          value={senderThreads}
                          onChange={(e) => setSenderThreads(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="cores">CPU Cores</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Comma-separated list of cores to pin to</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="cores"
                          placeholder="e.g., 0,1,2,3"
                          value={cores}
                          onChange={(e) => setCores(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2 self-end">
                        <Switch
                          id="ignore-invalid-hosts"
                          checked={ignoreInvalidHosts}
                          onCheckedChange={setIgnoreInvalidHosts}
                        />
                        <Label htmlFor="ignore-invalid-hosts">Ignore invalid hosts in whitelist/blacklist file</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  )
}

