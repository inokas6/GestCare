"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar from '../../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../../componets/Home/navbar_home';

export default function CategoriaPage() {
  const { categoriaId } = useParams();
  const [topicos, setTopicos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar dados da categoria
        const { data: categoriaData, error: categoriaError } = await supabase
          .from('categorias')
          .select('*')
          .eq('id', categoriaId)
          .single();

        if (categoriaError) {
          throw new Error('Erro ao carregar categoria');
        }
        
        setCategoria(categoriaData);

        // Buscar tópicos da categoria
        const { data: topicosData, error: topicosError } = await supabase
          .from('topicos')
          .select(`
            *,
            users:user_id (nome, email)
          `)
          .eq('categoria_id', categoriaId)
          .order('created_at', { ascending: false });

        if (topicosError) {
          throw new Error('Erro ao carregar tópicos');
        }

        setTopicos(topicosData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoriaId) {
      fetchData();
    }
  }, [categoriaId, supabase]);

  // Função para formatar a data
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para truncar conteúdo
  const truncarConteudo = (conteudo, maxLength = 150) => {
    if (conteudo.length <= maxLength) return conteudo;
    return conteudo.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div className="pl-0 sm:pl-48 lg:pl-64 transition-all duration-300">
        <header className="bg-white shadow-sm flex justify-between items-center px-4 sm:px-6 py-4 border-b sticky top-0 z-10">
          <h1 className="text-xl font-bold text-purple-700">
            {categoria?.nome || 'Carregando...'}
          </h1>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Tópicos em {categoria?.nome}
                </h2>
                <p className="text-gray-500">
                  {topicos.length} {topicos.length === 1 ? 'tópico' : 'tópicos'} encontrados
                </p>
              </div>

              {topicos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Nenhum tópico encontrado nesta categoria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topicos.map((topico) => (
                    <div
                      key={topico.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-lg">{topico.titulo}</h3>
                      <p className="text-gray-600 mt-2">{truncarConteudo(topico.conteudo)}</p>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>Por {topico.users?.nome || 'Usuário'}</span>
                        <span className="mx-2">•</span>
                        <span>{formatarData(topico.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}