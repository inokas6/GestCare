'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [newUser, setNewUser] = useState({ nome: '', email: '' });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Erro ao procurar utilizadores');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao procurar utilizadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    setPendingAction({
      type: 'ban',
      message: 'Tem certeza que deseja banir este utilizador? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('users')
            .update({ banned: true })
            .eq('id', userId);

          if (error) throw error;

          setUsers(users.map(user => 
            user.id === userId ? { ...user, banned: true } : user
          ));
          setMessage({ text: 'Utilizador banido com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao banir utilizador:', error);
          setMessage({ text: 'Erro ao banir utilizador: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };



  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error('Erro ao criar utilizador');

      const user = await response.json();
      setUsers([user, ...users]);
      setNewUser({ nome: '', email: '' });
      setShowNewUserForm(false);
      setMessage({ text: 'Utilizador criado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      setMessage({ text: 'Erro ao criar utilizador: ' + error.message, type: 'error' });
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-semibold text-black">Gestão de Utilizadores</h1>
        <button 
          onClick={() => setShowNewUserForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Novo Utilizador
        </button>
      </div>

      {showNewUserForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Novo Utilizador</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={newUser.nome}
                onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewUserForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Criar Utilizador
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Procurar utilizadores..."
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
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.banned ? 'Banido' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!user.banned && (
                        <button 
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Banir utilizador
                        </button>
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