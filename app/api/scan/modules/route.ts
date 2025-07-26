import { NextResponse } from 'next/server';

/**
 * Endpoint to get available ZMap probe modules
 */
export async function GET() {
  try {
    // Fetch probe modules from ZMap SDK API
    const response = await fetch('http://netzap-backend:8000/probe-modules', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Failed to fetch probe modules: ${response.status} ${response.statusText}`
      }, { status: response.status });
    }

    const modules = await response.json();
    
    return NextResponse.json({
      status: 'success',
      probe_modules: modules
    });
  } catch (error: any) {
    console.error('Error fetching probe modules:', error);
    return NextResponse.json({
      status: 'error',
      message: `Failed to fetch probe modules: ${error.message}`
    }, { status: 500 });
  }
} 