"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TopicosPage() {
  const [topicos, setTopicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar tópicos
        const topicosRes = await fetch("http://localhost:5000/api/topicos");
        if (!topicosRes.ok) throw new Error("Falha ao carregar tópicos");
        const topicosData = await topicosRes.json();
        
        // Carregar categorias
        const categoriasRes = await fetch("http://localhost:5000/api/categorias");
        if (!categoriasRes.ok) throw new Error("Falha ao carregar categorias");
        const categoriasData = await categoriasRes.json();

        setTopicos(topicosData);
        setCategorias(categoriasData);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (topicoId) => {
    if (!confirm("Tem certeza que deseja excluir este tópico?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/topicos/${topicoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir tópico");
      }

      setTopicos(topicos.filter((topico) => topico._id !== topicoId));
    } catch (err) {
      console.error("Erro ao excluir tópico:", err);
      alert("Erro ao excluir tópico: " + err.message);
    }
  };

  const getCategoriaName = (categoriaId) => {
    const categoria = categorias.find(cat => cat._id === categoriaId);
    return categoria ? categoria.nome : "Sem categoria";
  };

  const filteredTopicos = topicos.filter((topico) => {
    const matchesSearch = topico.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          topico.conteudo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filtroCategoria === "" || topico.categoria_id === filtroCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  if (loading) {
    return <div className="text-center p-4">Carregando tópicos...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Erro: {error}
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Tópicos</h1>
        <Link
          href="/admin/topicos/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Adicionar Tópico
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Buscar por título ou conteúdo..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-64">
          <select
            className="w-full p-2 border rounded"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Criação
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTopicos.length > 0 ? (
              filteredTopicos.map((topico) => (
                <tr key={topico._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{topico.titulo}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {topico.conteudo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {getCategoriaName(topico.categoria_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{topico.user_id || "Desconhecido"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(topico.created_at || Date.now()).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/topicos/${topico._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(topico._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  Nenhum tópico encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 