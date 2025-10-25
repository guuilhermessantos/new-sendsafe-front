import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://back-sendsafe.onrender.com';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ xmlId: string }> }
) {
  try {
    const { xmlId } = await params;

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/pdf/convert/${xmlId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to convert file' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error converting XML to PDF:', error);
    return NextResponse.json({ error: 'Failed to convert file' }, { status: 500 });
  }
}
