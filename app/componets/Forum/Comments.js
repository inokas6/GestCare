"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { forum } from '../../lib/supabase';

export default function Comments({ topicId }) {
    const [respostas, setRespostas] = useState([]);
    const [novaResposta, setNovaResposta] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchRespostas() {
            try {
                const { data, error } = await forum.getRespostas(topicId);
                if (error) throw error;
                setRespostas(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchRespostas();
    }, [topicId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!novaResposta.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { error } = await forum.addResposta(
                novaResposta,
                topicId,
                user.id
            );

            if (error) throw error;

            // Atualizar a lista de respostas
            const { data: updatedRespostas } = await forum.getRespostas(topicId);
            setRespostas(updatedRespostas);
            setNovaResposta('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-4">Carregando comentários...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Erro: {error}</div>;

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={novaResposta}
                    onChange={(e) => setNovaResposta(e.target.value)}
                    placeholder="Adicione sua resposta..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows="3"
                    required
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {submitting ? 'Enviando...' : 'Responder'}
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {respostas.map((resposta) => (
                    <div key={resposta.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-800">{resposta.conteudo}</p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </button>
                                <span className="text-sm text-gray-500">
                                    {resposta.reacoes}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 