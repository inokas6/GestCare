"use client";
import { useState, useEffect } from 'react';
import { forum } from '../../../../../server/api/forum';
import { supabase } from '../../../../../lib/supabase';
import Comments from '../../../../../componets/Mama/Conversar/Forum/Comments';
import { useParams } from 'next/navigation';
import Sidebar from '../../../../../componets/Mama/Conversar/Forum/Sidebar';

export default function TopicoPage() {
    const params = useParams();
    const [topico, setTopico] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTopico() {
            try {
                const { data, error } = await forum.getTopicos(null, params.id);
                if (error) throw error;
                setTopico(data[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTopico();
    }, [params.id]);

    if (loading) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Carregando...</div>;
    if (error) return <div className="text-red-500 text-center py-4 sm:py-8 text-sm sm:text-base">Erro: {error}</div>;
    if (!topico) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Tópico não encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="pl-0 sm:pl-48 lg:pl-64">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                    {topico.titulo}
                                </h1>
                                <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                                    <span>Por {topico.users?.nome}</span>
                                    <span className="mx-2 hidden sm:inline">•</span>
                                    <span>
                                        {new Date(topico.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="mx-2 hidden sm:inline">•</span>
                                    <span className="text-purple-600">
                                        {topico.categorias?.nome}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => forum.addReacao('like', topico.id)}
                                    className="text-gray-400 hover:text-purple-600"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </button>
                                <span className="text-xs sm:text-sm text-gray-500">
                                    {topico.reacoes} reações
                                </span>
                            </div>
                        </div>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 text-sm sm:text-base">{topico.conteudo}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">
                            {topico.respostas} Respostas
                        </h2>
                        <Comments topicId={topico.id} />
                    </div>
                </div>
            </div>
        </div>
    );
} 