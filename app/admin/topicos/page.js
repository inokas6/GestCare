'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TopicosPage() {
  const [topicos, setTopicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTopico, setEditingTopico] = useState(null);
  const [showNewTopicoForm, setShowNewTopicoForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [newTopico, setNewTopico] = useState({ 
    titulo: '', 
    conteudo: '', 
    user_id: '', 
    categoria_id: '' 
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTopicos();
    fetchCategorias();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchTopicos = async () => {
    try {
      const { data, error } = await supabase
        .from('topicos')
        .select(`
          *,
          users (nome),
          categorias (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopicos(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*');

      if (error) throw error;
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleEdit = (topico) => {
    setEditingTopico(topico);
  };

  const handleDelete = async (topicoId) => {
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar este tópico? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('topicos')
            .delete()
            .eq('id', topicoId);

          if (error) throw error;

          setTopicos(topicos.filter(topico => topico.id !== topicoId));
          setMessage({ text: 'Tópico eliminado com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao excluir tópico:', error);
          setMessage({ text: 'Erro ao eliminar tópico: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setPendingAction({
      type: 'save',
      message: 'Deseja salvar as alterações deste tópico?',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('topicos')
            .update({
              titulo: editingTopico.titulo,
              conteudo: editingTopico.conteudo,
              categoria_id: editingTopico.categoria_id
            })
            .eq('id', editingTopico.id);

          if (error) throw error;

          setTopicos(topicos.map(topico => 
            topico.id === editingTopico.id ? editingTopico : topico
          ));
          setEditingTopico(null);
          setMessage({ text: 'Tópico atualizado com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao atualizar tópico:', error);
          setMessage({ text: 'Erro ao atualizar tópico: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleCreateTopico = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('topicos')
        .insert([newTopico])
        .select()
        .single();

      if (error) throw error;

      setTopicos([data, ...topicos]);
      setNewTopico({ titulo: '', conteudo: '', user_id: '', categoria_id: '' });
      setShowNewTopicoForm(false);
      setMessage({ text: 'Tópico criado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      setMessage({ text: 'Erro ao criar tópico: ' + error.message, type: 'error' });
    }
  };

  const filteredTopicos = topicos.filter(topico =>
    topico.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topico.conteudo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-200' : 'bg-red-200'
        } text-black`}>
          {message.text}
        </div>
      )}

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

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Gestão de Tópicos</h1>
        <button 
          onClick={() => setShowNewTopicoForm(true)}
          className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800"
        >
          Novo Tópico
        </button>
      </div>

      {showNewTopicoForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Novo Tópico</h2>
          <form onSubmit={handleCreateTopico} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={newTopico.titulo}
                onChange={(e) => setNewTopico({...newTopico, titulo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
              <textarea
                value={newTopico.conteudo}
                onChange={(e) => setNewTopico({...newTopico, conteudo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                value={newTopico.categoria_id}
                onChange={(e) => setNewTopico({...newTopico, categoria_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário</label>
              <select
                value={newTopico.user_id}
                onChange={(e) => setNewTopico({...newTopico, user_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                required
              >
                <option value="">Selecione um usuário</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTopicoForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-700 text-white rounded-md hover:bg-pink-800"
              >
                Criar Tópico
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar tópicos..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTopicos.map((topico) => (
                  <tr key={topico.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTopico?.id === topico.id ? (
                        <input
                          type="text"
                          value={editingTopico.titulo}
                          onChange={(e) => setEditingTopico({...editingTopico, titulo: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{topico.titulo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingTopico?.id === topico.id ? (
                        <textarea
                          value={editingTopico.conteudo}
                          onChange={(e) => setEditingTopico({...editingTopico, conteudo: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="3"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{topico.conteudo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTopico?.id === topico.id ? (
                        <select
                          value={editingTopico.categoria_id}
                          onChange={(e) => setEditingTopico({...editingTopico, categoria_id: e.target.value})}
                          className="border rounded px-2 py-1"
                        >
                          {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-500">{topico.categorias?.nome}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topico.users?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(topico.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingTopico?.id === topico.id ? (
                        <>
                          <button 
                            onClick={handleSave}
                            className="text-pink-700 hover:text-pink-900 mr-3"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingTopico(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(topico)}
                            className="text-pink-700 hover:text-pink-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(topico.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 