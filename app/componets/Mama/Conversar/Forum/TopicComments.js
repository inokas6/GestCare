"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

export default function TopicComments({ topicoId }) {
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!novoComentario.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { error } = await supabase
                .from('comentarios')
                .insert([
                    {
                        conteudo: novoComentario,
                        topico_id: topicoId,
                        user_id: user.id
                    }
                ]);

            if (error) throw error;

            setNovoComentario('');
            fetchComentarios();
        } catch (err) {
            console.error('Erro ao adicionar comentário:', err);
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center py-2 text-sm text-gray-500">Carregando comentários...</div>;
    if (error) return <div className="text-center py-2 text-sm text-red-500">Erro: {error}</div>;

    return (
        <div className="mt-4 space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                    type="submit"
                    disabled={!novoComentario.trim()}
                    className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    Comentar
                </button>
            </form>

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
        </div>
    );
} 