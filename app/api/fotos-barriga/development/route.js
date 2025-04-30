import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = 'SELECT * FROM fotos_barriga_meses ORDER BY mes ASC';
    const result = await pool.query(query);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar fotos de desenvolvimento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fotos de desenvolvimento' },
      { status: 500 }
    );
  }
} 