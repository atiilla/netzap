import { v4 as uuidv4 } from 'uuid';

// Define types for our database entities
export interface ScanResult {
  id: string;
  ip: string;
  port: number;
  protocol: string;
  status: string;
  scanId: string;
  timestamp: string;
}

export interface Scan {
  id: string;
  target: string;
  port: number | null;
  scanType: string;
  command: string;
  startTime: string;
  endTime: string | null;
  hostsScanned: number;
  hostsUp: number;
  status: 'in-progress' | 'completed' | 'failed';
  error?: string;
}

// In-memory storage using Maps
const scansStore = new Map<string, Scan>();
const resultsStore = new Map<string, ScanResult[]>();

// Create a new scan record
export async function createScan(data: Omit<Scan, 'id' | 'startTime' | 'status'>): Promise<Scan> {
  const id = uuidv4();
  const startTime = new Date().toISOString();
  
  const scan: Scan = {
    id,
    ...data,
    startTime,
    status: 'in-progress'
  };
  
  scansStore.set(id, scan);
  resultsStore.set(id, []); // Initialize empty results array
  
  return scan;
}

// Update a scan's status
export async function updateScanStatus(
  id: string, 
  status: 'in-progress' | 'completed' | 'failed',
  data: { hostsScanned?: number; hostsUp?: number; error?: string } = {}
): Promise<void> {
  const scan = scansStore.get(id);
  
  if (!scan) {
    throw new Error(`Scan with ID ${id} not found`);
  }
  
  // Update scan data
  scan.status = status;
  
  if (status === 'completed' || status === 'failed') {
    scan.endTime = new Date().toISOString();
  }
  
  if (data.hostsScanned !== undefined) {
    scan.hostsScanned = data.hostsScanned;
  }
  
  if (data.hostsUp !== undefined) {
    scan.hostsUp = data.hostsUp;
  }
  
  if (data.error !== undefined) {
    scan.error = data.error;
  }
  
  // Update in store
  scansStore.set(id, scan);
}

// Save scan results
export async function saveScanResults(results: Omit<ScanResult, 'id' | 'timestamp'>[]): Promise<void> {
  if (results.length === 0) return;
  
  const scanId = results[0].scanId;
  const existingResults = resultsStore.get(scanId) || [];
  const timestamp = new Date().toISOString();
  
  // Convert results to full ScanResult objects with IDs and timestamp
  const newResults: ScanResult[] = results.map(result => ({
    id: uuidv4(),
    ...result,
    timestamp
  }));
  
  // Add new results
  resultsStore.set(scanId, [...existingResults, ...newResults]);
  
  // Update hosts up count in the scan record
  const scan = scansStore.get(scanId);
  if (scan) {
    const openResults = newResults.filter(r => r.status === 'open');
    scan.hostsUp = (scan.hostsUp || 0) + openResults.length;
    scansStore.set(scanId, scan);
  }
}

// Get all scans
export async function getAllScans(): Promise<Scan[]> {
  return Array.from(scansStore.values()).sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

// Get a specific scan by ID
export async function getScanById(id: string): Promise<Scan | null> {
  return scansStore.get(id) || null;
}

// Get results for a specific scan
export async function getScanResults(scanId: string): Promise<ScanResult[]> {
  const results = resultsStore.get(scanId) || [];
  
  // Sort by IP and port
  return [...results].sort((a, b) => {
    // First compare by IP
    const ipComparison = a.ip.localeCompare(b.ip);
    if (ipComparison !== 0) return ipComparison;
    
    // If IPs are the same, compare by port
    return a.port - b.port;
  });
}

// Delete a scan and its results
export async function deleteScan(id: string): Promise<void> {
  scansStore.delete(id);
  resultsStore.delete(id);
}

// Reset all data (useful for testing)
export async function resetDatabase(): Promise<void> {
  scansStore.clear();
  resultsStore.clear();
} 