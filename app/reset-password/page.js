'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError(error.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col">
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleResetPassword}>
            <h2 className="text-2xl font-bold text-center mb-4">Redefinir Senha</h2>
            
            {error && <div className="alert alert-error mb-4">{error}</div>}
            {success && <div className="alert alert-success mb-4">Senha redefinida com sucesso!</div>}

            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Nova Senha</span>
              </label>
              <input 
                type="password" 
                placeholder="Digite sua nova senha" 
                className="input input-bordered text-black" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Confirmar Nova Senha</span>
              </label>
              <input 
                type="password" 
                placeholder="Confirme sua nova senha" 
                className="input input-bordered text-black" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Processando...' : 'Redefinir Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 