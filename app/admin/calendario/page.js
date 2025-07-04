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
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvento, setEditingEvento] = useState(null);
  const [showNewEventoForm, setShowNewEventoForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [newEvento, setNewEvento] = useState({ 
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
    fetchEventos();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchEventos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendario')
        .select(`
          id,
          titulo,
          descricao,
          inicio_data,
          fim_data,
          tipo_evento,
          created_at,
          updated_at,
          lembrete,
          lembrete_antecedencia
        `)
        .order('inicio_data', { ascending: true });

      if (error) {
        console.error('Erro ao procurar eventos:', error.message);
        throw error;
      }

      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao procurar eventos:', error.message);
      setEventos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
  };

  const handleDelete = async (eventoId) => {
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar este evento? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('calendario')
            .delete()
            .eq('id', eventoId);

          if (error) throw error;

          setEventos(eventos.filter(evento => evento.id !== eventoId));
          setMessage({ text: 'Evento eliminado com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao excluir evento:', error.message);
          setMessage({ text: 'Erro ao eliminar o evento: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setPendingAction({
      type: 'save',
      message: 'Deseja salvar as alterações deste evento?',
      callback: async () => {
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
              lembrete_antecedencia: editingEvento.lembrete_antecedencia,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingEvento.id);

          if (error) throw error;

          setEventos(eventos.map(evento => 
            evento.id === editingEvento.id ? editingEvento : evento
          ));
          setEditingEvento(null);
          setMessage({ text: 'Evento atualizado com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao atualizar evento:', error.message);
          setMessage({ text: 'Erro ao atualizar o evento: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleCreateEvento = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('calendario')
        .insert([{
          ...newEvento,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setEventos([...eventos, data].sort((a, b) => 
        new Date(a.inicio_data) - new Date(b.inicio_data)
      ));
      setNewEvento({ 
        titulo: '',
        descricao: '',
        inicio_data: '',
        fim_data: '',
        tipo_evento: 'consulta',
        lembrete: false,
        lembrete_antecedencia: 0
      });
      setShowNewEventoForm(false);
      setMessage({ text: 'Evento criado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao criar evento:', error.message);
      setMessage({ text: 'Erro ao criar o evento: ' + error.message, type: 'error' });
    }
  };

  const filteredEventos = eventos.filter(evento =>
    evento.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo_evento?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md relative">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
              aria-label="Fechar"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4 text-black pr-8">Confirmar ação</h3>
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
        <h1 className="text-2xl text-black font-semibold">Gestão de Calendário</h1>
        <button 
          onClick={() => setShowNewEventoForm(true)}
          className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800"
        >
          Novo Evento
        </button>
      </div>

      {showNewEventoForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm relative">
          <button
            onClick={() => setShowNewEventoForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            aria-label="Fechar"
          >
            ×
          </button>
          <h2 className="text-xl font-semibold mb-4 pr-8">Novo Evento</h2>
          <form onSubmit={handleCreateEvento} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={newEvento.titulo}
                onChange={(e) => setNewEvento({...newEvento, titulo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                value={newEvento.descricao}
                onChange={(e) => setNewEvento({...newEvento, descricao: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Fim</label>
                <input
                  type="date"
                  value={newEvento.fim_data}
                  onChange={(e) => setNewEvento({...newEvento, fim_data: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
              <select
                value={newEvento.tipo_evento}
                onChange={(e) => setNewEvento({...newEvento, tipo_evento: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
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
                    className="rounded border-gray-300 text-pink-700 focus:ring-pink-700"
                  />
                  <span className="text-sm font-medium text-gray-700">Lembrete</span>
                </label>
              </div>
              {newEvento.lembrete && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Antecedência (dias)</label>
                  <input
                    type="number"
                    value={newEvento.lembrete_antecedencia}
                    onChange={(e) => setNewEvento({...newEvento, lembrete_antecedencia: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700"
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
                className="px-4 py-2 bg-pink-700 text-white rounded-md hover:bg-pink-800"
              >
                Criar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Procurar eventos..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-black">A carregar...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
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
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atualizado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEventos.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {evento.id.substring(0, 8)}...
                    </td>
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
                        <div className="text-sm text-black line-clamp-2">{evento.descricao}</div>
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
                        <div className="text-sm text-black">
                          {new Date(evento.inicio_data).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
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
                        <div className="text-sm text-black">
                          {evento.fim_data ? new Date(evento.fim_data).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          }) : '-'}
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
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
                              className="rounded border-gray-300 text-pink-700 focus:ring-pink-700"
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
                              placeholder="Dias"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-black">
                          {evento.lembrete ? (
                            <span className="inline-flex items-center space-x-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Sim
                              </span>
                              {evento.lembrete_antecedencia > 0 && (
                                <span>({evento.lembrete_antecedencia} dias)</span>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Não
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(evento.created_at).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(evento.updated_at).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingEvento?.id === evento.id ? (
                        <>
                          <button 
                            onClick={handleSave}
                            className="text-pink-700 hover:text-pink-900 mr-3"
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
                            className="text-pink-700 hover:text-pink-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(evento.id)}
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