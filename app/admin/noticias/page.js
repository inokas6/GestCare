'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const NoticiasAdmin = () => {
  const [noticias, setNoticias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [imagem, setImagem] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewNoticiaForm, setShowNewNoticiaForm] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = async () => {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      console.error('Erro ao carregar notícias:', error);
    } else {
      setNoticias(data);
    }
  };

  const handleImagemChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagem(e.target.files[0]);
    }
  };

  const uploadImagem = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `noticias/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('noticias')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('noticias')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagemUrl = '';
      if (imagem) {
        imagemUrl = await uploadImagem(imagem);
      }

      const noticiaData = {
        titulo,
        data,
        imagem: imagemUrl,
      };

      if (editandoId) {
        const { error } = await supabase
          .from('noticias')
          .update(noticiaData)
          .eq('id', editandoId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('noticias')
          .insert([noticiaData]);

        if (error) throw error;
      }

      setTitulo('');
      setData('');
      setImagem(null);
      setEditandoId(null);
      setShowNewNoticiaForm(false);
      await carregarNoticias();
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      alert('Erro ao salvar notícia. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (noticia) => {
    setTitulo(noticia.titulo);
    setData(noticia.data);
    setEditandoId(noticia.id);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      try {
        const { error } = await supabase
          .from('noticias')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await carregarNoticias();
      } catch (error) {
        console.error('Erro ao excluir notícia:', error);
        alert('Erro ao excluir notícia. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-black font-semibold">Gestão de Notícias</h1>
        <button 
          onClick={() => setShowNewNoticiaForm(true)}
          className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800"
        >
          Nova Notícia
        </button>
      </div>

      {showNewNoticiaForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl text-black font-semibold mb-4">Nova Notícia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Imagem</label>
              <input
                type="file"
                onChange={handleImagemChange}
                accept="image/*"
                className="mt-1 block w-full text-black"
                required={!editandoId}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewNoticiaForm(false);
                  setTitulo('');
                  setData('');
                  setImagem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-pink-700 text-white rounded-md hover:bg-pink-800"
              >
                {loading ? 'Salvando...' : 'Criar Notícia'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Imagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {noticias.map((noticia) => (
                <tr key={noticia.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {noticia.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {new Date(noticia.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {noticia.imagem ? (
                      <img
                        src={noticia.imagem}
                        alt={noticia.titulo}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-black">Sem imagem</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditar(noticia)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(noticia.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NoticiasAdmin; 