import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversionId: string } }
) {
  try {
    const { conversionId } = params;

    // Mock status - in a real application, this would check the actual job status
    const mockStatus = {
      id: conversionId,
      status: 'processing' as const,
      totalFiles: 10,
      processedFiles: Math.floor(Math.random() * 10),
      failedFiles: Math.floor(Math.random() * 2),
      createdAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(), // Random time in last hour
      completedAt: null as string | null,
      files: Array.from({ length: 10 }, (_, i) => ({
        id: `file_${i + 1}`,
        filename: `document_${i + 1}.xml`,
        status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)] as 'pending' | 'processing' | 'completed' | 'failed',
        error: Math.random() > 0.8 ? 'Processing error' : null,
      }))
    };

    // Simulate completion after some time
    if (mockStatus.processedFiles === mockStatus.totalFiles) {
      mockStatus.status = 'completed';
      mockStatus.completedAt = new Date().toISOString();
    }

    return NextResponse.json(mockStatus);
  } catch (error) {
    console.error('Error getting bulk conversion status:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
