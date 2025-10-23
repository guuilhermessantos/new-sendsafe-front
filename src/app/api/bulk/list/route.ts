import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - in a real application, this would come from a database
    const mockConversions = Array.from({ length: 5 }, (_, i) => ({
      id: `bulk_${Date.now() - i * 24 * 60 * 60 * 1000}`,
      status: ['completed', 'processing', 'failed'][Math.floor(Math.random() * 3)] as 'completed' | 'processing' | 'failed',
      totalFiles: Math.floor(Math.random() * 50) + 10,
      processedFiles: Math.floor(Math.random() * 50) + 5,
      errorFiles: Math.floor(Math.random() * 5),
      progress: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: Math.random() > 0.3 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000).toISOString() : undefined,
    }));

    // Retornar estrutura com conversões e paginação
    const response = {
      conversions: Array.isArray(mockConversions) ? mockConversions : [],
      pagination: {
        page: 1,
        limit: 10,
        total: mockConversions.length,
        pages: 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing bulk conversions:', error);
    return NextResponse.json({ 
      conversions: [], 
      pagination: { page: 1, limit: 10, total: 0, pages: 0 } 
    }, { status: 500 });
  }
}
