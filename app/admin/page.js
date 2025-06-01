'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopicos: 0,
    totalMensagens: 0,
    topicosPorMes: [],
    mensagensPorMes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Buscar total de usuários
        const { count: totalUsers, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Buscar total de tópicos
        const { count: totalTopicos, error: topicosError } = await supabase
          .from('topicos')
          .select('*', { count: 'exact', head: true });

        if (topicosError) throw topicosError;

        // Buscar total de mensagens
        const { count: totalMensagens, error: mensagensError } = await supabase
          .from('respostas')
          .select('*', { count: 'exact', head: true });

        if (mensagensError) throw mensagensError;

        // Buscar tópicos por mês
        const { data: topicosData, error: topicosPorMesError } = await supabase
          .from('topicos')
          .select('created_at')
          .order('created_at', { ascending: true });

        if (topicosPorMesError) throw topicosPorMesError;

        // Buscar mensagens por mês
        const { data: mensagensData, error: mensagensPorMesError } = await supabase
          .from('respostas')
          .select('created_at')
          .order('created_at', { ascending: true });

        if (mensagensPorMesError) throw mensagensPorMesError;

        // Processar dados para os gráficos
        const topicosPorMes = processarDadosPorMes(topicosData);
        const mensagensPorMes = processarDadosPorMes(mensagensData);

        setStats({
          totalUsers,
          totalTopicos,
          totalMensagens,
          topicosPorMes,
          mensagensPorMes
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  function processarDadosPorMes(dados) {
    const meses = {};
    dados.forEach(item => {
      const data = new Date(item.created_at);
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
      meses[mesAno] = (meses[mesAno] || 0) + 1;
    });

    return Object.entries(meses).map(([mes, quantidade]) => ({
      mes,
      quantidade
    }));
  }

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

  const Grafico = ({ dados, titulo }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon="👥"
          color="border-blue-500"
        />
        <StatCard
          title="Total de Tópicos"
          value={stats.totalTopicos}
          icon="📝"
          color="border-green-500"
        />
        <StatCard
          title="Total de Mensagens"
          value={stats.totalMensagens}
          icon="💬"
          color="border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Grafico 
          dados={stats.topicosPorMes} 
          titulo="Tópicos por Mês" 
        />
        <Grafico 
          dados={stats.mensagensPorMes} 
          titulo="Mensagens por Mês" 
        />
      </div>
    </div>
  );
} 