"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import supabase from "../../utils/supabase";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategoria, setNewCategoria] = useState({ nome: "", descricao: "" });
  const [editingCategoria, setEditingCategoria] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      // Buscar categorias do Supabase
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (error) throw error;

      setCategorias(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar categorias:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoria = async (e) => {
    e.preventDefault();
    
    if (!newCategoria.nome.trim()) {
      alert("O nome da categoria é obrigatório");
      return;
    }
    
    try {
      // Adicionar categoria no Supabase
      const { data, error } = await supabase
        .from('categorias')
        .insert([
          {
            nome: newCategoria.nome,
            descricao: newCategoria.descricao || null,
          }
        ])
        .select();

      if (error) throw error;

      setCategorias([...categorias, ...data]);
      setNewCategoria({ nome: "", descricao: "" });
    } catch (err) {
      console.error("Erro ao adicionar categoria:", err);
      alert("Erro ao adicionar categoria: " + err.message);
    }
  };

  const handleUpdateCategoria = async (e) => {
    e.preventDefault();
    
    if (!editingCategoria.nome.trim()) {
      alert("O nome da categoria é obrigatório");
      return;
    }
    
    try {
      // Atualizar categoria no Supabase
      const { data, error } = await supabase
        .from('categorias')
        .update({
          nome: editingCategoria.nome,
          descricao: editingCategoria.descricao || null,
        })
        .eq('id', editingCategoria.id)
        .select();

      if (error) throw error;

      setCategorias(
        categorias.map((cat) =>
          cat.id === editingCategoria.id ? data[0] : cat
        )
      );
      setEditingCategoria(null);
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
      alert("Erro ao atualizar categoria: " + err.message);
    }
  };

  const handleDelete = async (categoriaId) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      // Excluir categoria no Supabase
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoriaId);

      if (error) throw error;

      setCategorias(categorias.filter((cat) => cat.id !== categoriaId));
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      alert("Erro ao excluir categoria: " + err.message);
    }
  };

  const startEditing = (categoria) => {
    setEditingCategoria({ ...categoria });
  };

  const cancelEditing = () => {
    setEditingCategoria(null);
  };

  const filteredCategorias = categorias.filter((categoria) =>
    categoria.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-4">Carregando categorias...</div>;
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
        <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário para adicionar/editar categoria */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategoria ? "Editar Categoria" : "Adicionar Nova Categoria"}
          </h2>
          <form
            onSubmit={editingCategoria ? handleUpdateCategoria : handleAddCategoria}
          >
            <div className="mb-4">
              <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={editingCategoria ? editingCategoria.nome : newCategoria.nome}
                onChange={(e) =>
                  editingCategoria
                    ? setEditingCategoria({ ...editingCategoria, nome: e.target.value })
                    : setNewCategoria({ ...newCategoria, nome: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="descricao" className="block text-gray-700 font-medium mb-2">
                Descrição
              </label>
              <textarea
                id="descricao"
                value={
                  editingCategoria ? editingCategoria.descricao : newCategoria.descricao
                }
                onChange={(e) =>
                  editingCategoria
                    ? setEditingCategoria({
                        ...editingCategoria,
                        descricao: e.target.value,
                      })
                    : setNewCategoria({ ...newCategoria, descricao: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              {editingCategoria && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {editingCategoria ? "Atualizar" : "Adicionar"}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de categorias */}
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar categorias..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategorias.length > 0 ? (
                    filteredCategorias.map((categoria) => (
                      <tr key={categoria.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {categoria.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {categoria.descricao || "Sem descrição"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEditing(categoria)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center">
                        Nenhuma categoria encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 