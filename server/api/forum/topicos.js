import { supabase } from '../../lib/supabase';

export async function getTopicos(categoriaId = null) {
  let query = supabase
    .from('topicos')
    .select(`
      id,
      titulo,
      conteudo,
      created_at,
      updated_at,
      user_id,
      categoria_id,
      users:user_id (
        id,
        nome,
        foto_perfil
      ),
      categorias:categoria_id (
        id,
        nome,
        cor,
        icone
      )
    `)
    .order('created_at', { ascending: false });

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data, error } = await query;
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
    .select(`
      id,
      titulo,
      conteudo,
      created_at,
      updated_at,
      user_id,
      categoria_id,
      users:user_id (
        id,
        nome,
        foto_perfil
      ),
      categorias:categoria_id (
        id,
        nome,
        cor,
        icone
      )
    `);
  return { data, error };
} 