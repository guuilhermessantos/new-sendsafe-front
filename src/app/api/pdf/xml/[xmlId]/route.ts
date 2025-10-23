import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { xmlId: string } }
) {
  try {
    const { xmlId } = params;

    // Mock data - in a real application, this would come from a database
    const mockPdfFiles = [
      {
        id: `pdf_${xmlId}_1`,
        filename: `document_${xmlId}_DANFE.pdf`,
        xmlId,
        type: 'DANFE' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      },
      {
        id: `pdf_${xmlId}_2`,
        filename: `document_${xmlId}_CTE.pdf`,
        xmlId,
        type: 'CTE' as const,
        createdAt: new Date().toISOString(),
      }
    ];

    return NextResponse.json(mockPdfFiles);
  } catch (error) {
    console.error('Error listing PDFs for XML:', error);
    return NextResponse.json({ error: 'Failed to list PDFs' }, { status: 500 });
  }
}
