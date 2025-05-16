"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../../../componets/Home/navbar_home';
import Sidebar from '../../../../../../componets/Mama/Conversar/Forum/Sidebar';

export default function EditarTopico({ params }) {
    const [topico, setTopico] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
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
                    .eq('id', params.id)
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
    }, [params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                .eq('id', params.id);

            if (error) throw error;

            router.push('/Menu/Mama/Conversar/qna');
        } catch (err) {
            setError('Erro ao salvar as alterações: ' + err.message);
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="">Selecione uma categoria</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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