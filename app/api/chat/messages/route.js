import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// DELETE - Apagar mensagem do chat
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json(
        { error: 'ID da mensagem é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar se o utilizador está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Tentativa de autenticação - User:', user?.id, 'Error:', authError);
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Utilizador não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se a mensagem existe e se o utilizador é o autor
    const { data: message, error: fetchError } = await supabase
      .from('respostas')
      .select('user_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o utilizador é o autor da mensagem
    if (message.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Não tem permissão para apagar esta mensagem' },
        { status: 403 }
      );
    }

    // Apagar a mensagem
    const { error: deleteError } = await supabase
      .from('respostas')
      .delete()
      .eq('id', messageId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem apagada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao apagar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao apagar mensagem' },
      { status: 500 }
    );
  }
} 