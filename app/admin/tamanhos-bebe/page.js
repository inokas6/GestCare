'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TamanhosBebePage() {
  const [tamanhos, setTamanhos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTamanho, setEditingTamanho] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTamanho, setNewTamanho] = useState({ semana: '', fruta: '' });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTamanhos();
  }, []);

  const fetchTamanhos = async () => {
    try {
      const { data, error } = await supabase
        .from('tamanhos_bebe')
        .select('*')
        .order('semana', { ascending: true });

      if (error) throw error;
      setTamanhos(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tamanho) => {
    setEditingTamanho(tamanho);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este tamanho?')) return;

    try {
      const { error } = await supabase
        .from('tamanhos_bebe')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTamanhos(tamanhos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao excluir tamanho:', error);
      alert('Erro ao excluir tamanho');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('tamanhos_bebe')
        .update({
          semana: parseInt(editingTamanho.semana),
          fruta: editingTamanho.fruta
        })
        .eq('id', editingTamanho.id);

      if (error) throw error;

      setTamanhos(tamanhos.map(t => 
        t.id === editingTamanho.id ? editingTamanho : t
      ));
      setEditingTamanho(null);
    } catch (error) {
      console.error('Erro ao atualizar tamanho:', error);
      alert('Erro ao atualizar tamanho');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('tamanhos_bebe')
        .insert([{
          semana: parseInt(newTamanho.semana),
          fruta: newTamanho.fruta
        }])
        .select();

      if (error) throw error;

      setTamanhos([...tamanhos, data[0]]);
      setNewTamanho({ semana: '', fruta: '' });
      setShowNewForm(false);
    } catch (error) {
      console.error('Erro ao criar tamanho:', error);
      alert('Erro ao criar tamanho');
    }
  };

  const filteredTamanhos = tamanhos.filter(tamanho =>
    tamanho.semana.toString().includes(searchTerm) ||
    tamanho.fruta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tamanhos do Bebê por Semana</h1>
        <button 
          onClick={() => setShowNewForm(true)}
          className="bg-gradient-to-r from-pink-600 to-rose-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
        >
          Novo Tamanho
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Novo Tamanho</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Semana</label>
              <input
                type="number"
                min="1"
                max="42"
                value={newTamanho.semana}
                onChange={(e) => setNewTamanho({...newTamanho, semana: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fruta</label>
              <input
                type="text"
                value={newTamanho.fruta}
                onChange={(e) => setNewTamanho({...newTamanho, fruta: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-md hover:shadow-lg transition-all duration-200"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar por semana ou fruta..."
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
                    Semana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fruta
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
                {filteredTamanhos.map((tamanho) => (
                  <tr key={tamanho.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTamanho?.id === tamanho.id ? (
                        <input
                          type="number"
                          min="1"
                          max="42"
                          value={editingTamanho.semana}
                          onChange={(e) => setEditingTamanho({...editingTamanho, semana: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">Semana {tamanho.semana}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTamanho?.id === tamanho.id ? (
                        <input
                          type="text"
                          value={editingTamanho.fruta}
                          onChange={(e) => setEditingTamanho({...editingTamanho, fruta: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{tamanho.fruta}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tamanho.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingTamanho?.id === tamanho.id ? (
                        <>
                          <button 
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingTamanho(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(tamanho)}
                            className="text-pink-600 hover:text-pink-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(tamanho.id)}
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