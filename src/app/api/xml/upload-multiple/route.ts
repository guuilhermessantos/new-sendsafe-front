import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://back-sendsafe.onrender.com';

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo requisição de upload múltiplo');
    const formData = await request.formData();
    console.log('FormData recebido com', formData.getAll('xmlFiles').length, 'arquivos');
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    console.log('Header de autorização:', authHeader ? 'Presente' : 'Ausente');
    
    // Forward the request to the backend
    console.log('Enviando para backend:', `${BACKEND_URL}/api/xml/upload-multiple`);
    const response = await fetch(`${BACKEND_URL}/api/xml/upload-multiple`, {
      method: 'POST',
      headers: {
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: formData,
    });

    console.log('Resposta do backend:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to upload files' }));
      console.error('Erro do backend:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const result = await response.json();
    console.log('Resultado do backend:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading multiple XML files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}

