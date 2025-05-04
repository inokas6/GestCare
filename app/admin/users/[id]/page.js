"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../../../utils/supabase";

export default function EditUserPage({ params }) {
  const userId = params.id;
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    foto_perfil: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Buscar dados do usuário no Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error("Usuário não encontrado");
        }
        
        setFormData({
          name: data.name || "",
          email: data.email || "",
          foto_perfil: data.foto_perfil || "",
        });
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Atualizar usuário no Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          foto_perfil: formData.foto_perfil || null,
        })
        .eq('id', userId);

      if (error) throw error;

      router.push("/admin/users");
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Carregando dados do usuário...</div>;
  }

  if (error && !formData.name) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <Link
          href="/admin/users"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Voltar para Lista de Usuários
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Usuário</h1>
        <Link
          href="/admin/users"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Voltar
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="foto_perfil" className="block text-gray-700 font-medium mb-2">
              URL da Foto de Perfil (opcional)
            </label>
            <input
              type="text"
              id="foto_perfil"
              name="foto_perfil"
              value={formData.foto_perfil}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.foto_perfil && (
              <div className="mt-2">
                <img
                  src={formData.foto_perfil}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push(`/admin/users/${userId}/reset-password`)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Redefinir Senha
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 