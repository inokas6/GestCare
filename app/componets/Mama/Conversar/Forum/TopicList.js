"use client";
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TopicComments from './TopicComments';

export default function TopicList() {
    console.log('🚀 Iniciando componente TopicList');
    
    const [topicos, setTopicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comentariosAbertos, setComentariosAbertos] = useState({});
    const supabase = createClientComponentClient();

    // Função para formatar a data
    const formatarData = (dataString) => {
        console.log('📅 Formatando data:', dataString);
        if (!dataString) {
            console.warn('⚠️ Data inválida recebida:', dataString);
            return '';
        }
        const dataFormatada = format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
        console.log('📅 Data formatada:', dataFormatada);
        return dataFormatada;
    };

    // Função para truncar o conteúdo
    const truncarConteudo = (texto) => {
        console.log('✂️ Truncando texto:', { tamanhoOriginal: texto?.length });
        if (!texto) {
            console.warn('⚠️ Texto inválido recebido');
            return '';
        }
        const textoTruncado = texto.length > 200 ? texto.substring(0, 200) + '...' : texto;
        console.log('✂️ Texto truncado:', { tamanhoFinal: textoTruncado.length });
        return textoTruncado;
    };

    // Função para alternar a exibição dos comentários
    const toggleComentarios = async (topicoId) => {
        console.log('🔄 Alternando comentários para tópico:', topicoId);
        console.log('📊 Estado atual dos comentários:', comentariosAbertos);

        if (!comentariosAbertos[topicoId]) {
            console.log('🔍 Buscando comentários do tópico:', topicoId);
            try {
                const { data, error } = await supabase
                    .from('comentarios')
                    .select(`
                        *,
                        users:user_id (
                            id,
                            nome,
                            foto_perfil
                        )
                    `)
                    .eq('topico_id', topicoId)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('❌ Erro ao buscar comentários:', error);
                    throw error;
                }

                console.log('✅ Comentários carregados:', { 
                    topicoId, 
                    quantidade: data?.length || 0,
                    comentarios: data 
                });

                setTopicos(topicos.map(topico => {
                    if (topico.id === topicoId) {
                        console.log('🔄 Atualizando tópico com comentários:', topicoId);
                        return { ...topico, comentariosCarregados: data || [] };
                    }
                    return topico;
                }));
            } catch (err) {
                console.error('❌ Erro ao processar comentários:', err);
            }
        }

        setComentariosAbertos(prev => {
            const novoEstado = {
                ...prev,
                [topicoId]: !prev[topicoId]
            };
            console.log('🔄 Novo estado dos comentários:', novoEstado);
            return novoEstado;
        });
    };

    useEffect(() => {
        console.log('🔄 Iniciando efeito de busca de tópicos');
        
        const fetchTopicos = async () => {
            console.log('🔍 Iniciando busca de tópicos');
            try {
                setLoading(true);
                setError(null);

                console.log('📡 Fazendo requisição ao Supabase');
                const { data, error } = await supabase
                    .from('topicos')
                    .select(`
                        id,
                        titulo,
                        conteudo,
                        created_at,
                        updated_at,
                        user_id,
                        categoria_id,
                        users:user_id (
                            id,
                            nome,
                            foto_perfil
                        ),
                        categorias:categoria_id (
                            id,
                            nome,
                            cor
                        ),
                        comentarios:comentarios (
                            id
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ Erro na requisição:', error);
                    throw error;
                }

                console.log('✅ Dados recebidos:', { 
                    quantidadeTopicos: data?.length || 0,
                    topicos: data 
                });

                const topicosProcessados = data.map(topico => {
                    const topicoProcessado = {
                        ...topico,
                        totalComentarios: topico.comentarios?.length || 0,
                        comentariosCarregados: []
                    };
                    console.log('🔄 Tópico processado:', { 
                        id: topicoProcessado.id,
                        titulo: topicoProcessado.titulo,
                        totalComentarios: topicoProcessado.totalComentarios
                    });
                    return topicoProcessado;
                });

                console.log('✅ Tópicos processados:', { 
                    quantidade: topicosProcessados.length,
                    resumo: topicosProcessados.map(t => ({
                        id: t.id,
                        titulo: t.titulo,
                        comentarios: t.totalComentarios
                    }))
                });

                setTopicos(topicosProcessados || []);
            } catch (err) {
                console.error('❌ Erro ao buscar tópicos:', err);
                setError('Erro ao carregar tópicos. Por favor, tente novamente.');
            } finally {
                console.log('🏁 Finalizando busca de tópicos');
                setLoading(false);
            }
        };

        fetchTopicos();
    }, [supabase]);

    console.log('📊 Estado atual:', { 
        quantidadeTopicos: topicos.length,
        loading,
        error,
        comentariosAbertos 
    });

    if (loading) {
        console.log('⏳ Renderizando loading');
        return <div className="text-center py-4">Carregando tópicos...</div>;
    }
    
    if (error) {
        console.log('❌ Renderizando erro:', error);
        return <div className="text-red-500 text-center py-4">Erro: {error}</div>;
    }

    console.log('🎨 Renderizando lista de tópicos');
    return (
        <div className="space-y-4">
            {topicos.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum tópico encontrado</p>
                </div>
            ) : (
                topicos.map((topico) => {
                    console.log('🎨 Renderizando tópico:', { 
                        id: topico.id,
                        titulo: topico.titulo,
                        comentariosAbertos: comentariosAbertos[topico.id]
                    });
                    return (
                        <div
                            key={topico.id}
                            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                                <div className="w-full">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/Menu/Mama/Conversar/topicos/${topico.id}`}>
                                            <h3 className="text-base sm:text-lg font-semibold text-purple-600 hover:text-purple-700">
                                                {topico.titulo}
                                            </h3>
                                        </Link>
                                        <button
                                            onClick={() => toggleComentarios(topico.id)}
                                            className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="text-sm">{topico.totalComentarios}</span>
                                        </button>
                                    </div>
                                    <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-2">
                                        {truncarConteudo(topico.conteudo)}
                                    </p>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <div className="flex items-center">
                                            {topico.users?.foto_perfil ? (
                                                <img
                                                    src={topico.users.foto_perfil}
                                                    alt={topico.users.nome}
                                                    className="w-6 h-6 rounded-full mr-2"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                                                    <span className="text-purple-800 text-xs">
                                                        {topico.users?.nome?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                            )}
                                            <span>{topico.users?.nome || 'Usuário'}</span>
                                        </div>
                                        <span className="mx-2">•</span>
                                        <span>{formatarData(topico.created_at)}</span>
                                        <span className="mx-2">•</span>
                                        <span className="text-purple-600">
                                            {topico.categorias?.nome}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Seção de comentários expansível */}
                            {comentariosAbertos[topico.id] && (
                                <div className="mt-4 border-t pt-4">
                                    <TopicComments topicoId={topico.id} />
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
} 