import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Esta é uma senha de exemplo. Em produção, você deve usar um banco de dados
// e hashear as senhas com bcrypt ou similar
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      return NextResponse.json({ token });
    }

    return NextResponse.json(
      { message: 'Credenciais inválidas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 