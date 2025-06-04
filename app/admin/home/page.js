'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import StatCard from '../estatisticas/StatCard';
import TopicosPorSemana from '../estatisticas/TopicosPorSemana';
import TopicosPorCategoria from '../estatisticas/TopicosPorCategoria';
import DistribuicaoUtilizadoras from '../estatisticas/DistribuicaoUtilizadoras';

export default function AdminHome() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopicos: 0,
    totalMensagens: 0,
    activeUsers: 234,
    topicosPorMes: [],
    mensagensPorMes: [],
    userActivity: [],
    categorias: [],
    gravidezStats: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const authorizedEmails = ['ineslaramiranda6@gmail.com'];

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Verificar localStorage primeiro
        const adminAuth = localStorage.getItem('adminAuth');
        
        if (!adminAuth) {
          if (isMounted) {
            router.replace('/admin');
          }
          return;
        }

        const authData = JSON.parse(adminAuth);
        
        // Verificar se o token não expirou (24 horas)
        const tokenTimestamp = new Date(authData.timestamp);
        const now = new Date();
        const hoursDiff = (now - tokenTimestamp) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          if (isMounted) {
            localStorage.removeItem('adminAuth');
            router.replace('/admin');
          }
          return;
        }

        // Verificar se o email está autorizado
        if (!authorizedEmails.includes(authData.email)) {
          if (isMounted) {
            localStorage.removeItem('adminAuth');
            router.replace('/admin');
          }
          return;
        }

        // Se passou por todas as verificações, está autenticado
        if (isMounted) {
          setIsAuthenticated(true);
          setIsChecking(false);
          
          // Buscar total de usuários
          const { count: usersCount, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

          if (usersError) {
            console.error('Erro ao buscar total de usuários:', usersError);
          } else if (isMounted) {
            setStats(prevStats => ({
              ...prevStats,
              totalUsers: usersCount || 0
            }));
          }

          // Buscar total de tópicos
          const { count: topicosCount, error: topicosError } = await supabase
            .from('topicos')
            .select('*', { count: 'exact', head: true });

          if (topicosError) {
            console.error('Erro ao buscar total de tópicos:', topicosError);
          } else if (isMounted) {
            setStats(prevStats => ({
              ...prevStats,
              totalTopicos: topicosCount || 0
            }));
          }

          // Buscar total de respostas
          const { count: respostasCount, error: respostasError } = await supabase
            .from('respostas')
            .select('*', { count: 'exact', head: true });

          if (respostasError) {
            console.error('Erro ao buscar total de respostas:', respostasError);
          } else if (isMounted) {
            setStats(prevStats => ({
              ...prevStats,
              totalMensagens: respostasCount || 0
            }));
          }

          // Buscar dados de tópicos por semana
          const { data: topicosData, error: topicosDataError } = await supabase
            .from('topicos')
            .select('created_at')
            .order('created_at', { ascending: true });

          if (topicosDataError) {
            console.error('Erro ao buscar dados de tópicos:', topicosDataError);
          } else if (isMounted && topicosData) {
            // Função para obter o número da semana do ano
            const getWeekNumber = (date) => {
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              d.setDate(d.getDate() + 4 - (d.getDay() || 7));
              const yearStart = new Date(d.getFullYear(), 0, 1);
              const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
              return weekNo;
            };

            // Agrupar tópicos por semana
            const topicosByWeek = topicosData.reduce((acc, topico) => {
              const date = new Date(topico.created_at);
              const year = date.getFullYear();
              const week = getWeekNumber(date);
              const weekKey = `Semana ${week}/${year}`;
              
              if (!acc[weekKey]) {
                acc[weekKey] = 0;
              }
              acc[weekKey]++;
              return acc;
            }, {});

            // Converter para o formato esperado pelo gráfico
            const topicosPorSemana = Object.entries(topicosByWeek)
              .map(([weekYear, count]) => ({
                mes: weekYear,
                quantidade: count
              }))
              .sort((a, b) => {
                // Extrair semana e ano para ordenação
                const [weekA, yearA] = a.mes.split('/').map(n => parseInt(n.replace('Semana ', '')));
                const [weekB, yearB] = b.mes.split('/').map(n => parseInt(n.replace('Semana ', '')));
                
                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB;
              });

            setStats(prevStats => ({
              ...prevStats,
              topicosPorMes: topicosPorSemana
            }));
          }

          // Buscar dados de tópicos por categoria
          const { data: topicosCategoriasData, error: topicosCategoriasError } = await supabase
            .from('topicos')
            .select(`
              categoria_id,
              categorias (
                nome,
                cor
              )
            `);

          if (topicosCategoriasError) {
            console.error('Erro ao buscar dados de tópicos por categoria:', topicosCategoriasError);
          } else if (isMounted && topicosCategoriasData) {
            // Agrupar tópicos por categoria
            const topicosPorCategoria = topicosCategoriasData.reduce((acc, topico) => {
              const categoria = topico.categorias;
              if (!categoria) return acc;

              const categoriaNome = categoria.nome;
              if (!acc[categoriaNome]) {
                acc[categoriaNome] = {
                  count: 0,
                  cor: categoria.cor || '#4ADE80'
                };
              }
              acc[categoriaNome].count++;
              return acc;
            }, {});

            // Converter para o formato esperado pelo gráfico
            const categoriasData = Object.entries(topicosPorCategoria)
              .map(([nome, data]) => ({
                name: nome,
                value: data.count,
                color: data.cor
              }))
              .sort((a, b) => b.value - a.value);

            setStats(prevStats => ({
              ...prevStats,
              categorias: categoriasData
            }));
          }

          // Buscar dados de gravidez
          const { data: gravidezData, error: gravidezError } = await supabase
            .from('gravidez_info')
            .select('tipo');

          if (gravidezError) {
            console.error('Erro ao buscar dados de gravidez:', gravidezError);
          } else if (isMounted && gravidezData) {
            // Agrupar por tipo de gravidez
            const gravidezPorTipo = gravidezData.reduce((acc, info) => {
              const tipo = info.tipo || 'gravida';
              if (!acc[tipo]) {
                acc[tipo] = 0;
              }
              acc[tipo]++;
              return acc;
            }, {});

            // Converter para o formato esperado pelo gráfico
            const gravidezStats = Object.entries(gravidezPorTipo)
              .map(([tipo, count]) => ({
                name: tipo === 'gravida' ? 'Grávidas' : 'Querem Engravidar',
                value: count,
                color: tipo === 'gravida' ? '#EC4899' : '#F472B6'
              }));

            setStats(prevStats => ({
              ...prevStats,
              gravidezStats: gravidezStats
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (isMounted) {
          localStorage.removeItem('adminAuth');
          router.replace('/admin');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-pink-600 to-rose-700 text-white shadow-lg'
          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
      }`}
    >
      {label}
    </button>
  );

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-700 bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 mt-1">Painel de controlo e análise de dados</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Última atualização</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('pt-PT')} às {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
       

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Utilizadores"
                value={stats.totalUsers}
                color="bg-gradient-to-r from-pink-500 to-rose-600"
              />
              <StatCard
                title="Total de Tópicos"
                value={stats.totalTopicos}
                color="bg-gradient-to-r from-rose-500 to-pink-600"
              />
              <StatCard
                title="Total de Mensagens"
                value={stats.totalMensagens}
                color="bg-gradient-to-r from-pink-600 to-rose-700"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopicosPorSemana data={stats.topicosPorMes} />
              <DistribuicaoUtilizadoras data={stats.gravidezStats} />
              <TopicosPorCategoria data={stats.categorias} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <span className="text-4xl text-pink-400 mx-auto mb-4 block">📊</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Análise Detalhada</h3>
              <p className="text-gray-600">Funcionalidade em desenvolvimento. Em breve terá acesso a análises avançadas e métricas detalhadas.</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <span className="text-4xl text-pink-400 mx-auto mb-4 block">📄</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Centro de Relatórios</h3>
              <p className="text-gray-600">Gere relatórios personalizados e exporte dados para análise externa.</p>
              <button className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Em Breve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 