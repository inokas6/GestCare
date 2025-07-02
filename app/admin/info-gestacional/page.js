'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function InfoGestacionalPage() {
  const [infos, setInfos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(null);
  const [showNewInfoForm, setShowNewInfoForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
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

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar esta informação gestacional? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('info_gestacional')
            .delete()
            .eq('id', infoId);

          if (error) throw error;

          setInfos(infos.filter(info => info.id !== infoId));
          setMessage({ text: 'Informação gestacional eliminada com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao excluir informação:', error);
          setMessage({ text: 'Erro ao eliminar informação: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setPendingAction({
      type: 'save',
      message: 'Deseja salvar as alterações desta informação gestacional?',
      callback: async () => {
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
          setMessage({ text: 'Informação gestacional atualizada com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao atualizar informação:', error);
          setMessage({ text: 'Erro ao atualizar informação: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
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
      setMessage({ text: 'Informação gestacional criada com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao criar informação:', error);
      setMessage({ text: 'Erro ao criar informação: ' + error.message, type: 'error' });
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
        <h1 className="text-2xl font-semibold text-black">Gestão de Informações Gestacionais</h1>
        <button 
          onClick={() => setShowNewInfoForm(true)}
          className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desenvolvimento do Bebê</label>
              <textarea
                value={newInfo.desenvolvimento_bebe}
                onChange={(e) => setNewInfo({...newInfo, desenvolvimento_bebe: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sintomas Comuns</label>
              <textarea
                value={newInfo.sintomas_comuns}
                onChange={(e) => setNewInfo({...newInfo, sintomas_comuns: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dicas para a Mãe</label>
              <textarea
                value={newInfo.dicas_mae}
                onChange={(e) => setNewInfo({...newInfo, dicas_mae: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cuidados Especiais</label>
              <textarea
                value={newInfo.cuidados_especiais}
                onChange={(e) => setNewInfo({...newInfo, cuidados_especiais: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
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
                className="px-4 py-2 bg-pink-700 text-white rounded-md hover:bg-pink-800"
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
                            className="text-pink-600 hover:text-pink-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(info.id)}
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