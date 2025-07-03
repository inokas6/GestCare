'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [showNewCategoriaForm, setShowNewCategoriaForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [newCategoria, setNewCategoria] = useState({ 
    nome: '',
    descricao: '',
    cor: '#4ADE80',
    icone: '📝',
    ordem: 0,
    ativa: true
  });
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
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setCategorias(data);
    } catch (error) {
      console.error('Erro:', error);
      setMessage({ text: 'Erro ao carregar categorias: ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
  };

  const handleDelete = async (categoriaId) => {
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar esta categoria? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', categoriaId);

          if (error) throw error;

          setCategorias(categorias.filter(categoria => categoria.id !== categoriaId));
          setMessage({ text: 'Categoria eliminada com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao excluir categoria:', error);
          setMessage({ text: 'Erro ao eliminar categoria: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setPendingAction({
      type: 'save',
      message: 'Deseja salvar as alterações desta categoria?',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('categorias')
            .update({
              nome: editingCategoria.nome,
              descricao: editingCategoria.descricao,
              cor: editingCategoria.cor,
              icone: editingCategoria.icone,
              ordem: editingCategoria.ordem,
              ativa: editingCategoria.ativa
            })
            .eq('id', editingCategoria.id);

          if (error) throw error;

          setCategorias(categorias.map(categoria => 
            categoria.id === editingCategoria.id ? editingCategoria : categoria
          ));
          setEditingCategoria(null);
          setMessage({ text: 'Categoria atualizada com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao atualizar categoria:', error);
          setMessage({ text: 'Erro ao atualizar categoria: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([newCategoria])
        .select()
        .single();

      if (error) throw error;

      setCategorias([...categorias, data].sort((a, b) => a.ordem - b.ordem));
      setNewCategoria({ 
        nome: '',
        descricao: '',
        cor: '#4ADE80',
        icone: '📝',
        ordem: 0,
        ativa: true
      });
      setShowNewCategoriaForm(false);
      setMessage({ text: 'Categoria criada com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setMessage({ text: 'Erro ao criar categoria: ' + error.message, type: 'error' });
    }
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl text-black font-semibold">Gestão de Categorias</h1>
        <button 
          onClick={() => setShowNewCategoriaForm(true)}
          className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800"
        >
          Nova Categoria
        </button>
      </div>

      {showNewCategoriaForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Nova Categoria</h2>
          <form onSubmit={handleCreateCategoria} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={newCategoria.nome}
                onChange={(e) => setNewCategoria({...newCategoria, nome: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                value={newCategoria.descricao}
                onChange={(e) => setNewCategoria({...newCategoria, descricao: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cor</label>
                <input
                  type="color"
                  value={newCategoria.cor}
                  onChange={(e) => setNewCategoria({...newCategoria, cor: e.target.value})}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ícone</label>
                <input
                  type="text"
                  value={newCategoria.icone}
                  onChange={(e) => setNewCategoria({...newCategoria, icone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                  maxLength="2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ordem</label>
                <input
                  type="number"
                  value={newCategoria.ordem}
                  onChange={(e) => setNewCategoria({...newCategoria, ordem: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCategoria.ativa}
                    onChange={(e) => setNewCategoria({...newCategoria, ativa: e.target.checked})}
                    className="rounded border-gray-300 text-pink-700 focus:ring-pink-700"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativa</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewCategoriaForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-700 text-white rounded-md hover:bg-pink-800"
              >
                Criar Categoria
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Procurar categorias..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-4 text-center">A carregar...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ícone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategorias.map((categoria) => (
                  <tr key={categoria.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategoria?.id === categoria.id ? (
                        <input
                          type="text"
                          value={editingCategoria.icone}
                          onChange={(e) => setEditingCategoria({...editingCategoria, icone: e.target.value})}
                          className="border rounded px-2 py-1 w-16"
                          maxLength="2"
                        />
                      ) : (
                        <div className="text-2xl">{categoria.icone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategoria?.id === categoria.id ? (
                        <input
                          type="text"
                          value={editingCategoria.nome}
                          onChange={(e) => setEditingCategoria({...editingCategoria, nome: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{categoria.nome}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingCategoria?.id === categoria.id ? (
                        <textarea
                          value={editingCategoria.descricao}
                          onChange={(e) => setEditingCategoria({...editingCategoria, descricao: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="2"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{categoria.descricao}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategoria?.id === categoria.id ? (
                        <input
                          type="color"
                          value={editingCategoria.cor}
                          onChange={(e) => setEditingCategoria({...editingCategoria, cor: e.target.value})}
                          className="border rounded px-2 py-1 w-20 h-8"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <span className="text-sm text-gray-500">{categoria.cor}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategoria?.id === categoria.id ? (
                        <input
                          type="number"
                          value={editingCategoria.ordem}
                          onChange={(e) => setEditingCategoria({...editingCategoria, ordem: parseInt(e.target.value)})}
                          className="border rounded px-2 py-1 w-20"
                          min="0"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{categoria.ordem}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategoria?.id === categoria.id ? (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingCategoria.ativa}
                            onChange={(e) => setEditingCategoria({...editingCategoria, ativa: e.target.checked})}
                            className="rounded border-gray-300 text-pink-700 focus:ring-pink-700"
                          />
                        </label>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          categoria.ativa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {categoria.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingCategoria?.id === categoria.id ? (
                        <>
                          <button 
                            onClick={handleSave}
                            className="text-pink-700 hover:text-pink-900 mr-3"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingCategoria(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(categoria)}
                            className="text-pink-700 hover:text-pink-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(categoria.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
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