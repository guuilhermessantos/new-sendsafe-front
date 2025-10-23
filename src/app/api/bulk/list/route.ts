import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - in a real application, this would come from a database
    const mockConversions = Array.from({ length: 5 }, (_, i) => ({
      id: `bulk_${Date.now() - i * 24 * 60 * 60 * 1000}`,
      status: ['completed', 'processing', 'failed'][Math.floor(Math.random() * 3)] as 'completed' | 'processing' | 'failed',
      totalFiles: Math.floor(Math.random() * 50) + 10,
      processedFiles: Math.floor(Math.random() * 50) + 5,
      failedFiles: Math.floor(Math.random() * 5),
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: Math.random() > 0.3 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000).toISOString() : null,
    }));

    return NextResponse.json(mockConversions);
  } catch (error) {
    console.error('Error listing bulk conversions:', error);
    return NextResponse.json({ error: 'Failed to list conversions' }, { status: 500 });
  }
}
