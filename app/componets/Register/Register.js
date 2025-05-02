import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Você precisa aceitar os termos de uso');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          birthDate: formData.birthDate
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-black text-center mb-6">Criar Conta</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-black px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Nome completo</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Seu nome completo"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Data de nascimento</span>
            </label>
            <input
              type="date"
              name="birthDate"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Senha</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="********"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Confirmar senha</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="********"
              className="input input-bordered border-pink-200 focus:border-pink-500 text-black w-full"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                className="checkbox checkbox-primary"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span className="label-text text-black">
                Li e aceito os{' '}
                <Link href="/terms" className="text-black hover:text-black">
                  termos de uso
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn bg-gradient-to-r from-pink-500 to-pink-400 border-none text-white hover:from-pink-600 hover:to-pink-500 w-full mt-6"
          >
            Criar conta
          </button>

          <div className="divider text-black">OU</div>

          <div className="text-center text-black">
            <p>Já tem uma conta?</p>
            <Link href="/login" className="text-black hover:text-black font-medium">
              Faça login aqui
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 