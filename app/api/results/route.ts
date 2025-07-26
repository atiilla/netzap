import { NextResponse } from 'next/server';
import { getScanResults, getScanById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('scanId');
    
    if (!scanId) {
      return NextResponse.json(
        { error: 'Scan ID is required' },
        { status: 400 }
      );
    }
    
    // Check if scan exists
    const scan = await getScanById(scanId);
    
    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }
    
    const results = await getScanResults(scanId);
    
    return NextResponse.json({
      success: true,
      results,
      scanInfo: scan
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
} 