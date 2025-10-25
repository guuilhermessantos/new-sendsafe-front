import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    // Buscar dados reais do backend
    const response = await fetch(`${BACKEND_URL}/api/analytics/cfop-distribution`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend retornou erro: ${response.status}`);
    }

    const result = await response.json();
    
    // Verificar se o resultado contém erro
    if (result.error) {
      throw new Error(`Backend retornou erro: ${result.error}`);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro no endpoint cfop-distribution:', error);
    
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados do backend' },
      { status: 500 }
    );
  }
}
