import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 