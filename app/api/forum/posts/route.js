import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        categoriaId: parseInt(categoriaId),
      },
      include: {
        autor: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        dataCriacao: 'desc',
      },
    });

    const postsFormatados = posts.map(post => ({
      id: post.id,
      titulo: post.titulo,
      conteudo: post.conteudo,
      autor: post.autor.nome,
      dataCriacao: post.dataCriacao,
    }));

    return NextResponse.json(postsFormatados);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
} 