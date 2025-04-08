"use client";
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function QnAPage() {
    const [userQuestions, setUserQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchUserQuestions = async () => {
            try {
                // Verificar se o usuário está autenticado
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    router.push('/login');
                    return;
                }

                // Buscar as publicações do usuário com o nome da categoria
                const { data, error } = await supabase
                    .from('topicos')
                    .select(`
                        *,
                        categorias (
                            nome
                        )
                    `)
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setUserQuestions(data || []);
            } catch (error) {
                console.error('Erro ao buscar publicações:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserQuestions();
    }, [supabase, router]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="pl-0 sm:pl-48 lg:pl-64">
                <header className="bg-white flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 z-10">
                    <h1 className="text-lg sm:text-xl font-semibold text-purple-600">Minhas Publicações</h1>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Minhas Publicações</h2>
                        {isLoading ? (
                            <p className="text-gray-500">Carregando suas publicações...</p>
                        ) : userQuestions.length === 0 ? (
                            <p className="text-gray-500">Você ainda não fez nenhuma publicação.</p>
                        ) : (
                            <div className="space-y-6">
                                {userQuestions.map((question) => (
                                    <div key={question.id} className="border-b pb-6">
                                        <div className="mb-4">
                                            <h3 className="text-base sm:text-lg font-medium text-gray-900">{question.titulo}</h3>
                                            <div className="flex flex-wrap items-center mt-2 text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                                                <span>Data: {new Date(question.created_at).toLocaleDateString('pt-BR')}</span>
                                                <span className="mx-2 hidden sm:inline">•</span>
                                                <span>Categoria: {question.categorias?.nome || 'Sem categoria'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{question.conteudo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
} 