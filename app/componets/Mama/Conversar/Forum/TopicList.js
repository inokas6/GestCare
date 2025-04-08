"use client";
import { useEffect, useState } from 'react';
import { forum } from '../../../../../server/api/forum';
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

    if (loading) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Carregando...</div>;
    if (error) return <div className="text-red-500 text-center py-4 sm:py-8 text-sm sm:text-base">Erro: {error}</div>;

    return (
        <div className="space-y-3 sm:space-y-4">
            {topicos.map((topico) => (
                <div key={topico.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                        <div className="w-full sm:w-auto">
                            <Link href={`/Menu/Mama/Conversar/topicos/${topico.id}`}>
                                <h3 className="text-base sm:text-lg font-semibold text-purple-600 hover:text-purple-700">
                                    {topico.titulo}
                                </h3>
                            </Link>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-2">{topico.conteudo}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="text-purple-600">
                                {topico.categorias?.nome}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <img 
                                src={topico.users?.foto_perfil || '/default-avatar.png'} 
                                alt={topico.users?.nome}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                            />
                            <div>
                                <span className="text-sm text-gray-500">
                                    Por {topico.users?.nome}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500 block">
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
                    </div>
                </div>
            ))}
        </div>
    );
} 