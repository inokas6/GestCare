import { supabase } from '../../lib/supabase';

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome');
  return { data, error };
} 