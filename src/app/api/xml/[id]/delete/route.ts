import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock response - in a real application, this would delete from database and storage
    console.log(`Deleting XML file with id: ${id}`);

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting XML file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
