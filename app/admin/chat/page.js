'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function RespostasPage() {
  const [respostas, setRespostas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingResposta, setEditingResposta] = useState(null);
  const [showNewRespostaForm, setShowNewRespostaForm] = useState(false);
  const [newResposta, setNewResposta] = useState({ 
    conteudo: '', 
    user_id: ''
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchRespostas();
    fetchUsuarios();
  }, []);

  const fetchRespostas = async () => {
    try {
      const { data, error } = await supabase
        .from('respostas')
        .select(`
          *,
          users (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRespostas(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
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

  const handleEdit = (resposta) => {
    setEditingResposta(resposta);
  };

  const handleDelete = async (respostaId) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return;

    try {
      const { error } = await supabase
        .from('respostas')
        .delete()
        .eq('id', respostaId);

      if (error) throw error;

      setRespostas(respostas.filter(resposta => resposta.id !== respostaId));
    } catch (error) {
      console.error('Erro ao excluir resposta:', error);
      alert('Erro ao excluir resposta');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('respostas')
        .update({
          conteudo: editingResposta.conteudo
        })
        .eq('id', editingResposta.id);

      if (error) throw error;

      setRespostas(respostas.map(resposta => 
        resposta.id === editingResposta.id ? editingResposta : resposta
      ));
      setEditingResposta(null);
    } catch (error) {
      console.error('Erro ao atualizar resposta:', error);
      alert('Erro ao atualizar resposta');
    }
  };

  const handleCreateResposta = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('respostas')
        .insert([newResposta])
        .select()
        .single();

      if (error) throw error;

      setRespostas([data, ...respostas]);
      setNewResposta({ conteudo: '', user_id: '' });
      setShowNewRespostaForm(false);
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      alert('Erro ao criar resposta');
    }
  };

  const filteredRespostas = respostas.filter(resposta =>
    resposta.conteudo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gerenciamento de Respostas</h1>
        <button 
          onClick={() => setShowNewRespostaForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Nova Resposta
        </button>
      </div>

      {showNewRespostaForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Nova Resposta</h2>
          <form onSubmit={handleCreateResposta} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
              <textarea
                value={newResposta.conteudo}
                onChange={(e) => setNewResposta({...newResposta, conteudo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário</label>
              <select
                value={newResposta.user_id}
                onChange={(e) => setNewResposta({...newResposta, user_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                onClick={() => setShowNewRespostaForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Criar Resposta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar respostas..."
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
                    Conteúdo
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
                {filteredRespostas.map((resposta) => (
                  <tr key={resposta.id}>
                    <td className="px-6 py-4">
                      {editingResposta?.id === resposta.id ? (
                        <textarea
                          value={editingResposta.conteudo}
                          onChange={(e) => setEditingResposta({...editingResposta, conteudo: e.target.value})}
                          className="border rounded px-2 py-1 w-full"
                          rows="3"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 line-clamp-2">{resposta.conteudo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resposta.users?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(resposta.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingResposta?.id === resposta.id ? (
                        <>
                          <button 
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingResposta(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(resposta)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(resposta.id)}
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