import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/xml/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get file' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const xmlFile = await response.json();
    return NextResponse.json(xmlFile);
  } catch (error) {
    console.error('Error getting XML file:', error);
    return NextResponse.json({ error: 'Failed to get file' }, { status: 500 });
  }
}
