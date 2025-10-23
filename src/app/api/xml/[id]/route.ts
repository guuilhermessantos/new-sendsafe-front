import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock data - in a real application, this would come from a database
    const mockFile = {
      id,
      filename: `document_${id}.xml`,
      size: Math.floor(Math.random() * 1000000) + 10000,
      type: 'DANFE' as const,
      createdAt: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <document>
    <id>${id}</id>
    <content>Mock XML content for document ${id}</content>
  </document>
</root>`
    };

    return NextResponse.json(mockFile);
  } catch (error) {
    console.error('Error getting XML file:', error);
    return NextResponse.json({ error: 'Failed to get file' }, { status: 500 });
  }
}
