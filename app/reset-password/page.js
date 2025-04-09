'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      alert('Senha alterada com sucesso!');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      setError(error.message || 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold">Redefinir Senha</h1>
          {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleResetPassword}>
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
              />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 