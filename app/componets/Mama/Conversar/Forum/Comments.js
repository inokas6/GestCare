"use client";
import { useState, useEffect } from 'react';
import { forum } from '../../../../server/api/forum';
import { supabase } from '../../../../lib/supabase';

export default function Comments({ topicId }) {
    const [respostas, setRespostas] = useState([]);
    const [novaResposta, setNovaResposta] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showInappropriateModal, setShowInappropriateModal] = useState(false);
    const [inappropriateWord, setInappropriateWord] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        async function fetchRespostas() {
            try {
                const { data, error } = await forum.getRespostas(topicId);
                if (error) throw error;
                setRespostas(data || []);
            } catch (err) {
                setError(err.message);
                setMessage({ text: 'Erro ao carregar comentários: ' + err.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        }

        fetchRespostas();
    }, [topicId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!novaResposta.trim()) return;

        try {
            // Verificar palavras proibidas no comentário
            const verificarComentario = verificarPalavrasProibidas(novaResposta);

            if (verificarComentario.contemPalavraProibida) {
                setInappropriateWord(verificarComentario.palavraEncontrada);
                setShowInappropriateModal(true);
                return;
            }

            setShowConfirmModal(true);
        } catch (err) {
            console.error('Erro ao verificar comentário:', err);
            setError(err.message);
            setMessage({ text: 'Erro ao verificar comentário: ' + err.message, type: 'error' });
        }
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        setError(null);
        setShowConfirmModal(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { error } = await forum.addResposta(
                novaResposta,
                topicId,
                user.id
            );

            if (error) {
                if (error.message.includes('palavras inapropriadas')) {
                    setMessage({ text: 'Não é possível publicar este comentário pois contém palavras inapropriadas.', type: 'error' });
                } else {
                    throw error;
                }
                return;
            }

            const { data: updatedRespostas } = await forum.getRespostas(topicId);
            setRespostas(updatedRespostas || []);
            setNovaResposta('');
            setMessage({ text: 'Comentário publicado com sucesso!', type: 'success' });
        } catch (err) {
            setError(err.message);
            setMessage({ text: 'Erro ao publicar comentário: ' + err.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-3 sm:py-4 text-sm sm:text-base">carregando</div>;
    if (error) return <div className="text-red-500 text-center py-3 sm:py-4 text-sm sm:text-base">Erro: {error}</div>;

    return (
        <div className="space-y-4 sm:space-y-6">
            {message.text && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] ${
                    message.type === 'success' ? 'bg-green-200' : 'bg-red-200'
                } text-black`}>
                    {message.text}
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-black">Confirmar publicação</h3>
                        <p className="mb-6 text-black">Tem certeza que deseja publicar este comentário?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-black"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showInappropriateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Aviso</h3>
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

            <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
                <textarea
                    value={novaResposta}
                    onChange={(e) => setNovaResposta(e.target.value)}
                    placeholder="Respondercarregando"
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
                    rows="3"
                    required
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                    >
                        {submitting ? 'carregando' : 'Responder'}
                    </button>
                </div>
            </form>

            <div className="space-y-3 sm:space-y-4">
                {respostas.map((resposta) => (
                    <div key={resposta.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                            <div className="w-full sm:w-auto">
                                <p className="text-gray-800 text-sm sm:text-base">{resposta.conteudo}</p>
                                <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500">
                                    <span>Por {resposta.users?.nome}</span>
                                    <span className="mx-2">•</span>
                                    <span>
                                        {new Date(resposta.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => forum.addReacao('like', resposta.id)}
                                    className="text-gray-400 hover:text-purple-600"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </button>
                                <span className="text-xs sm:text-sm text-gray-500">
                                    {resposta.reacoes || 0} reações
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 