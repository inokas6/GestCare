"use client";
import { useState, useEffect } from 'react';
import { forum } from '../../lib/supabase';
import Image from 'next/image';

export default function TopUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTopUsers() {
            try {
                const { data, error } = await forum.getTopUsers();
                if (error) throw error;
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTopUsers();
    }, []);

    if (loading) return <div className="text-center py-4">Carregando...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Erro: {error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Utilizadores Mais Ativos</h3>
            <div className="space-y-4">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {user.foto_perfil ? (
                                <Image
                                    src={user.foto_perfil}
                                    alt={user.nome}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    {user.nome.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.nome}</p>
                            <p className="text-sm text-gray-500">
                                {user.topicos} tópicos • {user.respostas} respostas
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 