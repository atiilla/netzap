"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clipboard, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommandPreviewProps {
  command: string
}

export function CommandPreview({ command }: CommandPreviewProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    toast({
      title: "Command copied",
      description: "The ZMap command has been copied to your clipboard.",
    })
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Command Preview
            </CardTitle>
            <CardDescription>The equivalent ZMap command line</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <Clipboard className="h-4 w-4" />
            <span className="sr-only">Copy command</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="terminal">
          <div className="terminal-line">
            <span className="terminal-prompt">$ </span>
            <span className="terminal-command">{command || "zmap"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

