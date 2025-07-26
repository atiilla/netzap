import { NextResponse } from 'next/server';

/**
 * Create a blocklist file for IP scanning
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { subnets = [], output_file = "" } = body;
    
    if (!subnets || subnets.length === 0) {
      return NextResponse.json(
        { error: 'Subnets are required' },
        { status: 400 }
      );
    }
    
    // Call ZMap SDK API to create blocklist
    const response = await fetch('http://netzap-backend:8000/blocklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subnets,
        output_file
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to create blocklist' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      file_path: result.file_path,
      message: result.message
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a standard blocklist file
 */
export async function GET() {
  try {
    // Call ZMap SDK API to create standard blocklist
    const response = await fetch('http://netzap-backend:8000/standard-blocklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to create standard blocklist' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      file_path: result.file_path,
      message: result.message
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
} 