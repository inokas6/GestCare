import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Configurar o transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true para porta 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { titulo, conteudo, destinatarios, selectedUsers } = await request.json();

    // Buscar emails dos destinatários
    let query = supabase.from('users').select('email');
    
    if (destinatarios === 'selecionados' && selectedUsers.length > 0) {
      query = query.in('id', selectedUsers);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) throw usersError;

    // Enviar email para cada destinatário
    const emailPromises = users.map(user => 
      transporter.sendMail({
        from: process.env.SMTP_FROM || 'Newsletter <newsletter@seudominio.com>',
        to: user.email,
        subject: titulo,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">${titulo}</h1>
            <div style="color: #666; line-height: 1.6;">
              ${conteudo}
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
              <p>Para cancelar a subscrição, clique <a href="#">aqui</a>.</p>
            </div>
          </div>
        `
      })
    );

    await Promise.all(emailPromises);

    // Registrar o envio no banco de dados
    const { error: logError } = await supabase
      .from('newsletter_logs')
      .insert({
        titulo,
        conteudo,
        destinatarios_count: users.length,
        enviado_em: new Date().toISOString()
      });

    if (logError) throw logError;

    return Response.json({ 
      message: 'Newsletter enviada com sucesso',
      destinatarios: users.length
    });
  } catch (error) {
    console.error('Erro ao enviar newsletter:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 