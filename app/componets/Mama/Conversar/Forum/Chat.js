"use client";
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Chat() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Referência para rastrear se já carregamos mensagens
    const messagesLoaded = useRef(false);
    // Referência para o canal de mensagens
    const messagesChannelRef = useRef(null);

    // Verificar a sessão do utilizador
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

    // Função para buscar mensagens
    const fetchMessages = async () => {
        try {
            console.log('Buscando mensagens do chatcarregando');
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
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Erro ao buscar mensagens:', error);
                throw error;
            }
            
            if (data && Array.isArray(data)) {
                console.log(`Carregadas ${data.length} mensagens`);
                setMessages(data);
                messagesLoaded.current = true;
            }
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            setError('Erro ao carregar mensagens');
        }
    };

    // Configurar canal do Supabase para ouvir novas mensagens
    const setupMessagesChannel = () => {
        if (messagesChannelRef.current) {
            supabase.removeChannel(messagesChannelRef.current);
        }

        messagesChannelRef.current = supabase
            .channel('messages')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'respostas' },
                (payload) => {
                    console.log('Nova mensagem recebida via canal:', payload);
                    fetchMessages();
                }
            )
            .subscribe((status) => {
                console.log('Status do canal de mensagens:', status);
            });
    };

    // Função para atualizar status online
    const updateOnlineStatus = async () => {
        if (!session?.user) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', session.user.id);

            if (error) {
                console.error('Erro ao atualizar status online:', error);
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

    // Função para buscar utilizadores online
    const fetchOnlineUsers = async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const { data, error } = await supabase
                .from('users')
                .select('id, nome, foto_perfil')
                .gte('updated_at', fiveMinutesAgo);

            if (error) throw error;
            
            if (data && Array.isArray(data)) {
                setOnlineUsers(data);
            }
        } catch (error) {
            console.error('Erro ao procurar utilizadores online:', error);
        }
    };

    // Inicializar o chat quando a sessão estiver disponível
    useEffect(() => {
        if (!session?.user) return;

        let messageInterval;
        let onlineInterval;

        const initializeChat = async () => {
            try {
                console.log('Iniciando inicialização do chatcarregando');
                setIsLoading(true);
                
                // Configurar canal para real-time updates
                setupMessagesChannel();
                
                // Buscar mensagens iniciais
                await fetchMessages();
                await fetchOnlineUsers();
                
                // Configurar intervalos para atualizações
                messageInterval = setInterval(fetchMessages, 30000); // A cada 30 segundos
                onlineInterval = setInterval(() => {
                    updateOnlineStatus();
                    fetchOnlineUsers();
                }, 10000);

                // Atualiza status online inicial
                await updateOnlineStatus();
                setIsLoading(false);
            } catch (error) {
                console.error('Erro detalhado na inicialização do chat:', error);
                setError(`Erro ao inicializar chat: ${error.message || 'Erro desconhecido'}`);
                setIsLoading(false);
            }
        };

        initializeChat();
        
        return () => {
            // Limpar intervalos quando o componente for desmontado
            clearInterval(messageInterval);
            clearInterval(onlineInterval);
            
            // Remover o canal de mensagens
            if (messagesChannelRef.current) {
                supabase.removeChannel(messagesChannelRef.current);
                messagesChannelRef.current = null;
            }
        };
    }, [session, supabase]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !session?.user) return;

        try {
            setError(null);
            console.log('Enviando mensagem:', {
                conteudo: messageInput,
                user_id: session.user.id
            });

            const { data, error } = await supabase
                .from('respostas')
                .insert([
                    {
                        conteudo: messageInput,
                        user_id: session.user.id
                    }
                ])
                .select();

            if (error) {
                console.error('Erro detalhado ao enviar mensagem:', error);
                throw error;
            }

            console.log('Mensagem enviada com sucesso:', data);
            setMessageInput('');
            
            // Não precisamos chamar fetchMessages aqui pois o canal real-time deve atualizar
            // mas vamos fazer isso por garantia
            await fetchMessages();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setError(`Erro ao enviar mensagem: ${error.message || 'Erro desconhecido'}`);
        }
    };

    // Efeito para rolar para o final quando novas mensagens chegarem
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex flex-col sm:flex-row h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Área principal do chat */}
                    <div className="flex-1 flex flex-col">
                        {/* Cabeçalho */}
                        <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shadow-sm">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex justify-between items-center">
                                Chat
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={fetchMessages}
                                        className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                                    >
                                        Atualizar
                                    </button>
                                    <span className="text-primary font-bold text-sm sm:text-base bg-primary/10 px-3 py-1 rounded-full">
                                        {onlineUsers.length} online
                                    </span>
                                </div>
                            </h2>
                        </div>

                        {/* Área de mensagens */}
                        <div className="flex-1 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center justify-between">
                                    {error}
                                    <button 
                                        className="text-red-700 font-bold hover:text-red-800 transition-colors"
                                        onClick={() => setError(null)}
                                    >
                                        X
                                    </button>
                                </div>
                            )}
                            {messages.length === 0 ? (
                                <p className="text-gray-400 italic text-sm sm:text-base text-center py-8">Sem mensagenscarregando</p>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className="flex items-start space-x-3 group">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white">
                                                <img 
                                                    src={message.user?.foto_perfil || '/default-avatar.png'} 
                                                    alt={message.user?.nome || 'Utilizador'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-avatar.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-primary">{message.user?.nome || 'Usuário'}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(message.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mt-1 bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm">{message.conteudo}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Campo de entrada */}
                        <form onSubmit={handleSendMessage} className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                            <div className="flex items-center rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-primary transition overflow-hidden shadow-sm">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Escreva uma mensagemcarregando"
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none"
                                    disabled={!session?.user}
                                />
                                <button 
                                    type="submit"
                                    className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-2 sm:py-3 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="w-full sm:w-72 bg-white/80 backdrop-blur-sm border-l border-gray-200 px-4 sm:px-6 py-4 sm:py-6 shadow-inner">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Utilizadores Online</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {onlineUsers.length === 0 ? (
                                <p className="text-gray-400 italic text-sm text-center py-4">Nenhum utilizador online</p>
                            ) : (
                                onlineUsers.map(user => (
                                    <div key={user.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white">
                                            <img 
                                                src={user.foto_perfil || '/default-avatar.png'} 
                                                alt={user.nome || 'Utilizador'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm sm:text-base text-gray-700 font-medium">{user.nome || 'Utilizador'}</span>
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