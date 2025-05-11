'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newsletterData, setNewsletterData] = useState({
    titulo: '',
    conteudo: '',
    destinatarios: 'todos' // 'todos' ou 'selecionados'
  });
  const [selectedUsers, setSelectedUsers] = useState([]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Utilizadores', icon: '👥' },
    { id: 'forum', label: 'Fórum', icon: '💬' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧' },
    { id: 'analytics', label: 'Análises', icon: '📈' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ];

  useEffect(() => {
    if (activeMenu === 'users') {
      fetchUsers();
    } else if (activeMenu === 'forum') {
      fetchTopics();
    }
  }, [activeMenu]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newsletterData,
          selectedUsers: newsletterData.destinatarios === 'selecionados' ? selectedUsers : []
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar newsletter');

      alert('Newsletter enviada com sucesso!');
      setNewsletterData({
        titulo: '',
        conteudo: '',
        destinatarios: 'todos'
      });
      setSelectedUsers([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Erro ao carregar utilizadores');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/topics');
      if (!response.ok) throw new Error('Erro ao carregar tópicos');
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja eliminar este utilizador?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao eliminar utilizador');
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('Tem certeza que deseja eliminar este tópico?')) return;

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao eliminar tópico');
      
      setTopics(topics.filter(topic => topic.id !== topicId));
    } catch (err) {
      setError(err.message);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'newsletter':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Enviar Newsletter
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleNewsletterSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={newsletterData.titulo}
                  onChange={(e) => setNewsletterData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Conteúdo
                </label>
                <textarea
                  value={newsletterData.conteudo}
                  onChange={(e) => setNewsletterData(prev => ({ ...prev, conteudo: e.target.value }))}
                  rows="6"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Destinatários
                </label>
                <select
                  value={newsletterData.destinatarios}
                  onChange={(e) => setNewsletterData(prev => ({ ...prev, destinatarios: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="todos">Todos os utilizadores</option>
                  <option value="selecionados">Utilizadores selecionados</option>
                </select>
              </div>

              {newsletterData.destinatarios === 'selecionados' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Utilizadores
                  </label>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center space-x-2 py-2">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`user-${user.id}`} className="text-sm text-gray-700">
                          {user.nome} ({user.email})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'A enviar...' : 'Enviar Newsletter'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Gestão de Utilizadores
              </h3>
              <button 
                onClick={fetchUsers}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Atualizar
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">A carregar...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Foto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={user.foto_perfil || 'https://via.placeholder.com/40'}
                            alt={user.nome}
                            className="h-10 w-10 rounded-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('pt-PT')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'forum':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Gestão do Fórum
              </h3>
              <button 
                onClick={fetchTopics}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Atualizar
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">A carregar...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conteúdo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Autor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
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
                    {topics.map((topic) => (
                      <tr key={topic.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {topic.titulo}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {topic.conteudo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {topic.autor}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {topic.categoria}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(topic.created_at).toLocaleDateString('pt-PT')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cards de Estatísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm">Total de Utilizadores</h3>
              <p className="text-2xl font-bold text-gray-800">1,234</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm">Visitas Hoje</h3>
              <p className="text-2xl font-bold text-gray-800">567</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm">Pedidos Pendentes</h3>
              <p className="text-2xl font-bold text-gray-800">23</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm">Receita Mensal</h3>
              <p className="text-2xl font-bold text-gray-800">€12,345</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu Lateral */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                activeMenu === item.id ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Área Principal */}
      <div className="flex-1 overflow-auto">
        {/* Barra Superior */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeMenu)?.label}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <span className="text-xl">🔔</span>
              </button>
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Admin"
                  className="w-8 h-8 rounded-full"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
