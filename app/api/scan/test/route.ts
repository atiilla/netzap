import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify connectivity with ZMap backend
 */
export async function GET() {
  try {
    // Try to connect to the ZMap backend
    const response = await fetch('http://netzap-backend:8000/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return results
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'success',
        connected: true,
        backend_info: data
      });
    } else {
      return NextResponse.json({
        status: 'error',
        connected: false,
        message: `Failed to connect to ZMap backend: ${response.status} ${response.statusText}`
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      status: 'error',
      connected: false,
      message: `Connection error: ${error.message}`
    }, { status: 500 });
  }
} 