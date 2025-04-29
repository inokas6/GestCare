"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ViewOnlyComments({ topicoId }) {
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchComentarios();
    }, [topicoId]);

    const fetchComentarios = async () => {
        try {
            setLoading(true);
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

            if (error) throw error;
            setComentarios(data || []);
        } catch (err) {
            console.error('Erro ao carregar comentários:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-2 text-sm text-gray-500">Carregando comentários...</div>;
    if (error) return <div className="text-center py-2 text-sm text-red-500">Erro: {error}</div>;

    return (
        <div className="mt-4">
            {comentarios.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">Nenhum comentário ainda</p>
            ) : (
                <div className="space-y-3">
                    {comentarios.map((comentario) => (
                        <div key={comentario.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {comentario.users?.foto_perfil ? (
                                    <img
                                        src={comentario.users.foto_perfil}
                                        alt={comentario.users.nome}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600">
                                        {comentario.users?.nome?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comentario.users?.nome}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comentario.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{comentario.conteudo}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 