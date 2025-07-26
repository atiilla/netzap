"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Search, ArrowUpDown, RefreshCcw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface ScanResult {
  id: string
  ip: string
  port: number
  protocol: string
  status: string
  scanId: string
  timestamp: string
}

export function ScanResults({ scanId }: { scanId?: string }) {
  const { toast } = useToast()
  const [results, setResults] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof ScanResult>("ip")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedScanId, setSelectedScanId] = useState<string | undefined>(scanId)

  const fetchResults = async () => {
    if (!selectedScanId) return
    
    setLoading(true)
    try {
      // Fetch results from the API
      const response = await fetch(`/api/results?scanId=${selectedScanId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch scan results')
      }
      
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Error fetching results:', error)
      toast({
        title: "Error",
        description: "Failed to load scan results",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshResults = () => {
    fetchResults()
  }

  useEffect(() => {
    if (selectedScanId) {
      fetchResults()
    }
  }, [selectedScanId])

  const handleSort = (field: keyof ScanResult) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const downloadCSV = () => {
    if (!results.length) return
    
    // Create CSV content
    const headers = ['IP', 'Port', 'Protocol', 'Status', 'Timestamp']
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
    ]
    
    const csvContent = csvRows.join('\n')
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `scan-results-${selectedScanId}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredResults = results.filter(
    (result) =>
      result.ip.includes(searchTerm) ||
      result.port.toString().includes(searchTerm) ||
      result.status.includes(searchTerm) ||
      result.protocol.includes(searchTerm),
  )

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Results</CardTitle>
        <CardDescription>View and analyze discovered hosts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search results..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={!results.length} 
            onClick={downloadCSV}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download results</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshResults}
            disabled={loading || !selectedScanId}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh results</span>
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("ip")} className="cursor-pointer">
                  IP Address
                  {sortField === "ip" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                </TableHead>
                <TableHead onClick={() => handleSort("port")} className="cursor-pointer">
                  Port
                  {sortField === "port" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                </TableHead>
                <TableHead onClick={() => handleSort("protocol")} className="cursor-pointer">
                  Protocol
                  {sortField === "protocol" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                </TableHead>
                <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                  Status
                  {sortField === "status" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                </TableHead>
                <TableHead onClick={() => handleSort("timestamp")} className="cursor-pointer text-right">
                  Timestamp
                  {sortField === "timestamp" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sortedResults.length > 0 ? (
                sortedResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-mono">{result.ip}</TableCell>
                    <TableCell>{result.port}</TableCell>
                    <TableCell>{result.protocol}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${
                          result.status === "open"
                            ? "bg-green-500"
                            : result.status === "closed"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        } mr-2`}
                      ></span>
                      {result.status}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(result.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {selectedScanId 
                      ? "No results found. The scan may still be in progress."
                      : "Please select a scan to view results."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

