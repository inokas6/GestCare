"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar from '../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../componets/Home/navbar_home';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConversarPage() {
  const [topicos, setTopicos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTopicos = async () => {
      try {
        const { data, error } = await supabase
          .from('topicos')
          .select(`
            *,
            users:user_id (id, nome, foto_perfil),
            categorias:categoria_id (id, nome, cor)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        setTopicos(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicos();
  }, []);

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div className="pl-0 sm:pl-48 lg:pl-64">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {topicos.map((topico) => (
                <div key={topico.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        {topico.titulo}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span>Por {topico.users?.nome}</span>
                        <span className="mx-2">•</span>
                        <span>{formatarData(topico.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span className="text-purple-600">{topico.categorias?.nome}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">
                        {topico.conteudo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}