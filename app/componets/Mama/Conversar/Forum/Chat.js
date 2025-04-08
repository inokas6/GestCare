"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Chat() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUtilizadores, setOnlineUtilizadores] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatTopicId, setChatTopicId] = useState(null);
    
    // UUID constante para a categoria geral
    const CATEGORIA_GERAL_UUID = '00000000-0000-0000-0000-000000000001';

    // Verificar a sessão do usuário
    useEffect(() => {
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log('Sessão obtida:', session);
                setSession(session);
                if (!session) {
                    router.push('/login');
                    return;
                }
            } catch (error) {
                console.error('Erro ao obter sessão:', error);
                setError('Erro ao verificar autenticação');
            } finally {
                if (session === null) {
                    setIsLoading(false);
                }
            }
        };

        getSession();

        // Configurar listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                if (!session) {
                    router.push('/login');
                }
            }
        );

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [supabase, router]);

    const fetchMessages = async (topicId) => {
        if (!topicId) return;

        try {
            const { data, error } = await supabase
                .from('respostas')
                .select(`
                    id,
                    conteudo,
                    created_at,
                    user:user_id (
                        id,
                        nome,
                        foto_perfil
                    )
                `)
                .eq('topico_id', topicId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            if (data) {
                setMessages(data);
            }
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            setError('Erro ao carregar mensagens');
        }
    };

    // Inicializar o chat quando a sessão estiver disponível
    useEffect(() => {
        let messageInterval;
        let onlineInterval;

        const initializeChat = async () => {
            if (!session?.user) return;

            try {
                console.log('Iniciando inicialização do chat...');
                
                // Verificar se a categoria existe ou criar
                const { data: categoryExists, error: checkCategoryError } = await supabase
                    .from('categorias')
                    .select('id')
                    .eq('id', CATEGORIA_GERAL_UUID)
                    .maybeSingle();
                
                if (checkCategoryError) {
                    console.error('Erro ao verificar categoria:', checkCategoryError);
                }
                
                // Se não existir, criar
                if (!categoryExists) {
                    console.log('Criando categoria geral...');
                    const { error: createCategoryError } = await supabase
                        .from('categorias')
                        .insert([
                            {
                                id: CATEGORIA_GERAL_UUID,
                                nome: 'Geral'
                            }
                        ]);
                    
                    if (createCategoryError) {
                        console.error('Erro ao criar categoria:', createCategoryError);
                    }
                }
                
                // Buscar ou criar categoria de chat global
                const { data: existingCategory, error: categoryError } = await supabase
                    .from('categorias')
                    .select('id')
                    .eq('nome', 'Chat Global')
                    .maybeSingle();

                console.log('Busca por categoria existente:', { existingCategory, categoryError });

                let categoryId = null;
                
                if (!existingCategory) {
                    console.log('Criando nova categoria de chat...');
                    
                    const { data: newCategory, error: createError } = await supabase
                        .from('categorias')
                        .insert([
                            {
                                nome: 'Chat Global'
                            }
                        ])
                        .select();

                    console.log('Resultado da criação da categoria:', { newCategory, createError });

                    if (createError) {
                        console.error('Erro ao criar categoria:', createError);
                        throw createError;
                    }
                    
                    categoryId = newCategory[0]?.id;
                } else {
                    categoryId = existingCategory.id;
                }

                if (!categoryId) {
                    throw new Error('Não foi possível obter o ID da categoria');
                }

                console.log('ID da categoria definido:', categoryId);
                setChatTopicId(categoryId);
                
                // Atualizar perfil do usuário se necessário
                const { data: userProfile, error: userError } = await supabase
                    .from('users')
                    .select('id, nome, foto_perfil')
                    .eq('id', session.user.id)
                    .maybeSingle();
                
                if (!userProfile) {
                    console.log('Criando/atualizando perfil do usuário...');
                    await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            nome: session.user.email.split('@')[0],
                            email: session.user.email,
                            updated_at: new Date().toISOString()
                        });
                }
                
                // Configurar real-time listeners
                const messagesChannel = supabase
                    .channel('messages')
                    .on('postgres_changes', 
                        { event: 'INSERT', schema: 'public', table: 'respostas', filter: `topico_id=eq.${categoryId}` },
                        (payload) => {
                            fetchMessages(categoryId);
                        }
                    )
                    .subscribe();
                
                await fetchMessages(categoryId);
                await fetchOnlineUtilizadores();
                
                // Atualizar online status e usuários
                messageInterval = setInterval(() => fetchMessages(categoryId), 5000);
                onlineInterval = setInterval(() => {
                    updateOnlineStatus();
                    fetchOnlineUtilizadores();
                }, 10000);

                // Atualiza status online inicial
                await updateOnlineStatus();
                setIsLoading(false);

                return () => {
                    clearInterval(messageInterval);
                    clearInterval(onlineInterval);
                    supabase.removeChannel(messagesChannel);
                };
            } catch (error) {
                console.error('Erro detalhado na inicialização do chat:', error);
                setError(`Erro ao inicializar chat: ${error.message || 'Erro desconhecido'}`);
                setIsLoading(false);
            }
        };

        if (session?.user) {
            initializeChat();
        }
        
        return () => {
            clearInterval(messageInterval);
            clearInterval(onlineInterval);
        };
    }, [session, supabase]);

    const updateOnlineStatus = async () => {
        if (!session?.user) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', session.user.id);

            if (error) {
                console.error('Erro ao atualizar status online (detalhes):', error);
                // Tentar UPSERT se o UPDATE falhar
                if (error.code === 'PGRST116') {
                    const { error: upsertError } = await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            nome: session.user.email.split('@')[0],
                            email: session.user.email,
                            updated_at: new Date().toISOString()
                        });
                    
                    if (upsertError) {
                        throw upsertError;
                    }
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar status online:', error);
        }
    };

    const fetchOnlineUtilizadores = async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const { data, error } = await supabase
                .from('users')
                .select('id, nome, foto_perfil')
                .gte('updated_at', fiveMinutesAgo);

            if (error) throw error;
            
            if (data && Array.isArray(data)) {
                setOnlineUtilizadores(data);
            }
        } catch (error) {
            console.error('Erro ao buscar utilizadores online:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !session?.user || !chatTopicId) return;

        try {
            setError(null);
            console.log('Enviando mensagem:', {
                conteudo: messageInput,
                user_id: session.user.id,
                topico_id: chatTopicId
            });

            const { data, error } = await supabase
                .from('respostas')
                .insert([
                    {
                        conteudo: messageInput,
                        user_id: session.user.id,
                        topico_id: chatTopicId,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) {
                console.error('Erro detalhado ao enviar mensagem:', error);
                throw error;
            }

            console.log('Mensagem enviada com sucesso:', data);
            setMessageInput('');
            await fetchMessages(chatTopicId);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setError(`Erro ao enviar mensagem: ${error.message || 'Erro desconhecido'}`);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen bg-gray-50 font-sans">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <>
                    {/* Área principal do chat */}
                    <div className="flex-1 flex flex-col">
                        {/* Cabeçalho */}
                        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b shadow-sm">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex justify-between items-center">
                                Chat
                                <span className="text-purple-600 font-bold text-sm sm:text-base">
                                    {onlineUtilizadores.length} online
                                </span>
                            </h2>
                        </div>

                        {/* Área de mensagens */}
                        <div className="flex-1 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                    {error}
                                </div>
                            )}
                            {messages.length === 0 ? (
                                <p className="text-gray-400 italic text-sm sm:text-base">Nenhuma mensagem ainda...</p>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                <img 
                                                    src={message.user?.foto_perfil || '/default-avatar.png'} 
                                                    alt={message.user?.nome || 'Usuário'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-avatar.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-purple-600">{message.user?.nome || 'Usuário'}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(message.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mt-1">{message.conteudo}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Campo de entrada */}
                        <form onSubmit={handleSendMessage} className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-t">
                            <div className="flex items-center rounded-xl border bg-white focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Escreva uma mensagem..."
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none"
                                    disabled={!session?.user}
                                />
                                <button 
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 sm:py-3 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!session?.user || !messageInput.trim()}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L15 22L11 13L2 9L22 2Z" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Barra lateral direita */}
                    <div className="w-full sm:w-72 bg-white border-l px-4 sm:px-6 py-4 sm:py-6 shadow-inner">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Utilizadores Online</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {onlineUtilizadores.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">Nenhum utilizador online</p>
                            ) : (
                                onlineUtilizadores.map(utilizador => (
                                    <div key={utilizador.id} className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 overflow-hidden rounded-full bg-gray-200">
                                            <img 
                                                src={utilizador.foto_perfil || '/default-avatar.png'} 
                                                alt={utilizador.nome || 'Usuário'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm sm:text-base text-gray-700">{utilizador.nome || 'Usuário'}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}