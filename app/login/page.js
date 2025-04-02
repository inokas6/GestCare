'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Buscar informações do usuário logado
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      alert(`Bem-vindo, ${userData.nome}!`);
      router.push('/home');
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold">Entrar</h1>
          {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="Digite seu email" 
                className="input input-bordered" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Senha</span>
              </label>
              <input 
                type="password" 
                placeholder="Digite sua senha" 
                className="input input-bordered" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover">Esqueceu a senha?</a>
              </label>
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Login'}
              </button>
            </div>

            <div className="text-center">
              <Link className="label-text-alt link link-hover text-blue-500" href="/registo">
                Criar conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}