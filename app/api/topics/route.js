import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('topicos')
      .select(`
        id,
        titulo,
        conteudo,
        created_at,
        updated_at,
        user_id,
        categoria_id,
        users!fk_user (
          nome,
          email
        ),
        categorias!fk_categoria (
          nome
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tópicos:', error);
      throw error;
    }

    // Transformar os dados para um formato mais fácil de usar
    const formattedData = data.map(topic => ({
      id: topic.id,
      titulo: topic.titulo,
      conteudo: topic.conteudo,
      created_at: topic.created_at,
      updated_at: topic.updated_at,
      autor: topic.users?.nome || 'Utilizador Desconhecido',
      categoria: topic.categorias?.nome || 'Sem Categoria'
    }));

    return Response.json(formattedData);
  } catch (error) {
    console.error('Erro na API:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 