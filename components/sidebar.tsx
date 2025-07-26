"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Cog, Database, Github, Network } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    {
      id: "scan",
      label: "Scan Configuration",
      icon: <Network className="h-5 w-5" />,
    },
    {
      id: "results",
      label: "Scan Results",
      icon: <Database className="h-5 w-5" />,
    },
    {
      id: "history",
      label: "Scan History",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Cog className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-full flex-col border-r">
      <ScrollArea className="flex-1">
        <div className="px-2 py-4">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">NetZap</h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className="rounded-md bg-secondary p-4">
          <a 
            href="https://github.com/atiilla"
            target="_blank"
            rel="noopener noreferrer" 
            className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="mr-2 h-5 w-5" />
            Follow me on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

