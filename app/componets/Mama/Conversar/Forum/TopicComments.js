"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { verificarPalavrasProibidas } from './palavrasProibidas';

export default function TopicComments({ topicoId, setMessage }) {
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showInappropriateModal, setShowInappropriateModal] = useState(false);
    const [inappropriateWord, setInappropriateWord] = useState('');
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
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!novoComentario.trim()) return;

        try {
            // Verificar palavras proibidas no comentário
            const verificarComentario = verificarPalavrasProibidas(novoComentario);

            if (verificarComentario.contemPalavraProibida) {
                setInappropriateWord(verificarComentario.palavraEncontrada);
                setShowInappropriateModal(true);
                return;
            }

            // Obter a sessão atual
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            if (!session) throw new Error('Usuário não autenticado');

            const { error: insertError } = await supabase
                .from('comentarios')
                .insert([
                    {
                        conteudo: novoComentario,
                        topico_id: topicoId,
                        user_id: session.user.id
                    }
                ]);

            if (insertError) throw insertError;

            setNovoComentario('');
            setMessage({ text: 'Comentário adicionado com sucesso!', type: 'success' });
            fetchComentarios(); // Recarregar comentários após adicionar um novo
        } catch (err) {
            console.error('Erro ao adicionar comentário:', err);
            setMessage({ text: err.message, type: 'error' });
        }
    };

    if (loading) return <div className="text-center py-2 text-sm text-black">...</div>;
    if (error) return <div className="text-center py-2 text-sm text-black">Erro: {error}</div>;

    return (
        <div className="mt-4 space-y-4">
            {showInappropriateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-black">Aviso</h3>
                        <p className="mb-6 text-black">Não é possível publicar este comentário pois contém palavras inapropriadas.</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setShowInappropriateModal(false);
                                    setInappropriateWord('');
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-black"
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
                                <span className="font-medium text-sm text-black">{comentario.users?.nome}</span>
                                <span className="text-xs text-black">
                                    {new Date(comentario.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-black mt-1">{comentario.conteudo}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 