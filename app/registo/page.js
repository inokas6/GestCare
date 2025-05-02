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
    password: '',
    foto_perfil: null
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Criar URL de preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          foto_perfil: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
        .insert([
          {
            id: authData.user.id,
            nome: formData.nome,
            email: formData.email,
            foto_perfil: formData.foto_perfil,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError);
        throw insertError;
      }

      console.log('Usuário inserido com sucesso!');
      alert('Conta criada com sucesso! Por favor, verifique seu email para confirmar o cadastro.');
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
        <h1 className="text-2xl font-bold text-center text-black mb-4">Criar Conta</h1>

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Nome</span>
            </label>
            <input
              type="text"
              name="nome"
              placeholder="nome"
              className="input input-bordered w-full text-black"
              value={formData.nome}
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
              placeholder="email"
              className="input input-bordered w-full text-black"
              value={formData.email}
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
              placeholder="senha"
              className="input input-bordered w-full text-black"
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
            {loading ? 'A criar conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-4 text-black text-center">
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