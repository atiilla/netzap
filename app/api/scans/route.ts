import { NextResponse } from 'next/server';
import { getAllScans } from '@/lib/db';

export async function GET() {
  try {
    const scans = await getAllScans();
    
    return NextResponse.json({
      success: true,
      scans
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
} 