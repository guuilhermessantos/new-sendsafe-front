import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock XML content - in a real application, this would be read from storage
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <document>
    <id>${id}</id>
    <content>Mock XML content for document ${id}</content>
    <timestamp>${new Date().toISOString()}</timestamp>
  </document>
</root>`;

    const filename = `document_${id}.xml`;

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading XML file:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
