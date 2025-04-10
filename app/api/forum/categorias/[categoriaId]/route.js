import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { categoriaId } = params;

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://sua-api.com/categorias/${categoriaId}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: response.status }
      );
    }

    const categoria = await response.json();

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categoria' },
      { status: 500 }
    );
  }
}
