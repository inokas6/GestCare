"use client";
import { useState, useEffect } from 'react';
import { forum, supabase } from '../../../../../lib/supabase';
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
                const { data, error } = await supabase
                    .from('topicos')
                    .select(`
                        *,
                        users:nome,
                        categorias:nome,
                        respostas:respostas(count),
                        reacoes:reacoes(count)
                    `)
                    .eq('id', params.id)
                    .single();

                if (error) throw error;

                // Transformar os objetos count em números
                if (data) {
                    data.respostas = data.respostas?.[0]?.count || 0;
                    data.reacoes = data.reacoes?.[0]?.count || 0;
                }

                setTopico(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTopico();
    }, [params.id]);

    if (loading) return <div className="text-center py-8">Carregando...</div>;
    if (error) return <div className="text-red-500 text-center py-8">Erro: {error}</div>;
    if (!topico) return <div className="text-center py-8">Tópico não encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="pl-64">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                    {topico.titulo}
                                </h1>
                                <div className="flex items-center text-sm text-gray-500">
                                    <span>Por {topico.users?.nome}</span>
                                    <span className="mx-2">•</span>
                                    <span>
                                        {new Date(topico.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="mx-2">•</span>
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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </button>
                                <span className="text-sm text-gray-500">
                                    {topico.reacoes} reações
                                </span>
                            </div>
                        </div>
                        <div className="prose max-w-none">
                            <p className="text-gray-700">{topico.conteudo}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {topico.respostas} Respostas
                        </h2>
                        <Comments topicoId={topico.id} />
                    </div>
                </div>
            </div>
        </div>
    );
} 