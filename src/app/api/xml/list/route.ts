import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock data - in a real application, this would come from a database
    const mockFiles = Array.from({ length: 25 }, (_, i) => ({
      id: (i + 1).toString(),
      filename: `document_${i + 1}.xml`,
      originalName: `document_${i + 1}.xml`,
      size: Math.floor(Math.random() * 1000000) + 10000,
      uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const files = mockFiles.slice(startIndex, endIndex);
    const total = mockFiles.length;

    return NextResponse.json({
      files,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error listing XML files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
