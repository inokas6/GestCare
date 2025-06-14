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
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        async function fetchTopico() {
            try {
                const { data, error } = await forum.getTopicos(null, params.id);
                if (error) throw error;
                setTopico(data[0]);
            } catch (err) {
                setError(err.message);
                setMessage({ text: err.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        }

        fetchTopico();
    }, [params.id]);

    const handleReacao = async (tipo) => {
        try {
            const { error } = await forum.addReacao(tipo, topico.id);
            if (error) throw error;

            // Atualizar o número de reações localmente
            setTopico(prev => ({
                ...prev,
                reacoes: prev.reacoes + 1
            }));

            setMessage({ text: 'Reação adicionada com sucesso!', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Erro ao adicionar reação: ' + err.message, type: 'error' });
        }
    };

    if (loading) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">...</div>;
    if (error) return <div className="text-red-500 text-center py-4 sm:py-8 text-sm sm:text-base">Erro: {error}</div>;
    if (!topico) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Publicação não encontrada</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="pl-0 sm:pl-48 lg:pl-64">
                {message.text && (
                    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] ${
                        message.type === 'success' ? 'bg-green-200' : message.type === 'error' ? 'bg-red-200' : 'bg-blue-200'
                    } text-black`}>
                        {message.text}
                    </div>
                )}

                {showConfirmDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
                            <h3 className="text-lg font-semibold mb-4 text-black">Confirmar ação</h3>
                            <p className="mb-6 text-black">{pendingAction?.message || 'Tem certeza que deseja realizar esta ação?'}</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-black"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        if (pendingAction?.callback) {
                                            pendingAction.callback();
                                        }
                                        setShowConfirmDialog(false);
                                        setPendingAction(null);
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                    onClick={() => {
                                        setPendingAction({
                                            type: 'reacao',
                                            message: 'Deseja adicionar uma reação a esta publicação?',
                                            callback: () => handleReacao('like')
                                        });
                                        setShowConfirmDialog(true);
                                    }}
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