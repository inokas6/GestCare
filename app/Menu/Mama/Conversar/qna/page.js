"use client";
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function QnAPage() {
    const [userQuestions, setUserQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchUserQuestions();
    }, []);

    const fetchUserQuestions = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('topicos')
                .select(`
                    *,
                    categorias (
                        nome,
                        cor
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserQuestions(data || []);
        } catch (error) {
            console.error('Erro ao buscar publicações:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;

        try {
            const { error } = await supabase
                .from('topicos')
                .delete()
                .eq('id', postId);

            if (error) throw error;
            
            setUserQuestions(userQuestions.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Erro ao excluir post:', error);
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
    };

    const handleSaveEdit = async (updatedPost) => {
        try {
            const { error } = await supabase
                .from('topicos')
                .update({
                    titulo: updatedPost.titulo,
                    conteudo: updatedPost.conteudo,
                    categoria_id: updatedPost.categoria_id
                })
                .eq('id', updatedPost.id);

            if (error) throw error;

            setUserQuestions(userQuestions.map(post => 
                post.id === updatedPost.id ? updatedPost : post
            ));
            setEditingPost(null);
        } catch (error) {
            console.error('Erro ao atualizar post:', error);
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        return format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Sidebar />
            <div className="pl-0 sm:pl-48 lg:pl-64 pt-16">
                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-md p-8 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                                <p className="text-gray-600">Carregando suas publicações...</p>
                            </div>
                        </div>
                    ) : userQuestions.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma publicação encontrada</h3>
                            <p className="text-gray-600">Você ainda não fez nenhuma publicação.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {userQuestions.map((question) => (
                                <div 
                                    key={question.id} 
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="p-6 sm:p-8">
                                        {editingPost?.id === question.id ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editingPost.titulo}
                                                    onChange={(e) => setEditingPost({...editingPost, titulo: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="Título"
                                                />
                                                <textarea
                                                    value={editingPost.conteudo}
                                                    onChange={(e) => setEditingPost({...editingPost, conteudo: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="Conteúdo"
                                                    rows="4"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingPost(null)}
                                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveEdit(editingPost)}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                                    >
                                                        Salvar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center">
                                                        <div className="rounded-lg bg-purple-100 p-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-4">
                                                            <span 
                                                                className="px-2.5 py-1 rounded text-xs font-medium"
                                                                style={{ 
                                                                    backgroundColor: question.categorias?.cor + '20',
                                                                    color: question.categorias?.cor
                                                                }}
                                                            >
                                                                {question.categorias?.nome || 'Sem categoria'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(question)}
                                                            className="text-purple-600 hover:text-purple-800"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(question.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{question.titulo}</h3>
                                                <p className="text-gray-700 whitespace-pre-wrap">{question.conteudo}</p>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <time dateTime={question.created_at}>
                                                            {formatarData(question.created_at)}
                                                        </time>
                                                    </div>
                                                </div>
                                            </>
                                        )}
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