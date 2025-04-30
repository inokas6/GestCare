import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Buscar fotos do usuário
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const query = 'SELECT * FROM user_fotos_barriga WHERE user_id = $1 ORDER BY mes ASC';
    const result = await pool.query(query, [userId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar fotos do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fotos do usuário' },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova foto
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, mes, url, descricao } = body;

    const query = `
      INSERT INTO user_fotos_barriga (user_id, mes, url, descricao, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const values = [userId, mes, url, descricao];
    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar foto:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar foto' },
      { status: 500 }
    );
  }
}

// DELETE - Remover foto
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da foto é obrigatório' },
        { status: 400 }
      );
    }

    const query = 'DELETE FROM user_fotos_barriga WHERE id = $1';
    await pool.query(query, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar foto' },
      { status: 500 }
    );
  }
} 