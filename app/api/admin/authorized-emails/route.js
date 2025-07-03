import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Buscar todos os usuários registrados
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, nome, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      return NextResponse.json({ error: 'Erro ao carregar usuários' }, { status: 500 });
    }

    // Buscar emails autorizados
    const { data: authorizedEmails, error: authError } = await supabase
      .from('admin_authorized_emails')
      .select('email')
      .eq('is_active', true);

    if (authError) {
      console.error('Erro ao buscar emails autorizados:', authError);
      return NextResponse.json({ error: 'Erro ao carregar emails autorizados' }, { status: 500 });
    }

    const authorizedEmailList = authorizedEmails.map(item => item.email);

    // Marcar quais emails estão autorizados
    const usersWithAuthStatus = users.map(user => ({
      ...user,
      isAuthorized: authorizedEmailList.includes(user.email)
    }));

    return NextResponse.json({
      authorizedEmails: authorizedEmailList,
      users: usersWithAuthStatus
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { email, action } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    if (action === 'add') {
      // Verificar se o email já está autorizado
      const { data: existingEmail, error: checkError } = await supabase
        .from('admin_authorized_emails')
        .select('email')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (existingEmail) {
        return NextResponse.json({ error: 'Email já está autorizado' }, { status: 400 });
      }

      // Adicionar novo email autorizado
      const { error: insertError } = await supabase
        .from('admin_authorized_emails')
        .insert({
          email
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

    } else if (action === 'remove') {
      // Verificar se o email está autorizado
      const { data: existingEmail, error: checkError } = await supabase
        .from('admin_authorized_emails')
        .select('email')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (!existingEmail) {
        return NextResponse.json({ error: 'Email não está na lista de autorizados' }, { status: 400 });
      }

      // Desativar o email (soft delete)
      const { error: updateError } = await supabase
        .from('admin_authorized_emails')
        .update({ is_active: false })
        .eq('email', email);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Buscar lista atualizada de emails autorizados
    const { data: updatedAuthorizedEmails, error: fetchError } = await supabase
      .from('admin_authorized_emails')
      .select('email')
      .eq('is_active', true);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const authorizedEmailList = updatedAuthorizedEmails.map(item => item.email);

    return NextResponse.json({ 
      success: true, 
      authorizedEmails: authorizedEmailList,
      message: action === 'add' ? 'Email adicionado com sucesso' : 'Email removido com sucesso'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 