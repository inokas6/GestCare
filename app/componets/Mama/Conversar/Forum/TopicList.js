"use client";
import { useEffect, useState } from 'react';
import { forum } from '../../../../lib/supabase';
import Link from 'next/link';

export default function TopicList() {
    const [topicos, setTopicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTopicos() {
            try {
                const { data, error } = await forum.getTopicos();
                if (error) throw error;
                setTopicos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTopicos();
    }, []);

    if (loading) return <div className="text-center py-8">Carregando...</div>;
    if (error) return <div className="text-red-500 text-center py-8">Erro: {error}</div>;

    return (
        <div className="space-y-4">
            {topicos.map((topico) => (
                <div key={topico.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link href={`/Menu/Mama/Conversar/topicos/${topico.id}`}>
                                <h3 className="text-lg font-semibold text-purple-600 hover:text-purple-700">
                                    {topico.titulo}
                                </h3>
                            </Link>
                            <p className="text-gray-600 mt-2">{topico.conteudo}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                {topico.respostas} respostas
                            </span>
                            <span className="text-sm text-gray-500">
                                {topico.reacoes} reações
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <img 
                                src={topico.users?.foto_perfil || '/default-avatar.png'} 
                                alt={topico.users?.nome}
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <span className="text-sm text-gray-500">
                                    Por {topico.users?.nome}
                                </span>
                                <span className="text-sm text-gray-500 block">
                                    {new Date(topico.created_at).toLocaleDateString('pt-PT', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                {topico.respostas} {topico.respostas === 1 ? 'resposta' : 'respostas'}
                            </span>
                            <span className="text-sm text-purple-600">
                                {topico.categorias?.nome}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 