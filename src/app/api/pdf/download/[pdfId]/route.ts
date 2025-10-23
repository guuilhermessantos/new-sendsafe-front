import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { pdfId: string } }
) {
  try {
    const { pdfId } = params;

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Get query parameters
    const url = new URL(request.url);
    const inline = url.searchParams.get('inline') === 'true';

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/pdf/download/${pdfId}`, {
      method: 'GET',
      headers: {
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to download file' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    // Get the PDF content as a buffer
    const pdfBuffer = await response.arrayBuffer();
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `document_${pdfId}.pdf`
      : `document_${pdfId}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': inline 
          ? `inline; filename="${filename}"` 
          : `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error downloading PDF file:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
