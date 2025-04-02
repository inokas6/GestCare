import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirecionar para a página principal após login bem-sucedido
        router.push('/dashboard');
      } else {
        setError(data.message || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-black text-center mb-6">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Email</span>
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Senha</span>
            </label>
            <input
              type="password"
              placeholder="********"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="label">
              <Link href="/forgot-password" className="label-text-alt text-black hover:text-pink-600">
                Esqueceu a senha?
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="btn bg-gradient-to-r from-pink-500 to-pink-400 border-none text-white hover:from-pink-600 hover:to-pink-500 w-full"
          >
            Entrar
          </button>

          <div className="divider text-black">OU</div>

          <div className="text-center text-black">
            <p>Ainda não tem uma conta?</p>
            <Link href="/register" className="text-pink-600 hover:text-pink-700 font-medium">
              Registre-se aqui
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 