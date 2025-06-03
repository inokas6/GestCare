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
    const [successMessage, setSuccessMessage] = useState('');
    
    const router = useRouter();
    const supabase = createClientComponentClient();

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

        if (!confirm('Tem certeza que deseja guardar as alterações?')) return;

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

            setSuccessMessage('Publicação atualizada com sucesso!');
            setTimeout(() => {
                setSuccessMessage('');
                router.push('/Menu/Mama/Conversar/qna');
            }, 2000);
        } catch (err) {
            setError('Erro ao guardar as alterações: ' + err.message);
        } finally {
            setIsSaving(false);
        }
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
            {successMessage && (
                <div className="fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
                    {successMessage}
                </div>
            )}
            {showInappropriateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Aviso</h3>
                        <p className="mb-6 text-black">Não é possível publicar este conteúdo pois contém palavras inapropriadas.</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setShowInappropriateModal(false);
                                    setInappropriateWord('');
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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