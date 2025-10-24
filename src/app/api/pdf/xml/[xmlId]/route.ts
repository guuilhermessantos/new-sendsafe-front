import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ xmlId: string }> }
) {
  try {
    const { xmlId } = await params;

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/pdf/xml/${xmlId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to list PDFs' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing PDFs for XML:', error);
    return NextResponse.json({ error: 'Failed to list PDFs' }, { status: 500 });
  }
}
