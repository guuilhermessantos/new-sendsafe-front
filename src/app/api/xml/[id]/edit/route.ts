import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { xmlContent } = await request.json();

    if (!xmlContent) {
      return NextResponse.json({ error: 'XML content is required' }, { status: 400 });
    }

    // Mock response - in a real application, this would update the database
    const updatedFile = {
      id,
      filename: `document_${id}.xml`,
      size: xmlContent.length,
      type: 'DANFE' as const,
      createdAt: new Date().toISOString(),
      xmlContent
    };

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error editing XML file:', error);
    return NextResponse.json({ error: 'Failed to edit file' }, { status: 500 });
  }
}
