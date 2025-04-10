import { supabase } from '../../lib/supabase';
import { NextResponse } from 'next/server';

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem', { ascending: true })
    .eq('ativa', true);
  return { data, error };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('ordem', { ascending: true })
      .eq('ativa', true);

    if (error) {
      return NextResponse.json(
        { error: 'Falha ao buscar categorias' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}