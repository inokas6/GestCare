import { supabase } from '../../lib/supabase';

export async function addReacao(tipo, userId, topicoId = null, respostaId = null) {
  const { data, error } = await supabase
    .from('reacoes')
    .insert([
      {
        tipo,
        user_id: userId,
        topico_id: topicoId,
        resposta_id: respostaId
      }
    ])
    .select();
  return { data, error };
} 