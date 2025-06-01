'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    revenue: 0,
  });

  // Simulação de dados - em produção, isso viria da sua API
  useEffect(() => {
    setStats({
      totalUsers: 1234,
      activeUsers: 890,
      totalOrders: 567,
      revenue: 45678,
    });
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon="👥"
          color="border-blue-500"
        />
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          icon="✅"
          color="border-green-500"
        />
        <StatCard
          title="Total de Pedidos"
          value={stats.totalOrders}
          icon="📦"
          color="border-yellow-500"
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${stats.revenue.toLocaleString()}`}
          icon="💰"
          color="border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Atividades Recentes</h2>
          <div className="space-y-4">
            {/* Aqui você pode adicionar uma lista de atividades recentes */}
            <p className="text-gray-600">Nenhuma atividade recente para mostrar.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Alertas do Sistema</h2>
          <div className="space-y-4">
            {/* Aqui você pode adicionar alertas do sistema */}
            <p className="text-gray-600">Nenhum alerta para mostrar.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 