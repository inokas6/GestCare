"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar from '../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../componets/Home/navbar_home';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NewTopic from '../../../componets/Mama/Conversar/Forum/NewTopic';
import TopicComments from '../../../componets/Mama/Conversar/Forum/TopicComments';

export default function ConversarPage() {
  const [topicos, setTopicos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [comentariosAbertos, setComentariosAbertos] = useState({});
  const [topicosFiltrados, setTopicosFiltrados] = useState([]);
  const [ordemAtual, setOrdemAtual] = useState('recente'); // 'recente', 'antigo', 'comentarios'
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTopicos = async () => {
      try {
        const { data, error } = await supabase
          .from('topicos')
          .select(`
            *,
            users:user_id (id, nome, foto_perfil),
            categorias:categoria_id (id, nome, cor),
            comentarios:comentarios(count)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        const topicosProcessados = data.map(topico => ({
          ...topico,
          totalComentarios: topico.comentarios?.[0]?.count || 0
        }));
        
        setTopicos(topicosProcessados);
        setTopicosFiltrados(topicosProcessados);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicos();
  }, []);

  useEffect(() => {
    const filtrarEOrdenarTopicos = () => {
      let resultado = [...topicos];

      // Aplicar filtro de busca
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        resultado = resultado.filter(topico => 
          topico.titulo.toLowerCase().includes(query) ||
          topico.conteudo.toLowerCase().includes(query) ||
          topico.users?.nome?.toLowerCase().includes(query) ||
          topico.categorias?.nome?.toLowerCase().includes(query)
        );
      }

      // Aplicar ordenação
      switch (ordemAtual) {
        case 'recente':
          resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'antigo':
          resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'comentarios':
          resultado.sort((a, b) => b.totalComentarios - a.totalComentarios);
          break;
        default:
          break;
      }

      setTopicosFiltrados(resultado);
    };

    filtrarEOrdenarTopicos();
  }, [searchQuery, topicos, ordemAtual]);

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return format(new Date(dataString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const toggleComentarios = (topicoId) => {
    setComentariosAbertos(prev => ({
      ...prev,
      [topicoId]: !prev[topicoId]
    }));
  };

  // Adicionar useEffect para limpar mensagens após 5 segundos
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div className="pl-0 sm:pl-48 lg:pl-64 mt-[80px]">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Mensagem de feedback */}
          {message.text && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              message.type === 'success' ? 'bg-green-200' : 'bg-red-200'
            } text-black`}>
              {message.text}
            </div>
          )}

          {/* Diálogo de confirmação */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

          {/* Barra de pesquisa e botão New Topic */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Pesquise publicações"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={() => setShowNewTopic(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Publicação
              </button>
            </div>

            {/* Ordenação */}
            <div className="flex gap-4 items-center">
              <select
                value={ordemAtual}
                onChange={(e) => setOrdemAtual(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              >
                <option value="recente">Mais recentes</option>
                <option value="antigo">Mais antigos</option>
                <option value="comentarios">Mais comentados</option>
              </select>
            </div>
          </div>

          {/* Modal do New Topic */}
          {showNewTopic && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-black">Nova Publicação</h2>
                  <button
                    onClick={() => setShowNewTopic(false)}
                    className="text-black hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <NewTopic onClose={() => setShowNewTopic(false)} setMessage={setMessage} />
              </div>
            </div>
          )}

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
              {topicosFiltrados.map((topico) => (
                <div key={topico.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {topico.users?.foto_perfil ? (
                        <img 
                          src={topico.users.foto_perfil} 
                          alt={topico.users.nome} 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-800 font-medium text-lg">
                            {topico.users?.nome?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-black mb-2">
                        {topico.titulo}
                      </h2>
                      <div className="flex items-center text-sm text-black mb-4">
                        <span className="font-medium text-black">{topico.users?.nome}</span>
                        <span className="mx-2">•</span>
                        <span>{formatarData(topico.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span className="text-purple-600">{topico.categorias?.nome}</span>
                      </div>
                      <p className="text-black whitespace-pre-line">
                        {topico.conteudo}
                      </p>
                      
                      {/* Botão de comentários */}
                      <div className="mt-4 border-t pt-4">
                        <button
                          onClick={() => toggleComentarios(topico.id)}
                          className="flex items-center text-black hover:text-purple-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {topico.totalComentarios} comentários
                        </button>
                      </div>

                      {/* Comentários */}
                      {comentariosAbertos[topico.id] && (
                        <TopicComments topicoId={topico.id} setMessage={setMessage} />
                      )}
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