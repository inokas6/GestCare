"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ViewOnlyComments from '../../../../componets/Mama/Conversar/Forum/ViewOnlyComments';
import { useRouter } from 'next/navigation';

export default function QnaPage() {
    const [topicos, setTopicos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comentariosAbertos, setComentariosAbertos] = useState({});
    const [isDeleting, setIsDeleting] = useState(false);
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        const fetchMeusTopicos = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('user não autenticado');

                const { data, error } = await supabase
                    .from('topicos')
                    .select(`
                        *,
                        users:user_id (id, nome, foto_perfil),
                        categorias:categoria_id (id, nome, cor),
                        comentarios:comentarios(count)
                    `)
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const topicosProcessados = data.map(topico => ({
                    ...topico,
                    totalComentarios: topico.comentarios?.[0]?.count || 0
                }));

                setTopicos(topicosProcessados);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeusTopicos();
    }, []);

    const formatarData = (dataString) => {
        if (!dataString) return '';
        return format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    };

    const toggleComentarios = (topicoId) => {
        setComentariosAbertos(prev => ({
            ...prev,
            [topicoId]: !prev[topicoId]
        }));
    };

    const handleDelete = async (topicoId) => {
        if (!confirm('Tem certeza que deseja eliminar esta publicação? Todos os comentários serão apagados também!')) return;
        
        try {
            setIsDeleting(true);
            const { error } = await supabase
                .from('topicos')
                .delete()
                .eq('id', topicoId);

            if (error) throw error;

            setTopicos(topicos.filter(t => t.id !== topicoId));
        } catch (err) {
            setError('Erro ao eliminar a publicação: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (topicoId) => {
        router.push(`/Menu/Mama/Conversar/forum/editar/${topicoId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="pl-0 sm:pl-48 lg:pl-64 mt-[80px]">
                <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Posts</h1>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    ) : topicos.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Ainda sem posts</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {topicos.map((topico) => (
                                <div key={topico.id} className="bg-white rounded-xl shadow-sm border p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {topico.users?.foto_perfil ? (
                                                <img 
                                                    src={topico.users.foto_perfil} 
                                                    alt={topico.users.nome} 
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-purple-800 font-medium text-lg">
                                                        {topico.users?.nome?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                                {topico.titulo}
                                            </h2>
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <span>{formatarData(topico.created_at)}</span>
                                                <span className="mx-2">•</span>
                                                <span className="text-purple-600">{topico.categorias?.nome}</span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-line">
                                                {topico.conteudo}
                                            </p>

                                            {/* Botões de ação */}
                                            <div className="mt-4 border-t pt-4 flex justify-between items-center">
                                                <button
                                                    onClick={() => toggleComentarios(topico.id)}
                                                    className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>
                                                        {topico.totalComentarios} {topico.totalComentarios === 1 ? 'comentário' : 'comentários'}
                                                    </span>
                                                </button>
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(topico.id)}
                                                        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(topico.id)}
                                                        disabled={isDeleting}
                                                        className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Seção de comentários (somente visualização) */}
                                            {comentariosAbertos[topico.id] && (
                                                <div className="mt-4">
                                                    <ViewOnlyComments topicoId={topico.id} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}