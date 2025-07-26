import type { Metadata } from "next"
import { NetZapInterface } from "@/components/netzap-interface"

export const metadata: Metadata = {
  title: "NetZap - ZMap GUI",
  description: "A comprehensive graphical interface for the ZMap network scanning tool",
}

export default function Home() {
  return <NetZapInterface />
}

