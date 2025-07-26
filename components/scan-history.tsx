"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowUpDown, 
  Download, 
  Trash2, 
  RefreshCcw, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Clock 
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export interface Scan {
  id: string
  target: string
  port: number
  scanType: string
  command: string
  startTime: string
  endTime: string | null
  hostsScanned: number
  hostsUp: number
  status: 'in-progress' | 'completed' | 'failed'
  error?: string
}

export function ScanHistory() {
  const { toast } = useToast()
  const router = useRouter()
  const [history, setHistory] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof Scan>("startTime")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [scanToDelete, setScanToDelete] = useState<string | null>(null)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scans')
      
      if (!response.ok) {
        throw new Error('Failed to fetch scan history')
      }
      
      const data = await response.json()
      setHistory(data.scans || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      toast({
        title: "Error",
        description: "Failed to load scan history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    
    // Set up polling for in-progress scans
    const interval = setInterval(() => {
      if (history.some(scan => scan.status === 'in-progress')) {
        fetchHistory()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSort = (field: keyof Scan) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleViewResults = (scanId: string) => {
    router.push(`/results?scanId=${scanId}`)
  }

  const handleDeleteClick = (scanId: string) => {
    setScanToDelete(scanId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!scanToDelete) return
    
    try {
      const response = await fetch(`/api/scans/${scanToDelete}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete scan')
      }
      
      // Remove from local state
      setHistory(history.filter(scan => scan.id !== scanToDelete))
      
      toast({
        title: "Success",
        description: "Scan deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting scan:', error)
      toast({
        title: "Error",
        description: "Failed to delete scan",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setScanToDelete(null)
    }
  }

  const downloadResults = async (scanId: string) => {
    try {
      const response = await fetch(`/api/results/download?scanId=${scanId}`)
      
      if (!response.ok) {
        throw new Error('Failed to download results')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `scan-results-${scanId}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading results:', error)
      toast({
        title: "Error",
        description: "Failed to download results",
        variant: "destructive",
      })
    }
  }

  const sortedHistory = [...history].sort((a, b) => {
    if (sortField === "startTime" || sortField === "endTime") {
      const aTime = new Date(a[sortField] || 0).getTime()
      const bTime = new Date(b[sortField] || 0).getTime()
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime
    }

    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })
  
  // Statistics for the summary tab
  const totalScans = history.length
  const totalHostsScanned = history.reduce((sum, scan) => sum + scan.hostsScanned, 0)
  const totalHostsFound = history.reduce((sum, scan) => sum + scan.hostsUp, 0)
  const totalScanTime = history.reduce((sum, scan) => {
    if (!scan.endTime) return sum
    const duration = (new Date(scan.endTime).getTime() - new Date(scan.startTime).getTime()) / 1000
    return sum + duration
  }, 0)

  const renderStatusBadge = (status: 'in-progress' | 'completed' | 'failed') => {
    switch (status) {
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        )
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>View and manage your previous network scans</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchHistory}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh history</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort("startTime")} className="cursor-pointer">
                        Date
                        {sortField === "startTime" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort("target")} className="cursor-pointer">
                        Target
                        {sortField === "target" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort("port")} className="cursor-pointer">
                        Port
                        {sortField === "port" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                        Status
                        {sortField === "status" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort("hostsScanned")} className="cursor-pointer">
                        Hosts Scanned
                        {sortField === "hostsScanned" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                      </TableHead>
                      <TableHead onClick={() => handleSort("hostsUp")} className="cursor-pointer">
                        Hosts Up
                        {sortField === "hostsUp" && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : sortedHistory.length > 0 ? (
                      sortedHistory.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell>
                            {new Date(scan.startTime).toLocaleDateString()} {new Date(scan.startTime).toLocaleTimeString()}
                          </TableCell>
                          <TableCell className="font-mono">{scan.target}</TableCell>
                          <TableCell>{scan.port || '-'}</TableCell>
                          <TableCell>
                            {renderStatusBadge(scan.status)}
                          </TableCell>
                          <TableCell>{scan.hostsScanned}</TableCell>
                          <TableCell>{scan.hostsUp}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewResults(scan.id)}
                              >
                                <Search className="h-4 w-4" />
                                <span className="sr-only">View Results</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => downloadResults(scan.id)}
                                disabled={scan.status === 'in-progress' || scan.hostsUp === 0}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClick(scan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No scan history found. Start a new scan to see results here.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="summary">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalScans}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hosts Scanned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalHostsScanned}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hosts Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalHostsFound}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Scan Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(totalScanTime / 60)} min
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scan and all of its results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

