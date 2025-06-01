'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function InfoGestacionalPage() {
  const [infos, setInfos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(null);
  const [showNewInfoForm, setShowNewInfoForm] = useState(false);
  const [newInfo, setNewInfo] = useState({ 
    semana: '',
    desenvolvimento_bebe: '',
    sintomas_comuns: '',
    dicas_mae: '',
    cuidados_especiais: ''
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchInfos();
  }, []);

  const fetchInfos = async () => {
    try {
      const { data, error } = await supabase
        .from('info_gestacional')
        .select('*')
        .order('semana', { ascending: true });

      if (error) throw error;
      setInfos(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (info) => {
    setEditingInfo(info);
  };

  const handleDelete = async (infoId) => {
    if (!confirm('Tem certeza que deseja excluir esta informação gestacional?')) return;

    try {
      const { error } = await supabase
        .from('info_gestacional')
        .delete()
        .eq('id', infoId);

      if (error) throw error;

      setInfos(infos.filter(info => info.id !== infoId));
    } catch (error) {
      console.error('Erro ao excluir informação:', error);
      alert('Erro ao excluir informação');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('info_gestacional')
        .update({
          semana: editingInfo.semana,
          desenvolvimento_bebe: editingInfo.desenvolvimento_bebe,
          sintomas_comuns: editingInfo.sintomas_comuns,
          dicas_mae: editingInfo.dicas_mae,
          cuidados_especiais: editingInfo.cuidados_especiais
        })
        .eq('id', editingInfo.id);

      if (error) throw error;

      setInfos(infos.map(info => 
        info.id === editingInfo.id ? editingInfo : info
      ));
      setEditingInfo(null);
    } catch (error) {
      console.error('Erro ao atualizar informação:', error);
      alert('Erro ao atualizar informação');
    }
  };

  const handleCreateInfo = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('info_gestacional')
        .insert([newInfo])
        .select()
        .single();

      if (error) throw error;

      setInfos([...infos, data].sort((a, b) => a.semana - b.semana));
      setNewInfo({ 
        semana: '',
        desenvolvimento_bebe: '',
        sintomas_comuns: '',
        dicas_mae: '',
        cuidados_especiais: ''
      });
      setShowNewInfoForm(false);
    } catch (error) {
      console.error('Erro ao criar informação:', error);
      alert('Erro ao criar informação');
    }
  };

  const filteredInfos = infos.filter(info =>
    info.desenvolvimento_bebe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.sintomas_comuns?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.dicas_mae?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.cuidados_especiais?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gerenciamento de Informações Gestacionais</h1>
        <button 
          onClick={() => setShowNewInfoForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Nova Informação
        </button>
      </div>

      {showNewInfoForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Nova Informação Gestacional</h2>
          <form onSubmit={handleCreateInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Semana</label>
              <input
                type="number"
                min="1"
                max="40"
                value={newInfo.semana}
                onChange={(e) => setNewInfo({...newInfo, semana: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desenvolvimento do Bebê</label>
              <textarea
                value={newInfo.desenvolvimento_bebe}
                onChange={(e) => setNewInfo({...newInfo, desenvolvimento_bebe: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sintomas Comuns</label>
              <textarea
                value={newInfo.sintomas_comuns}
                onChange={(e) => setNewInfo({...newInfo, sintomas_comuns: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dicas para a Mãe</label>
              <textarea
                value={newInfo.dicas_mae}
                onChange={(e) => setNewInfo({...newInfo, dicas_mae: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cuidados Especiais</label>
              <textarea
                value={newInfo.cuidados_especiais}
                onChange={(e) => setNewInfo({...newInfo, cuidados_especiais: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewInfoForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Criar Informação
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar informações..."
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
                    Desenvolvimento do Bebê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sintomas Comuns
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dicas para a Mãe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuidados Especiais
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInfos.map((info) => (
                  <tr key={info.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingInfo?.id === info.id ? (
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={editingInfo.semana}
                          onChange={(e) => setEditingInfo({...editingInfo, semana: parseInt(e.target.value)})}
                          className="border rounded px-2 py-1 w-20"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">Semana {info.semana}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingInfo?.id === info.id ? (
                        <textarea
                          value={editingInfo.desenvolvimento_bebe}
                          onChange={(e) => setEditingInfo({...editingInfo, desenvolvimento_bebe: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="3"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{info.desenvolvimento_bebe}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingInfo?.id === info.id ? (
                        <textarea
                          value={editingInfo.sintomas_comuns}
                          onChange={(e) => setEditingInfo({...editingInfo, sintomas_comuns: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="3"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{info.sintomas_comuns}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingInfo?.id === info.id ? (
                        <textarea
                          value={editingInfo.dicas_mae}
                          onChange={(e) => setEditingInfo({...editingInfo, dicas_mae: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="3"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{info.dicas_mae}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingInfo?.id === info.id ? (
                        <textarea
                          value={editingInfo.cuidados_especiais}
                          onChange={(e) => setEditingInfo({...editingInfo, cuidados_especiais: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="3"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{info.cuidados_especiais}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingInfo?.id === info.id ? (
                        <>
                          <button 
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingInfo(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(info)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(info.id)}
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