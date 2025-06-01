'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const TIPOS_EVENTO = [
  'consulta',
  'exame',
  'ovulacao',
  'parto',
  'marco',
  'lembrete',
  'importante'
];

export default function CalendarioPage() {
  const [eventos, setEventos] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvento, setEditingEvento] = useState(null);
  const [showNewEventoForm, setShowNewEventoForm] = useState(false);
  const [newEvento, setNewEvento] = useState({ 
    user_id: '',
    titulo: '',
    descricao: '',
    inicio_data: '',
    fim_data: '',
    tipo_evento: 'consulta',
    lembrete: false,
    lembrete_antecedencia: 0
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchEventos();
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nome, email')
        .order('nome');

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchEventos = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendario')
        .select('*')
        .eq('user_id', selectedUser)
        .order('inicio_data', { ascending: true });

      if (error) throw error;
      setEventos(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
  };

  const handleDelete = async (eventoId) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('calendario')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      setEventos(eventos.filter(evento => evento.id !== eventoId));
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('calendario')
        .update({
          titulo: editingEvento.titulo,
          descricao: editingEvento.descricao,
          inicio_data: editingEvento.inicio_data,
          fim_data: editingEvento.fim_data,
          tipo_evento: editingEvento.tipo_evento,
          lembrete: editingEvento.lembrete,
          lembrete_antecedencia: editingEvento.lembrete_antecedencia
        })
        .eq('id', editingEvento.id);

      if (error) throw error;

      setEventos(eventos.map(evento => 
        evento.id === editingEvento.id ? editingEvento : evento
      ));
      setEditingEvento(null);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert('Erro ao atualizar evento');
    }
  };

  const handleCreateEvento = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('calendario')
        .insert([{
          ...newEvento,
          user_id: selectedUser
        }])
        .select()
        .single();

      if (error) throw error;

      setEventos([...eventos, data].sort((a, b) => 
        new Date(a.inicio_data) - new Date(b.inicio_data)
      ));
      setNewEvento({ 
        user_id: '',
        titulo: '',
        descricao: '',
        inicio_data: '',
        fim_data: '',
        tipo_evento: 'consulta',
        lembrete: false,
        lembrete_antecedencia: 0
      });
      setShowNewEventoForm(false);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento');
    }
  };

  const filteredEventos = eventos.filter(evento =>
    evento.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo_evento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gerenciamento de Calendário</h1>
        {selectedUser && (
          <button 
            onClick={() => setShowNewEventoForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Novo Evento
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione um Usuário
        </label>
        <select
          value={selectedUser || ''}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Selecione um usuário</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.nome} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && showNewEventoForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Novo Evento</h2>
          <form onSubmit={handleCreateEvento} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={newEvento.titulo}
                onChange={(e) => setNewEvento({...newEvento, titulo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                value={newEvento.descricao}
                onChange={(e) => setNewEvento({...newEvento, descricao: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                <input
                  type="date"
                  value={newEvento.inicio_data}
                  onChange={(e) => setNewEvento({...newEvento, inicio_data: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Fim</label>
                <input
                  type="date"
                  value={newEvento.fim_data}
                  onChange={(e) => setNewEvento({...newEvento, fim_data: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
              <select
                value={newEvento.tipo_evento}
                onChange={(e) => setNewEvento({...newEvento, tipo_evento: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {TIPOS_EVENTO.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newEvento.lembrete}
                    onChange={(e) => setNewEvento({...newEvento, lembrete: e.target.checked})}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Lembrete</span>
                </label>
              </div>
              {newEvento.lembrete && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Antecedência (minutos)</label>
                  <input
                    type="number"
                    value={newEvento.lembrete_antecedencia}
                    onChange={(e) => setNewEvento({...newEvento, lembrete_antecedencia: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewEventoForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Criar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedUser && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Buscar eventos..."
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
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Início
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Fim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lembrete
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEventos.map((evento) => (
                    <tr key={evento.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingEvento?.id === evento.id ? (
                          <input
                            type="text"
                            value={editingEvento.titulo}
                            onChange={(e) => setEditingEvento({...editingEvento, titulo: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{evento.titulo}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingEvento?.id === evento.id ? (
                          <textarea
                            value={editingEvento.descricao}
                            onChange={(e) => setEditingEvento({...editingEvento, descricao: e.target.value})}
                            className="border rounded px-2 py-1 w-full"
                            rows="2"
                          />
                        ) : (
                          <div className="text-sm text-gray-500 line-clamp-2">{evento.descricao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingEvento?.id === evento.id ? (
                          <input
                            type="date"
                            value={editingEvento.inicio_data}
                            onChange={(e) => setEditingEvento({...editingEvento, inicio_data: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">
                            {new Date(evento.inicio_data).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingEvento?.id === evento.id ? (
                          <input
                            type="date"
                            value={editingEvento.fim_data}
                            onChange={(e) => setEditingEvento({...editingEvento, fim_data: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">
                            {evento.fim_data ? new Date(evento.fim_data).toLocaleDateString('pt-BR') : '-'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingEvento?.id === evento.id ? (
                          <select
                            value={editingEvento.tipo_evento}
                            onChange={(e) => setEditingEvento({...editingEvento, tipo_evento: e.target.value})}
                            className="border rounded px-2 py-1"
                          >
                            {TIPOS_EVENTO.map(tipo => (
                              <option key={tipo} value={tipo}>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {evento.tipo_evento.charAt(0).toUpperCase() + evento.tipo_evento.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingEvento?.id === evento.id ? (
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editingEvento.lembrete}
                                onChange={(e) => setEditingEvento({...editingEvento, lembrete: e.target.checked})}
                                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Lembrete</span>
                            </label>
                            {editingEvento.lembrete && (
                              <input
                                type="number"
                                value={editingEvento.lembrete_antecedencia}
                                onChange={(e) => setEditingEvento({...editingEvento, lembrete_antecedencia: parseInt(e.target.value)})}
                                className="border rounded px-2 py-1 w-24"
                                min="0"
                                placeholder="Minutos"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {evento.lembrete ? (
                              <span className="inline-flex items-center space-x-1">
                                <span>Sim</span>
                                {evento.lembrete_antecedencia > 0 && (
                                  <span>({evento.lembrete_antecedencia} min)</span>
                                )}
                              </span>
                            ) : (
                              'Não'
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingEvento?.id === evento.id ? (
                          <>
                            <button 
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Salvar
                            </button>
                            <button 
                              onClick={() => setEditingEvento(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(evento)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDelete(evento.id)}
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
      )}
    </div>
  );
} 