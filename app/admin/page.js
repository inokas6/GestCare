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
  const authorizedEmails = ['ineslaramiranda6@gmail.com'];
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const adminAuth = localStorage.getItem('adminAuth');
        
        if (adminAuth) {
          const authData = JSON.parse(adminAuth);
          
          // Verificar se o token não expirou
          const tokenTimestamp = new Date(authData.timestamp);
          const now = new Date();
          const hoursDiff = (now - tokenTimestamp) / (1000 * 60 * 60);

          if (hoursDiff <= 24 && authorizedEmails.includes(authData.email)) {
            if (isMounted) {
              router.replace('/admin/home');
            }
            return;
          } else {
            // Se o token expirou ou o email não está autorizado, limpa o localStorage
            localStorage.removeItem('adminAuth');
          }
        }

        if (isMounted) {
          setIsChecking(false);
        }
      } catch (error) {
        // Silenciosamente limpar autenticação e continuar
        if (isMounted) {
          localStorage.removeItem('adminAuth');
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
      // Verificar se o email está autorizado
      if (!authorizedEmails.includes(email)) {
        throw new Error('Email não autorizado para acesso administrativo');
      }

      // Tentar fazer login com o Supabase
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      if (!session) {
        throw new Error('Falha na autenticação');
      }

      // Procurar informações do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User não encontrado');
      }

      // Salvar dados de autenticação no localStorage
      const authData = {
        email,
        userId: userData.id,
        timestamp: new Date().toISOString(),
        session: session
      };
      
      localStorage.setItem('adminAuth', JSON.stringify(authData));
      
      // Redirecionar para o dashboard
      router.push('/admin/home');
      router.refresh(); // Força atualização da página

    } catch (err) {
      // Mostrar apenas mensagens de erro amigáveis ao utilizador
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-black">...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-700 bg-clip-text text-transparent">
              Admin
            </h1>
            <p className="text-black mt-2">Faça login para aceder</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-700 text-white py-2 px-4 rounded-lg hover:from-pink-700 hover:to-rose-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'A fazer login...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}