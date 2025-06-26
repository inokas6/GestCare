'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const SignUp = () => {
  const router = useRouter();
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    // Inicializar o cliente Supabase dentro do useEffect
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    foto_perfil: null
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      if (file.size > 1 * 1024 * 1024) {
        setError('A imagem deve ter menos de 1MB');
        return;
      }
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
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

    if (!supabase) {
      setError('Erro de conexão com o servidor. Por favor, tente novamente mais tarde.');
      setLoading(false);
      return;
    }

    try {
      if (!formData.nome || !formData.email || !formData.password) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      // Tentar criar usuário apenas com email e senha
      console.log("Tentando criar user básico...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome,
            foto_perfil: formData.foto_perfil
          }
        }
      });

      if (authError) {
        console.error("Erro detalhado no registro:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          stack: authError.stack
        });
        
        // Tratamento específico para erros de banco de dados
        if (authError.message.includes('Database')) {
          throw new Error('Erro. Por favor, tente novamente mais tarde.');
        }
        throw new Error(`Erro no registro: ${authError.message}`);
      }

      console.log("Registro básico bem-sucedido:", {
        userId: authData?.user?.id,
        email: authData?.user?.email
      });

      if (!authData?.user) {
        throw new Error('Não foi possível criar a conta.');
      }

      // Aguardar um momento para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar se o usuário foi criado na tabela public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error("Erro ao verificar usuário:", userError);
        throw new Error('Erro ao verificar criação do usuário.');
      }

      if (!userData) {
        throw new Error('Usuário não foi criado corretamente na base de dados.');
      }

      // Atualizar a foto de perfil se necessário
      if (formData.foto_perfil) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ foto_perfil: formData.foto_perfil })
          .eq('id', authData.user.id);

        if (updateError) {
          console.warn("Não foi possível atualizar a foto de perfil:", updateError);
        }
      }

      // Limpar o formulário e redirecionar
      setFormData({
        nome: '',
        email: '',
        password: '',
        foto_perfil: null
      });
      setPreviewUrl(null);

      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero bg-base-200 min-h-screen flex items-center justify-center">
      <div className="card bg-base-100 w-full max-w-md p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-black text-center mb-4">Criar Conta</h1>

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
              placeholder="Seu nome"
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
              placeholder="Digite seu email"
              className="input input-bordered w-full text-black"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-black">Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Digite sua password"
              className="input input-bordered w-full text-black"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button 
            className="btn btn-primary w-full text-black" 
            type="submit" 
            disabled={loading}
          >
            {loading ? '...' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-4 text-black text-center">
          <span>Já tem uma conta? </span>
          <Link className="text-blue-500" href="/login">
            Entrar
          </Link>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg text-center mb-2 text-black">Conta criada com sucesso!</h3>
            <p className="py-4 text-center text-black">Por favor, verifique o seu email para confirmar a sua conta.</p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost text-black" 
                onClick={() => setShowSuccessModal(false)}
              >
                Fechar
              </button>
              <a href="/login" className="btn btn-primary">
                Ir para Login
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;