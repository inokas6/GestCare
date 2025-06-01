'use client';

import { useState } from 'react';

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState({
    nomeSistema: 'Meu Sistema',
    emailContato: 'contato@sistema.com',
    manutencao: false,
    limiteUsuarios: 1000,
    tema: 'claro',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar as configurações
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Configurações do Sistema</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Sistema
            </label>
            <input
              type="text"
              value={configs.nomeSistema}
              onChange={(e) => setConfigs({ ...configs, nomeSistema: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email de Contato
            </label>
            <input
              type="email"
              value={configs.emailContato}
              onChange={(e) => setConfigs({ ...configs, emailContato: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Limite de Usuários
            </label>
            <input
              type="number"
              value={configs.limiteUsuarios}
              onChange={(e) => setConfigs({ ...configs, limiteUsuarios: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tema do Sistema
            </label>
            <select
              value={configs.tema}
              onChange={(e) => setConfigs({ ...configs, tema: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="claro">Claro</option>
              <option value="escuro">Escuro</option>
              <option value="sistema">Seguir Sistema</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="manutencao"
              checked={configs.manutencao}
              onChange={(e) => setConfigs({ ...configs, manutencao: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="manutencao" className="ml-2 block text-sm text-gray-900">
              Modo de Manutenção
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setConfigs({
              nomeSistema: 'Meu Sistema',
              emailContato: 'contato@sistema.com',
              manutencao: false,
              limiteUsuarios: 1000,
              tema: 'claro',
            })}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Restaurar Padrão
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
} 