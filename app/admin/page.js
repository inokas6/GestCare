"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../utils/supabase";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    topics: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Buscar contagem de usuários
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        
        // Buscar contagem de tópicos
        const { count: topicsCount, error: topicsError } = await supabase
          .from('topicos')
          .select('*', { count: 'exact', head: true });
        
        if (topicsError) throw topicsError;
        
        // Buscar contagem de posts no fórum
        const { count: postsCount, error: postsError } = await supabase
          .from('forum')
          .select('*', { count: 'exact', head: true });
        
        if (postsError) throw postsError;
        
        // Buscar contagem de comentários
        const { count: commentsCount, error: commentsError } = await supabase
          .from('comentarios')
          .select('*', { count: 'exact', head: true });
        
        if (commentsError) throw commentsError;
        
        setStats({
          users: usersCount || 0,
          topics: topicsCount || 0,
          posts: postsCount || 0,
          comments: commentsCount || 0,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Usuários", value: stats.users, link: "/admin/users", color: "bg-blue-500" },
    { title: "Fórum Posts", value: stats.posts, link: "/admin/forum", color: "bg-green-500" },
    { title: "Tópicos", value: stats.topics, link: "/admin/topicos", color: "bg-purple-500" },
    { title: "Comentários", value: stats.comments, link: "/admin/comentarios", color: "bg-orange-500" },
  ];

  if (loading) {
    return <div className="text-center p-4">Carregando estatísticas...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Erro ao carregar estatísticas: {error}
        <button
          onClick={() => window.location.reload()}
          className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link href={card.link} key={card.title}>
            <div className={`${card.color} rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow duration-200`}>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Atividade Recente</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center">
              <span>Novo usuário registrado</span>
              <span className="text-sm text-gray-500">2 minutos atrás</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Novo tópico criado</span>
              <span className="text-sm text-gray-500">15 minutos atrás</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Diário atualizado</span>
              <span className="text-sm text-gray-500">32 minutos atrás</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Nova foto adicionada</span>
              <span className="text-sm text-gray-500">1 hora atrás</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/users/new" className="bg-blue-100 text-blue-800 p-4 rounded-lg text-center hover:bg-blue-200 transition-colors">
              Adicionar Usuário
            </Link>
            <Link href="/admin/topicos/new" className="bg-purple-100 text-purple-800 p-4 rounded-lg text-center hover:bg-purple-200 transition-colors">
              Criar Tópico
            </Link>
            <Link href="/admin/categorias/new" className="bg-green-100 text-green-800 p-4 rounded-lg text-center hover:bg-green-200 transition-colors">
              Nova Categoria
            </Link>
            <Link href="/admin/fotos" className="bg-orange-100 text-orange-800 p-4 rounded-lg text-center hover:bg-orange-200 transition-colors">
              Gerenciar Fotos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
