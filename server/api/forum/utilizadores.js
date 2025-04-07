import { supabase } from '../../lib/supabase';

export async function getTopUsers() {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      topicos:topicos(count),
      respostas:respostas(count)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (data) {
    data.forEach(user => {
      user.topicos = user.topicos?.[0]?.count || 0;
      user.respostas = user.respostas?.[0]?.count || 0;
    });
  }

  return { data, error };
} 