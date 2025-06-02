import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se estiver na página de reset-password e não tiver sessão, redireciona para login
  if (req.nextUrl.pathname === '/reset-password' && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verificar se é uma rota de administração
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Ignorar a rota de login
    if (req.nextUrl.pathname === '/admin/login') {
      return res;
    }

    // Verificar se o usuário está autenticado
    const adminAuth = req.cookies.get('adminAuth');
    
    if (!adminAuth) {
      // Redirecionar para a página de login se não estiver autenticado
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/reset-password', '/admin/:path*'],
}; 