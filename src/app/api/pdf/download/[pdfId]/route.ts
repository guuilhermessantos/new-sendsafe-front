import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pdfId: string } }
) {
  try {
    const { pdfId } = params;

    // Mock PDF content - in a real application, this would be read from storage
    // For now, we'll return a simple text file as a placeholder
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Converted PDF for ${pdfId}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    const filename = `document_${pdfId}.pdf`;

    // Verificar se é uma requisição para visualização inline
    const url = new URL(request.url);
    const inline = url.searchParams.get('inline') === 'true';

    return new NextResponse(pdfContent, {
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
