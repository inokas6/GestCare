'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Navbar from "../componets/Home/navbar_home";
import Link from 'next/link';

const Perfil = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [theme, setTheme] = useState('valentine');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    foto_perfil: '',
    created_at: '',
    updated_at: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Iniciando busca do usuário...');

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error('Erro de autenticação ou usuário não autenticado:', authError);
          router.push('/login');
          return;
        }

        console.log('Usuário autenticado:', authUser);

        // Verificar se o usuário já existe na tabela 'users'
        const { data: userExists, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id);

        if (checkError) {
          console.error('Erro ao verificar usuário:', checkError);
          setError('Erro ao verificar dados do usuário');
          return;
        }

        if (!userExists || userExists.length === 0) {
          // Criar novo usuário
          const { error: insertError } = await supabase.from('users').insert({
            id: authUser.id,
            email: authUser.email,
            nome: '',
            foto_perfil: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          if (insertError) {
            console.error('Erro ao criar novo usuário:', insertError);
            setError('Erro ao criar dados do usuário');
            return;
          }

          console.log('Novo usuário criado na tabela users');
        }

        // Buscar dados completos
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userError || !userData) {
          console.error('Erro ao carregar dados do usuário:', userError);
          setError('Erro ao carregar dados do usuário');
          return;
        }

        setUser(userData);
        setFormData({
          nome: userData.nome,
          email: userData.email,
          foto_perfil: userData.foto_perfil || '',
          created_at: userData.created_at,
          updated_at: userData.updated_at
        });
        setPreviewUrl(userData.foto_perfil || null);

      } catch (error) {
        console.error('Erro inesperado:', error);
        setError('Erro ao carregar seus dados');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    // Aplicar o tema ao carregar a página
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
  }, [theme]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.id) throw new Error('Usuário não identificado');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          nome: formData.nome,
          foto_perfil: formData.foto_perfil,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
        throw new Error('Erro ao atualizar perfil');
      }

      setEditMode(false);
      setUser(prev => ({
        ...prev,
        nome: formData.nome,
        foto_perfil: formData.foto_perfil
      }));

    } catch (error) {
      console.error('Erro completo:', error);
      setError(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleEdit = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          nome: formData.nome,
          foto_perfil: formData.foto_perfil,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => ({
        ...prev,
        nome: formData.nome,
        foto_perfil: formData.foto_perfil
      }));
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      setError('Erro ao excluir conta');
      console.error('Erro:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'valentine' ? 'mytheme' : 'valentine');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" data-theme={theme}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 mt-20">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Meu Perfil</h1>
            <div className="flex gap-2">
              <button 
                onClick={toggleTheme}
                className="btn btn-primary btn-sm"
              >
                Mudar Tema
              </button>
              <button onClick={handleLogout} className="btn btn-outline btn-error hover:text-white">
                Sair
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full bg-base-200 flex items-center justify-center overflow-hidden`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <svg className={`w-16 h-16 text-base-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-base-100 p-2 rounded-full shadow-lg cursor-pointer hover:bg-pink-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary">Nome</span>
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={!editMode}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-primary">Email</span>
              </label>
              <input
                type="email"
                value={formData.email}
                className="input input-bordered w-full"
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-primary">Conta criada em</span>
                </label>
                <input
                  type="text"
                  value={formatDate(formData.created_at)}
                  className="input input-bordered w-full"
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-primary">Última atualização</span>
                </label>
                <input
                  type="text"
                  value={formatDate(formData.updated_at)}
                  className="input input-bordered w-full"
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="btn btn-primary"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="btn btn-outline btn-primary"
                  >
                    Editar Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-outline btn-primary"
                  >
                    Excluir Conta
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
