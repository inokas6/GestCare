'use client';

import { useState, useEffect } from 'react';

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState({
    nomeSistema: 'Meu Sistema',
    emailContato: 'contato@sistema.com',
    manutencao: false,
    limiteUsuarios: 1000,
    tema: 'claro',
  });

  const [authorizedEmails, setAuthorizedEmails] = useState(['ineslaramiranda6@gmail.com']);
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newEmail, setNewEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
      setLoading(true);
      
      // Carregar emails autorizados do localStorage
      const saved = localStorage.getItem('adminAuthorizedEmails');
      if (saved) {
        setAuthorizedEmails(JSON.parse(saved));
      }
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar utilizadores');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
      setMessage({ text: 'Erro ao carregar utilizadores: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeEmail = async (email, action) => {
    try {
      setLoading(true);
      
      if (action === 'add') {
        if (!authorizedEmails.includes(email)) {
          const newAuthorizedEmails = [...authorizedEmails, email];
          setAuthorizedEmails(newAuthorizedEmails);
          localStorage.setItem('adminAuthorizedEmails', JSON.stringify(newAuthorizedEmails));
          setMessage({ text: 'Email adicionado com sucesso', type: 'success' });
        } else {
          setMessage({ text: 'Email já está autorizado', type: 'error' });
        }
      } else if (action === 'remove') {
        if (email === 'ineslaramiranda6@gmail.com') {
          setMessage({ text: 'Não é possível remover o email principal', type: 'error' });
        } else {
          const newAuthorizedEmails = authorizedEmails.filter(e => e !== email);
          setAuthorizedEmails(newAuthorizedEmails);
          localStorage.setItem('adminAuthorizedEmails', JSON.stringify(newAuthorizedEmails));
          setMessage({ text: 'Email removido com sucesso', type: 'success' });
        }
      }
    } catch (error) {
      console.error('Erro ao gerenciar autorização:', error);
      setMessage({ text: 'Erro: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar as configurações
    alert('Configurações salvas com sucesso!');
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setMessage({ text: 'Por favor, insira um email válido', type: 'error' });
      return;
    }

    if (authorizedEmails.includes(newEmail.trim())) {
      setMessage({ text: 'Email já está autorizado', type: 'error' });
      return;
    }

    const newAuthorizedEmails = [...authorizedEmails, newEmail.trim()];
    setAuthorizedEmails(newAuthorizedEmails);
    localStorage.setItem('adminAuthorizedEmails', JSON.stringify(newAuthorizedEmails));
    setNewEmail('');
    setShowAddForm(false);
    setMessage({ text: 'Email adicionado com sucesso', type: 'success' });
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Configurações do Sistema</h1>
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-black mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-black">Configurações do Sistema</h1>

      

      {/* Seção de Emails Autorizados */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Gestão de Emails Autorizados</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            {showAddForm ? 'Cancelar' : 'Adicionar Email'}
          </button>
        </div>
        
        <p className="text-sm text-black mb-6">
          Gerencie quais emails têm acesso à área administrativa. Os emails devem pertencer a contas já registradas no sistema.
        </p>

        {/* Formulário para adicionar email */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3 text-black">Adicionar Novo Email Autorizado</h3>
            <form onSubmit={handleAddEmail} className="flex gap-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Digite o email a autorizar"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black placeholder-gray-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-black mt-2">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de Emails Atualmente Autorizados */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-black">Emails Atualmente Autorizados</h3>
              {authorizedEmails.length === 0 ? (
                <p className="text-black text-sm">Nenhum email autorizado</p>
              ) : (
                <div className="space-y-2">
                  {authorizedEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium text-green-800">{email}</span>
                      <button
                        onClick={() => handleAuthorizeEmail(email, 'remove')}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={loading}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Utilizadores Registrados */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-black">Utilizadores Registrados</h3>
              {users.length === 0 ? (
                <p className="text-black text-sm">Nenhum utilizador registrado</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      authorizedEmails.includes(user.email) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div>
                        <p className="text-sm font-medium text-black">{user.nome || 'Sem nome'}</p>
                        <p className="text-sm text-black">{user.email}</p>
                        <p className="text-xs text-black">
                          Registrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {authorizedEmails.includes(user.email) ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Autorizado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAuthorizeEmail(user.email, 'add')}
                            className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                            disabled={loading}
                          >
                            Autorizar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 