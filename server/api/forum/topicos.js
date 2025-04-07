import { supabase } from '../../lib/supabase';

export async function getTopicos(categoriaId = null) {
  let query = supabase
    .from('topicos')
    .select(`
      *,
      users!inner (
        id,
        nome,
        foto_perfil
      ),
      categorias!inner (
        id,
        nome
      ),
      respostas:respostas(count)
    `)
    .order('created_at', { ascending: false });

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data, error } = await query;

  if (data) {
    data.forEach(topico => {
      topico.respostas = topico.respostas?.[0]?.count || 0;
    });
  }

  return { data, error };
}

export async function createTopico(titulo, conteudo, categoriaId, userId) {
  const { data, error } = await supabase
    .from('topicos')
    .insert([
      {
        titulo,
        conteudo,
        categoria_id: categoriaId,
        user_id: userId
      }
    ])
    .select();
  return { data, error };
} 