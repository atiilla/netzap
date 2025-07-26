"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NetworkMapProps {
  scanId?: string;
}

export function NetworkMap({ scanId }: NetworkMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw network map
    drawNetworkMap(ctx, canvas.width, canvas.height)

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !ctx) return

      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawNetworkMap(ctx, canvas.width, canvas.height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [scanId])

  const drawNetworkMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 1

    const gridSize = 20
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw central node (scanner)
    ctx.fillStyle = "hsl(var(--primary))"
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, 20, 0, Math.PI * 2)
    ctx.fill()

    // Generate random nodes
    const nodeCount = 50
    const nodes: { x: number; y: number; size: number; status: "up" | "down" | "filtered" }[] = []

    for (let i = 0; i < nodeCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 50 + Math.random() * (Math.min(width, height) / 2 - 100)

      const x = width / 2 + Math.cos(angle) * distance
      const y = height / 2 + Math.sin(angle) * distance
      const size = 3 + Math.random() * 5
      const status = Math.random() > 0.7 ? "up" : Math.random() > 0.5 ? "down" : "filtered"

      nodes.push({ x, y, size, status })
    }

    // Draw connections
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1

    for (const node of nodes) {
      ctx.beginPath()
      ctx.moveTo(width / 2, height / 2)
      ctx.lineTo(node.x, node.y)
      ctx.stroke()
    }

    // Draw nodes
    for (const node of nodes) {
      ctx.fillStyle =
        node.status === "up"
          ? "hsl(var(--success))"
          : node.status === "down"
            ? "hsl(var(--destructive))"
            : "hsl(var(--warning))"
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw legend
    ctx.fillStyle = "hsl(var(--primary))"
    ctx.beginPath()
    ctx.arc(30, height - 30, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "hsl(var(--success))"
    ctx.beginPath()
    ctx.arc(30, height - 50, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "hsl(var(--destructive))"
    ctx.beginPath()
    ctx.arc(30, height - 70, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "hsl(var(--warning))"
    ctx.beginPath()
    ctx.arc(30, height - 90, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "hsl(var(--foreground))"
    ctx.font = "12px sans-serif"
    ctx.fillText("Scanner", 45, height - 27)
    ctx.fillText("Host Up", 45, height - 47)
    ctx.fillText("Host Down", 45, height - 67)
    ctx.fillText("Filtered", 45, height - 87)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Map</CardTitle>
        <CardDescription>Visual representation of scanned hosts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[500px] w-full rounded-md border">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

