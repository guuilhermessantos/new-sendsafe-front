import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/xml/upload`, {
      method: 'POST',
      headers: {
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to upload file' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const xmlFile = await response.json();
    return NextResponse.json(xmlFile);
  } catch (error) {
    console.error('Error uploading XML file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
