"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar from '../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../componets/Home/navbar_home';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TopicoPage() {
  const { topicoId } = useParams();
  const router = useRouter();
  const [topico, setTopico] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarioConteudo, setComentarioConteudo] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [topicoEditado, setTopicoEditado] = useState({
    titulo: '',
    conteudo: ''
  });
  const supabase = createClientComponentClient();

  // Buscar dados do tópico, categoria e comentários
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setCurrentUser(userData);
        }

        // Buscar dados do tópico
        const { data: topicoData, error: topicoError } = await supabase
          .from('topicos')
          .select(`
            *,
            users:user_id (id, nome, email, foto_perfil),
            categorias:categoria_id (id, nome, cor)
          `)
          .eq('id', topicoId)
          .single();

        if (topicoError) {
          throw new Error('Erro ao carregar tópico');
        }
        
        setTopico(topicoData);
        setCategoria(topicoData.categorias);
        setTopicoEditado({
          titulo: topicoData.titulo,
          conteudo: topicoData.conteudo
        });

        // Buscar comentários do tópico
        const { data: comentariosData, error: comentariosError } = await supabase
          .from('comentarios')
          .select(`
            *,
            users:user_id (id, nome, email, foto_perfil)
          `)
          .eq('topico_id', topicoId)
          .order('created_at', { ascending: true });

        if (comentariosError) {
          console.error('Erro ao carregar comentários:', comentariosError);
        } else {
          setComentarios(comentariosData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (topicoId) {
      fetchData();
    }
  }, [topicoId, supabase]);

  // Função para formatar a data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    return format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Enviar comentário
  const enviarComentario = async (e) => {
    e.preventDefault();
    
    if (!comentarioConteudo.trim() || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('comentarios')
        .insert({
          conteudo: comentarioConteudo,
          user_id: currentUser.id,
          topico_id: topicoId
        })
        .select(`
          *,
          users:user_id (id, nome, email, foto_perfil)
        `);

      if (error) throw error;
      
      setComentarios([...comentarios, data[0]]);
      setComentarioConteudo('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    }
  };

  // Excluir tópico
  const excluirTopico = async () => {
    try {
      const { error } = await supabase
        .from('topicos')
        .delete()
        .eq('id', topicoId);

      if (error) throw error;
      
      // Redirecionar para a página principal do fórum
      router.push('/mama/conversar/forum');
    } catch (error) {
      console.error('Erro ao excluir tópico:', error);
    }
  };

  // Salvar edição do tópico
  const salvarEdicaoTopico = async () => {
    try {
      const { error } = await supabase
        .from('topicos')
        .update({
          titulo: topicoEditado.titulo,
          conteudo: topicoEditado.conteudo,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicoId);

      if (error) throw error;
      
      // Atualizar o tópico na UI
      setTopico({
        ...topico,
        titulo: topicoEditado.titulo,
        conteudo: topicoEditado.conteudo,
        updated_at: new Date().toISOString()
      });
      
      setModoEdicao(false);
    } catch (error) {
      console.error('Erro ao editar tópico:', error);
    }
  };

  // Excluir comentário
  const excluirComentario = async (comentarioId) => {
    try {
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', comentarioId);

      if (error) throw error;
      
      // Atualizar a lista de comentários
      setComentarios(comentarios.filter(c => c.id !== comentarioId));
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
    }
  };

  // Verificar se o usuário é o autor do tópico
  const isAutor = currentUser?.id === topico?.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div className="pl-0 sm:pl-48 lg:pl-64 transition-all duration-300">
        <header className="bg-white shadow-sm flex justify-between items-center px-4 sm:px-6 py-4 border-b sticky top-0 z-10">
          <h1 className="text-xl font-bold text-purple-700">
            {!isLoading && categoria ? categoria.nome : 'Carregando...'}
          </h1>
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
        </header>

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
            <>
              {/* Tópico principal */}
              <div className="bg-white rounded-xl shadow-sm border mb-6">
                <div className="p-6 relative">
                  {isAutor && (
                    <div className="absolute top-6 right-6">
                      <button
                        onClick={() => setMenuAberto(menuAberto === 'topico' ? null : 'topico')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {menuAberto === 'topico' && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                          <button
                            onClick={() => {
                              setModoEdicao(true);
                              setMenuAberto(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Editar tópico
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir este tópico?')) {
                                excluirTopico();
                              }
                              setMenuAberto(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Excluir tópico
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {modoEdicao ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          id="titulo"
                          value={topicoEditado.titulo}
                          onChange={(e) => setTopicoEditado({...topicoEditado, titulo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 mb-1">
                          Conteúdo
                        </label>
                        <textarea
                          id="conteudo"
                          value={topicoEditado.conteudo}
                          onChange={(e) => setTopicoEditado({...topicoEditado, conteudo: e.target.value})}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={salvarEdicaoTopico}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Salvar alterações
                        </button>
                        <button
                          onClick={() => {
                            setModoEdicao(false);
                            setTopicoEditado({
                              titulo: topico.titulo,
                              conteudo: topico.conteudo
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{topico.titulo}</h2>
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0">
                          {topico.users.foto_perfil ? (
                            <img 
                              src={topico.users.foto_perfil} 
                              alt={topico.users.nome} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-800 font-medium text-sm">
                                {topico.users.nome?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{topico.users.nome}</p>
                          <p className="text-xs text-gray-500">
                            {formatarData(topico.created_at)}
                            {topico.updated_at !== topico.created_at && (
                              <span className="ml-2 italic">(Editado em {formatarData(topico.updated_at)})</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">{topico.conteudo}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Seção de comentários */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Comentários ({comentarios.length})
                  </h3>

                  {/* Lista de comentários */}
                  {comentarios.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Seja o primeiro a comentar neste tópico.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comentarios.map((comentario) => (
                        <div key={comentario.id} className="border-b pb-6 last:border-b-0 last:pb-0 relative">
                          {currentUser?.id === comentario.users.id && (
                            <div className="absolute top-0 right-0">
                              <button
                                onClick={() => setMenuAberto(menuAberto === comentario.id ? null : comentario.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              {menuAberto === comentario.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
                                        excluirComentario(comentario.id);
                                      }
                                      setMenuAberto(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Excluir comentário
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              {comentario.users.foto_perfil ? (
                                <img 
                                  src={comentario.users.foto_perfil} 
                                  alt={comentario.users.nome} 
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-800 font-medium text-xs">
                                    {comentario.users.nome?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">{comentario.users.nome}</h4>
                                <span className="ml-2 text-xs text-gray-500">{formatarData(comentario.created_at)}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                                {comentario.conteudo}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário para adicionar comentário */}
                  {currentUser ? (
                    <form onSubmit={enviarComentario} className="mt-8">
                      <div>
                        <label htmlFor="comentario" className="sr-only">Adicionar comentário</label>
                        <textarea
                          id="comentario"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-3"
                          placeholder="Adicione um comentário..."
                          value={comentarioConteudo}
                          onChange={(e) => setComentarioConteudo(e.target.value)}
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          disabled={!comentarioConteudo.trim()}
                        >
                          Comentar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600">Faça login para participar da discussão.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}