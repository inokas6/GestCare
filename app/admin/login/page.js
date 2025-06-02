'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const authorizedEmails = ['ineslaramiranda6@gmail.com'];

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminAuth = localStorage.getItem('adminAuth');
        
        if (session && adminAuth) {
          if (isMounted) {
            router.replace('/admin');
          }
        } else {
          if (isMounted) {
            setIsChecking(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando processo de login...');

      // Verificar se o email está autorizado
      if (!authorizedEmails.includes(email)) {
        throw new Error('Email não autorizado para acesso administrativo');
      }

      console.log('Email autorizado, tentando login com Supabase...');

      // Tentar fazer login com o Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Erro no login Supabase:', signInError);
        throw signInError;
      }

      console.log('Login Supabase bem sucedido, buscando dados do usuário...');

      // Buscar informações do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        throw userError;
      }

      if (!userData) {
        throw new Error('Usuário não encontrado');
      }

      console.log('Login bem sucedido, salvando dados e redirecionando...');

      // Salvar no localStorage
      localStorage.setItem('adminAuth', JSON.stringify({ 
        email,
        userId: userData.id,
        timestamp: new Date().toISOString()
      }));
      
      // Redirecionar para o dashboard
      router.replace('/admin');

    } catch (err) {
      console.error('Erro detalhado no login:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Área de Administração
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o painel administrativo
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 