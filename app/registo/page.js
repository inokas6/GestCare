'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const SignUp = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.nome || !formData.email || !formData.password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Verificar se o e-mail já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar e-mail:', checkError);
        throw new Error('Erro ao verificar se o e-mail já existe');
      }

      if (existingUser) {
        throw new Error('Este e-mail já está cadastrado');
      }

      // Processo em duas etapas - primeiro criar o usuário na autenticação
      console.log('Criando usuário na autenticação...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome
          }
        }
      });

      if (authError) {
        console.error('Erro na autenticação:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha ao criar conta - nenhum usuário retornado');
      }

      console.log('Usuário criado na autenticação:', authData.user.id);

      // Depois inserir na tabela users
      console.log('Inserindo na tabela users...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          nome: formData.nome,
          email: formData.email
        });

      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError);
        throw insertError;
      }

      console.log('Usuário inserido com sucesso!');
      alert('Conta criada com sucesso! Faça login para continuar.');
      router.push('/login');
      
    } catch (error) {
      console.error('Erro completo:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero bg-base-200 min-h-screen flex items-center justify-center">
      <div className="card bg-base-100 w-full max-w-md p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">Criar Conta</h1>

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nome</span>
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Seu nome"
              className="input input-bordered w-full"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Digite seu email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Senha</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Digite sua senha"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button 
            className="btn btn-primary w-full" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span>Já tem uma conta? </span>
          <Link className="text-blue-500" href="/login">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;