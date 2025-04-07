import { supabase } from '../../lib/supabase';

export async function getRespostas(topicoId) {
  const { data, error } = await supabase
    .from('respostas')
    .select(`
      *,
      users:nome,
      reacoes:reacoes(count)
    `)
    .eq('topico_id', topicoId)
    .order('created_at', { ascending: true });

  if (data) {
    data.forEach(resposta => {
      resposta.reacoes = resposta.reacoes?.[0]?.count || 0;
    });
  }

  return { data, error };
}

export async function addResposta(conteudo, topicoId, userId) {
  const { data, error } = await supabase
    .from('respostas')
    .insert([
      {
        conteudo,
        topico_id: topicoId,
        user_id: userId
      }
    ])
    .select();
  return { data, error };
} 