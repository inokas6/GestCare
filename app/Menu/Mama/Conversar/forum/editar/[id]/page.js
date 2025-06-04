"use client";
import { useState, useEffect, use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../../../componets/Home/navbar_home';
import Sidebar from '../../../../../../componets/Mama/Conversar/Forum/Sidebar';
import { verificarPalavrasProibidas } from '../../../../../../componets/Mama/Conversar/Forum/palavrasProibidas';

export default function EditarTopico({ params }) {
    const id = use(params).id;
    const [topico, setTopico] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showInappropriateModal, setShowInappropriateModal] = useState(false);
    const [inappropriateWord, setInappropriateWord] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('user não autenticado');

                // Buscar o tópico
                const { data: topicoData, error: topicoError } = await supabase
                    .from('topicos')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (topicoError) throw topicoError;
                if (topicoData.user_id !== session.user.id) {
                    throw new Error('Você não tem permissão para editar esta publicação');
                }

                setTopico(topicoData);
                setTitulo(topicoData.titulo);
                setConteudo(topicoData.conteudo);
                setCategoriaId(topicoData.categoria_id);

                // Buscar categorias
                const { data: categoriasData, error: categoriasError } = await supabase
                    .from('categorias')
                    .select('*')
                    .order('nome');

                if (categoriasError) throw categoriasError;
                setCategorias(categoriasData);
            } catch (err) {
                setError(err.message);
                setMessage({ text: err.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificar palavras proibidas no título e conteúdo
        const verificarTitulo = verificarPalavrasProibidas(titulo);
        const verificarConteudo = verificarPalavrasProibidas(conteudo);

        if (verificarTitulo.contemPalavraProibida) {
            setInappropriateWord(verificarTitulo.palavraEncontrada);
            setShowInappropriateModal(true);
            return;
        }

        if (verificarConteudo.contemPalavraProibida) {
            setInappropriateWord(verificarConteudo.palavraEncontrada);
            setShowInappropriateModal(true);
            return;
        }

        setPendingAction({
            type: 'save',
            message: 'Tem certeza que deseja guardar as alterações?',
            callback: async () => {
                setIsSaving(true);
                setError(null);

                try {
                    const { error } = await supabase
                        .from('topicos')
                        .update({
                            titulo,
                            conteudo,
                            categoria_id: categoriaId,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', id);

                    if (error) throw error;

                    setMessage({ text: 'Publicação atualizada com sucesso!', type: 'success' });
                    setTimeout(() => {
                        router.push('/Menu/Mama/Conversar/qna');
                    }, 2000);
                } catch (err) {
                    setMessage({ text: 'Erro ao guardar as alterações: ' + err.message, type: 'error' });
                } finally {
                    setIsSaving(false);
                }
            }
        });
        setShowConfirmDialog(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar />
                <div className="pl-0 sm:pl-48 lg:pl-64 mt-[80px]">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar />
                <div className="pl-0 sm:pl-48 lg:pl-64 mt-[80px]">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            
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

            {showInappropriateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Aviso</h3>
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

            <div className="pl-0 sm:pl-48 lg:pl-64 mt-[80px]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Publicação</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                                Título
                            </label>
                            <input
                                type="text"
                                id="titulo"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                                Categoria
                            </label>
                            <select
                                id="categoria"
                                value={categoriaId}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                            >
                                <option value="" className="text-black">Selecione uma categoria</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id} className="text-black">
                                        {categoria.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 mb-1">
                                Conteúdo
                            </label>
                            <textarea
                                id="conteudo"
                                value={conteudo}
                                onChange={(e) => setConteudo(e.target.value)}
                                required
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-black"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isSaving ? '...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 