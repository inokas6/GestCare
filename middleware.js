import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  // Verifica se a rota é do admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Se for a página de login, permite o acesso
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Para outras rotas do admin, permitimos o acesso
    // A verificação do token será feita no lado do cliente
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 