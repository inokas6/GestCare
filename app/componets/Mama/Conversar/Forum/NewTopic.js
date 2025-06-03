"use client";
import { useState, useEffect } from 'react';
import { forum } from '../../../../../server/api/forum';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { verificarPalavrasProibidas } from './palavrasProibidas';

export default function NewTopic({ onClose, setMessage }) {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showInappropriateModal, setShowInappropriateModal] = useState(false);
    const [inappropriateWord, setInappropriateWord] = useState('');

    useEffect(() => {
        async function fetchCategorias() {
            const { data, error } = await forum.getCategorias();
            if (error) {
                setMessage({ text: error.message, type: 'error' });
                return;
            }
            setCategorias(data);
            if (data.length > 0) {
                setCategoriaId(data[0].id);
            }
        }
        fetchCategorias();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setError(null);

        try {
            // Verificar palavras proibidas no título e conteúdo
            const verificarTitulo = verificarPalavrasProibidas(titulo);
            const verificarConteudo = verificarPalavrasProibidas(conteudo);

            if (verificarTitulo.contemPalavraProibida) {
                setInappropriateWord(verificarTitulo.palavraEncontrada);
                setShowInappropriateModal(true);
                setLoading(false);
                return;
            }

            if (verificarConteudo.contemPalavraProibida) {
                setInappropriateWord(verificarConteudo.palavraEncontrada);
                setShowInappropriateModal(true);
                setLoading(false);
                return;
            }

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('Utilizador não autenticado');
            }

            const { error } = await forum.createTopico(
                titulo,
                conteudo,
                categoriaId,
                user.id
            );

            if (error) throw error;

            // Limpar o formulário
            setTitulo('');
            setConteudo('');
            setCategoriaId(categorias[0]?.id || '');

            // Mostrar mensagem de sucesso
            setMessage({ text: 'Publicação criada com sucesso!', type: 'success' });

            // Atualizar a lista de tópicos
            router.refresh();
            onClose();
        } catch (err) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-black">Nova Publicação</h2>
                
                {error && (
                    <div className="bg-red-200 text-black px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
                        {error}
                    </div>
                )}

                {showInappropriateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-black">Aviso</h3>
                            <p className="mb-6 text-black">Não é possível publicar este conteúdo pois contém palavras inapropriadas.</p>
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

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2">
                            Título
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base text-black"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2">
                            Categoria
                        </label>
                        <select
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base text-black"
                            required
                        >
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.icone} {categoria.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-black text-sm font-bold mb-2">
                            Conteúdo
                        </label>
                        <textarea
                            value={conteudo}
                            onChange={(e) => setConteudo(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base text-black"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 text-black hover:text-gray-800 text-sm sm:text-base"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base"
                        >
                            {loading ? '...' : 'Criar Tópico'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 