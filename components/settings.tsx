"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export function Settings() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="defaults">Default Values</TabsTrigger>
        <TabsTrigger value="paths">Paths & Files</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic ZMap settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zmap-path">ZMap Executable Path</Label>
              <Input id="zmap-path" defaultValue="/usr/local/bin/zmap" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-interface">Default Network Interface</Label>
              <Select defaultValue="eth0">
                <SelectTrigger id="default-interface">
                  <SelectValue placeholder="Select interface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth0">eth0</SelectItem>
                  <SelectItem value="wlan0">wlan0</SelectItem>
                  <SelectItem value="en0">en0</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-save" defaultChecked />
              <Label htmlFor="auto-save">Automatically save scan results</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="confirm-start" defaultChecked />
              <Label htmlFor="confirm-start">Confirm before starting scan</Label>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="defaults">
        <Card>
          <CardHeader>
            <CardTitle>Default Values</CardTitle>
            <CardDescription>Set default values for common scan parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-bandwidth">Default Bandwidth (Mbps)</Label>
                <Input id="default-bandwidth" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-cooldown">Default Cooldown Time (seconds)</Label>
                <Input id="default-cooldown" type="number" defaultValue="8" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-probes">Default Probes per IP</Label>
                <Input id="default-probes" type="number" defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-retries">Default Retries</Label>
                <Input id="default-retries" type="number" defaultValue="10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-probe-module">Default Probe Module</Label>
              <Select defaultValue="tcp_synscan">
                <SelectTrigger id="default-probe-module">
                  <SelectValue placeholder="Select probe module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp_synscan">tcp_synscan</SelectItem>
                  <SelectItem value="icmp_echo">icmp_echo</SelectItem>
                  <SelectItem value="udp">udp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-output-module">Default Output Module</Label>
              <Select defaultValue="csv">
                <SelectTrigger id="default-output-module">
                  <SelectValue placeholder="Select output module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="csv">csv</SelectItem>
                  <SelectItem value="json">json</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="paths">
        <Card>
          <CardHeader>
            <CardTitle>Paths & Files</CardTitle>
            <CardDescription>Configure file paths and locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="output-dir">Default Output Directory</Label>
              <Input id="output-dir" defaultValue="~/zmap-results" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blacklist-path">Default Blacklist File</Label>
              <Input id="blacklist-path" defaultValue="/etc/zmap/blacklist.conf" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config-path">Default Config File</Label>
              <Input id="config-path" defaultValue="/etc/zmap/zmap.conf" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-dir">Default Log Directory</Label>
              <Input id="log-dir" defaultValue="/var/log/zmap" />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

