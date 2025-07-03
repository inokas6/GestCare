'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, insira seu email para recuperar a password');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setResetEmailSent(true);
      setError('');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      setError('Erro ao enviar email de recuperação. Tente novamente.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Buscar informações do user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) {
        if (userError.message.includes('multiple (or no) rows returned')) {
          setError('Conta não criada, criar conta para continuar');
        } else {
          throw userError;
        }
      }

      if (!userData) {
        setError('Conta não criada');
        return;
      }

      setUserName(userData.nome);
      setShowWelcomeModal(true);
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.message.includes('Email not confirmed')) {
        setError('Email não confirmado, por favor confirmar');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique seu email e password.');
      } else if (error.message.includes('Too many requests')) {
        setError('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
      } else if (error.message.includes('User not found')) {
        setError('Utilizador não encontrado. Verifique seu email.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="Digite seu email" 
                className="input input-bordered text-black" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Password</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="password" 
                  className="input input-bordered text-black w-full pr-10" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <label className="label">
                <a href="#" className="label-text-alt link link-hover" onClick={handleResetPassword}>
                  Esqueceu a password?
                </a>
              </label>
            </div>

            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}

            {resetEmailSent && (
              <div className="alert alert-success mt-4">
                <span>Email de recuperação enviado! Verifique sua caixa de entrada.</span>
              </div>
            )}

            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? '...' : 'Login'}
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

      {showWelcomeModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg text-center mb-2 text-black">Bem-vindo, {userName}!</h3>
            <p className="py-4 text-center text-black">
              Login realizado com sucesso!
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost text-black" 
                onClick={() => setShowWelcomeModal(false)}
              >
                Fechar
              </button>
              <a href="/home" className="btn btn-primary">
                Ir para a página inicial
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}