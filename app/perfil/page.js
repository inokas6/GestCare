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
  const [warning, setWarning] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    foto_perfil: '',
    created_at: '',
    updated_at: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [emailChangePending, setEmailChangePending] = useState(false);
  const [confirmEmailChange, setConfirmEmailChange] = useState(false);
  const [showPregnancyForm, setShowPregnancyForm] = useState(false);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [pregnancyData, setPregnancyData] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Iniciando busca do usuáriocarregando');

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
        setOriginalEmail(userData.email);
        setPreviewUrl(userData.foto_perfil || null);

        // Buscar dados da gravidez
        const { data: gravidezData, error: gravidezError } = await supabase
          .from('gravidez_info')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (!gravidezError && gravidezData) {
          setPregnancyData(gravidezData);
        }

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
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    
    // Para email, apenas atualize o campo temporário se estiver em modo de edição
    if (name === 'email' && editMode) {
      setPendingEmail(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWarning('');

    try {
      if (!user?.id) throw new Error('Usuário não identificado');

      // Validar nome
      if (!formData.nome.trim()) {
        setError('O nome não pode estar vazio ou conter apenas espaços');
        setLoading(false);
        return;
      }

      // Alerta o usuário sobre a mudança de email pendente, mas permite salvar outras alterações
      if (emailChangePending) {
        setWarning('Atenção: Suas outras alterações foram salvas, mas a mudança de email ainda está pendente de confirmação.');
      }

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
    setWarning('');
    
    // Validar nome
    if (!formData.nome.trim()) {
      setError('O nome não pode estar vazio ou conter apenas espaços');
      return;
    }
    
    // Alerta o usuário sobre a mudança de email pendente, mas permite salvar outras alterações
    if (emailChangePending) {
      setWarning('Atenção: Suas outras alterações foram salvas, mas a mudança de email ainda está pendente de confirmação.');
    }

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
      
      // Limpar o email pendente se existir e não estiver em processo de confirmação
      if (pendingEmail && !emailChangePending) {
        setPendingEmail('');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil');
    }
  };

  const handleDelete = async () => {
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar a sua conta? Esta ação não pode ser desfeita.',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

          if (error) throw error;

          await supabase.auth.signOut();
          router.push('/login');
        } catch (error) {
          setMessage({ text: 'Erro ao excluir conta: ' + error.message, type: 'error' });
          console.error('Erro:', error);
        }
      }
    });
    setShowConfirmDialog(true);
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

  const promptEmailChange = () => {
    // Verifica se existe um email pendente para confirmar
    if (pendingEmail && pendingEmail !== originalEmail) {
      setConfirmEmailChange(true);
    } else {
      setError('Digite um novo email para atualizar');
    }
  };

  const cancelEmailChangePrompt = () => {
    setConfirmEmailChange(false);
  };

  const handleEmailChange = async () => {
    try {
      setLoading(true);
      setError('');
      setWarning('');
      setConfirmEmailChange(false);

      console.log('Iniciando mudança de email para:', pendingEmail);

      const { data, error } = await supabase.auth.updateUser(
        { email: pendingEmail }
      );

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      if (data) {
        console.log('Dados retornados:', data);
        setEmailChangePending(true);
        setMessage({ 
          text: 'Um link de confirmação foi enviado para seu novo e-mail. Por favor, verifique sua caixa de entrada.', 
          type: 'info' 
        });
      } else {
        throw new Error('Nenhuma resposta do servidor');
      }
    } catch (error) {
      console.error('Erro completo ao atualizar e-mail:', error);
      setMessage({ text: 'Erro ao atualizar e-mail: ' + (error.message || 'Erro desconhecido'), type: 'error' });
      setPendingEmail('');
    } finally {
      setLoading(false);
    }
  };

  const cancelEmailChange = () => {
    setPendingEmail('');
    setEmailChangePending(false);
    setWarning('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary">...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#F4E7FA' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 mt-20">
        {message.text && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] ${
            message.type === 'success' ? 'bg-green-200' : 
            message.type === 'error' ? 'bg-red-200' : 
            message.type === 'info' ? 'bg-blue-200' : 'bg-yellow-200'
          } text-black`}>
            {message.text}
          </div>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-black">Confirmar ação</h3>
              <p className="mb-6 text-black">{pendingAction?.message || 'Tem certeza que deseja realizar esta ação?'}</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-black"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (pendingAction?.callback) {
                      pendingAction.callback();
                    }
                    setShowConfirmDialog(false);
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Meu Perfil</h1>
            <div className="flex gap-2">
              <button onClick={handleLogout} className="btn btn-outline btn-error hover:text-white">
                Sair
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}
          {warning && <div className="alert alert-warning mb-4">{warning}</div>}

          {/* Status da Gravidez */}
          <div className="mb-6 p-4 bg-pink-50 rounded-lg">
            <h3 className="text-lg font-semibold text-pink-800 mb-2">Status da Gravidez</h3>
            {pregnancyData ? (
              <div className="space-y-2">
                <p className="text-pink-700">
                  {pregnancyData.tipo === 'gravida' ? (
                    <>Você está grávida! {pregnancyData.data_provavel_parto && `Data provável do parto: ${formatDate(pregnancyData.data_provavel_parto)}`}</>
                  ) : (
                    <>Você está a planear. {pregnancyData.ciclo_menstrual && `Ciclo menstrual: ${pregnancyData.ciclo_menstrual} dias`}</>
                  )}
                </p>
                <button
                  onClick={() => {
                    setPendingAction({
                      type: 'change_config',
                      message: 'Tem certeza que deseja alterar a configuração atual?',
                      callback: () => {
                        setShowPregnancyForm(true);
                        setShowPlanningForm(false);
                      }
                    });
                    setShowConfirmDialog(true);
                  }}
                  className="text-sm bg-pink-100 hover:bg-pink-200 text-pink-800 px-4 py-2 rounded-full transition-colors"
                >
                  Alterar Configuração
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-pink-700">Nenhuma configuração definida</p>
                <button
                  onClick={() => {
                    setShowPregnancyForm(true);
                    setShowPlanningForm(false);
                  }}
                  className="text-sm bg-pink-100 hover:bg-pink-200 text-pink-800 px-4 py-2 rounded-full transition-colors"
                >
                  Configurar Status
                </button>
              </div>
            )}
          </div>

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

          {/* Modal de confirmação para mudança de email */}
          {confirmEmailChange && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Confirmar mudança de email</h3>
                <p className="mb-4">Tem certeza que deseja alterar seu email de <span className="font-bold">{originalEmail}</span> para <span className="font-bold">{pendingEmail}</span>?</p>
                <p className="mb-4 text-sm text-warning">Um link de confirmação será enviado para o novo endereço de email.</p>
                <div className="flex justify-end gap-2">
                  <button 
                    className="btn btn-outline" 
                    onClick={cancelEmailChangePrompt}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleEmailChange}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

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
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={editMode ? (pendingEmail || formData.email) : formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  disabled={!editMode || emailChangePending}
                />
                {editMode && !emailChangePending && (
                  <button
                    type="button"
                    onClick={promptEmailChange}
                    className="btn btn-primary"
                  >
                    Atualizar Email
                  </button>
                )}
              </div>
              {emailChangePending && (
                <div className="mt-2 flex items-center">
                  <div className="flex-grow text-sm text-warning">
                    <p>Email atual: <strong>{formData.email}</strong></p>
                    <p>Novo email pendente: <strong>{pendingEmail}</strong></p>
                    <p>Aguardando confirmação. Verifique sua caixa de entrada.</p>
                  </div>
                  <button
                    type="button"
                    onClick={cancelEmailChange}
                    className="btn btn-sm btn-outline btn-warning"
                  >
                    Cancelar
                  </button>
                </div>
              )}
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
                    onClick={() => {
                      setEditMode(false);
                      setPendingEmail(''); // Limpar qualquer email pendente
                      setWarning('');
                      // Se houver mudança de email pendente, cancelar
                      if (emailChangePending) {
                        cancelEmailChange();
                      }
                    }}
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
                    Eliminar Conta
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Modal para configuração da gravidez */}
          {showPregnancyForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div 
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-pink-800">
                    {pregnancyData ? 'Alterar Status' : 'Configurar Status'}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">Selecione uma opção:</p>
                
                <div className="space-y-4 mb-6">
                  <button
                    onClick={() => {
                      setShowPregnancyForm(false);
                      setShowPlanningForm(true);
                      setPregnancyData(prev => ({ ...prev, tipo: 'gravida' }));
                    }}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                  >
                    <span className="mr-2">🤰</span>
                    Estou Grávida
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowPregnancyForm(false);
                      setShowPlanningForm(true);
                      setPregnancyData(prev => ({ ...prev, tipo: 'planejamento' }));
                    }}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                  >
                    <span className="mr-2">📅</span>
                    Quero Engravidar
                  </button>
                  
                  {pregnancyData && (
                    <button
                      onClick={() => {
                        setPendingAction({
                          type: 'remove_config',
                          message: 'Tem certeza que deseja remover a configuração atual? Esta ação não pode ser desfeita.',
                          callback: async () => {
                            try {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) throw new Error("Usuário não autenticado");

                              const { error } = await supabase
                                .from("gravidez_info")
                                .delete()
                                .eq("user_id", user.id);

                              if (error) throw error;

                              setPregnancyData(null);
                              setShowPregnancyForm(false);
                              setMessage({ text: 'Configuração removida com sucesso!', type: 'success' });
                            } catch (error) {
                              console.error("Erro ao remover configuração:", error);
                              setMessage({ text: 'Erro ao remover configuração. Tente novamente.', type: 'error' });
                            }
                          }
                        });
                        setShowConfirmDialog(true);
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                    >
                      <span className="mr-2">🗑️</span>
                      Remover Configuração
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowPregnancyForm(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    <span className="mr-2">⏰</span>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal para configuração da gravidez/planejamento */}
          {showPlanningForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div 
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-pink-800">
                    {pregnancyData?.tipo === 'gravida' ? 'Alterar Dados da Gravidez' : 'Configurar Planeamento'}
                  </h3>
                </div>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  
                  const formData = new FormData(e.target);
                  const data_ultima_menstruacao = formData.get('data_ultima_menstruacao');
                  const data_provavel_parto = formData.get('data_provavel_parto');
                  const ciclo_menstrual = formData.get('ciclo_menstrual');
                  
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("Usuário não autenticado");
                    
                    if (!data_ultima_menstruacao) {
                      throw new Error("A data da última menstruação é obrigatória");
                    }

                    const dados = {
                      user_id: user.id,
                      data_ultima_menstruacao: data_ultima_menstruacao,
                      data_inicio: new Date().toISOString().split('T')[0],
                      tipo: pregnancyData?.tipo || 'gravida',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };

                    if (pregnancyData?.tipo === 'gravida') {
                      if (data_provavel_parto) {
                        dados.data_provavel_parto = data_provavel_parto;
                      }
                    } else {
                      dados.ciclo_menstrual = ciclo_menstrual || 28;
                    }

                    if (pregnancyData) {
                      // Atualizar dados existentes
                      const { error } = await supabase
                        .from("gravidez_info")
                        .update({
                          ...dados,
                          updated_at: new Date().toISOString()
                        })
                        .eq("user_id", user.id);
                      
                      if (error) throw error;
                    } else {
                      // Inserir novos dados
                      const { error } = await supabase
                        .from("gravidez_info")
                        .insert([dados]);
                      
                      if (error) throw error;
                    }
                    
                    setPregnancyData(dados);
                    setMessage({ text: 'Configuração atualizada com sucesso!', type: 'success' });
                    setShowPlanningForm(false);
                  } catch (error) {
                    console.error("Erro ao configurar dados:", error);
                    setMessage({ text: error.message || "Erro ao configurar dados. Tente novamente.", type: 'error' });
                  } finally {
                    setIsLoading(false);
                  }
                }}>
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="data_ultima_menstruacao">
                      Data da última menstruação
                    </label>
                    <input
                      id="data_ultima_menstruacao"
                      type="date"
                      name="data_ultima_menstruacao"
                      defaultValue={pregnancyData?.data_ultima_menstruacao}
                      className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                      required
                    />
                  </div>
                  
                  {pregnancyData?.tipo === 'gravida' ? (
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="data_provavel_parto">
                        Data provável do parto (opcional)
                      </label>
                      <input
                        id="data_provavel_parto"
                        type="date"
                        name="data_provavel_parto"
                        defaultValue={pregnancyData?.data_provavel_parto}
                        className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                      />
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="ciclo_menstrual">
                        Duração do ciclo menstrual (em dias)
                      </label>
                      <input
                        id="ciclo_menstrual"
                        type="number"
                        name="ciclo_menstrual"
                        min="21"
                        max="35"
                        defaultValue={pregnancyData?.ciclo_menstrual || "28"}
                        className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                      />
                      <p className="text-xs text-gray-500 mt-1">O ciclo padrão é de 28 dias. Ajuste conforme seu ciclo.</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPlanningForm(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      ) : (
                        <span className="mr-2">✨</span>
                      )}
                      {pregnancyData ? 'Atualizar' : 'Configurar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;