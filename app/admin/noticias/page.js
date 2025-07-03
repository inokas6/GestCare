'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const NoticiasAdmin = () => {
  const [noticias, setNoticias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewNoticiaForm, setShowNewNoticiaForm] = useState(false);
  const [editandoNoticia, setEditandoNoticia] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    carregarNoticias();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    const file = e.target.files[0];
    if (file) {
      // Verificar se é realmente uma imagem
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, etc.)', type: 'error' });
        return;
      }

      // Verificar extensões permitidas
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        setMessage({ text: 'Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP', type: 'error' });
        return;
      }

      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'A imagem deve ter menos de 5MB', type: 'error' });
        return;
      }

      setImagem(file);
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
    
    // Validar se os campos não estão vazios ou apenas com espaços
    if (!titulo.trim()) {
      setMessage({ text: 'O título não pode estar vazio', type: 'error' });
      return;
    }
    
    if (!data.trim()) {
      setMessage({ text: 'A data não pode estar vazia', type: 'error' });
      return;
    }
    
    if (!conteudo.trim()) {
      setMessage({ text: 'O conteúdo não pode estar vazio', type: 'error' });
      return;
    }
    
    setLoading(true);

    try {
      let imagemUrl = '';
      if (imagem) {
        imagemUrl = await uploadImagem(imagem);
      }

      const noticiaData = {
        titulo: titulo.trim(),
        data: data.trim(),
        conteudo: conteudo.trim(),
        imagem: imagemUrl,
      };

      if (editandoId) {
        const { error } = await supabase
          .from('noticias')
          .update(noticiaData)
          .eq('id', editandoId);

        if (error) throw error;
        setMessage({ text: 'Notícia atualizada com sucesso!', type: 'success' });
      } else {
        const { error } = await supabase
          .from('noticias')
          .insert([noticiaData]);

        if (error) throw error;
        setMessage({ text: 'Notícia criada com sucesso!', type: 'success' });
      }

      setTitulo('');
      setData('');
      setConteudo('');
      setImagem(null);
      setEditandoId(null);
      setShowNewNoticiaForm(false);
      await carregarNoticias();
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      setMessage({ text: 'Erro ao salvar notícia: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (noticia) => {
    setEditandoNoticia({
      id: noticia.id,
      titulo: noticia.titulo,
      data: noticia.data,
      conteudo: noticia.conteudo,
      imagem: noticia.imagem
    });
    setImagem(null); // Limpar qualquer imagem selecionada anteriormente
  };

  const handleSalvarEdicao = async () => {
    // Validar se os campos não estão vazios ou apenas com espaços
    if (!editandoNoticia.titulo.trim()) {
      setMessage({ text: 'O título não pode estar vazio', type: 'error' });
      return;
    }
    
    if (!editandoNoticia.data.trim()) {
      setMessage({ text: 'A data não pode estar vazia', type: 'error' });
      return;
    }
    
    if (!editandoNoticia.conteudo.trim()) {
      setMessage({ text: 'O conteúdo não pode estar vazio', type: 'error' });
      return;
    }

    setPendingAction({
      type: 'save',
      message: 'Deseja salvar as alterações desta notícia?',
      callback: async () => {
        try {
          setLoading(true);
          
          let imagemUrl = editandoNoticia.imagem;
          
          // Se há uma nova imagem selecionada, fazer upload
          if (imagem) {
            imagemUrl = await uploadImagem(imagem);
          }

          const { error } = await supabase
            .from('noticias')
            .update({
              titulo: editandoNoticia.titulo.trim(),
              data: editandoNoticia.data.trim(),
              conteudo: editandoNoticia.conteudo.trim(),
              imagem: imagemUrl
            })
            .eq('id', editandoNoticia.id);

          if (error) throw error;

          // Atualizar a notícia na lista com a nova imagem
          const noticiaAtualizada = {
            ...editandoNoticia,
            titulo: editandoNoticia.titulo.trim(),
            data: editandoNoticia.data.trim(),
            conteudo: editandoNoticia.conteudo.trim(),
            imagem: imagemUrl
          };

          setNoticias(noticias.map(noticia => 
            noticia.id === editandoNoticia.id ? noticiaAtualizada : noticia
          ));
          setEditandoNoticia(null);
          setImagem(null); // Limpar a imagem selecionada
          setMessage({ text: 'Notícia atualizada com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao atualizar notícia:', error);
          setMessage({ text: 'Erro ao atualizar notícia: ' + error.message, type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleExcluir = async (id) => {
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar esta notícia? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          const { error } = await supabase
            .from('noticias')
            .delete()
            .eq('id', id);

          if (error) throw error;
          await carregarNoticias();
          setMessage({ text: 'Notícia eliminada com sucesso!', type: 'success' });
        } catch (error) {
          console.error('Erro ao excluir notícia:', error);
          setMessage({ text: 'Erro ao eliminar notícia: ' + error.message, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-200' : 'bg-red-200'
        } text-black`}>
          {message.text}
        </div>
      )}

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-black">Confirmar ação</h3>
            <p className="mb-6 text-black">{pendingAction?.message || 'Tem certeza que deseja realizar esta ação?'}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-black"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (pendingAction?.callback) {
                    pendingAction.callback();
                  }
                  setShowConfirmDialog(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

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
              <label className="block text-sm font-medium text-black">Conteúdo</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-black"
                rows="6"
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
                  setConteudo('');
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
                  Conteúdo
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
                    {editandoNoticia?.id === noticia.id ? (
                      <input
                        type="text"
                        value={editandoNoticia.titulo}
                        onChange={(e) => setEditandoNoticia({...editandoNoticia, titulo: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      noticia.titulo
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {editandoNoticia?.id === noticia.id ? (
                      <input
                        type="date"
                        value={editandoNoticia.data}
                        onChange={(e) => setEditandoNoticia({...editandoNoticia, data: e.target.value})}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      new Date(noticia.data).toLocaleDateString('pt-BR')
                    )}
                  </td>
                  <td className="px-6 py-4 text-black">
                    {editandoNoticia?.id === noticia.id ? (
                      <textarea
                        value={editandoNoticia.conteudo || ''}
                        onChange={(e) => setEditandoNoticia({...editandoNoticia, conteudo: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                        rows="3"
                      />
                    ) : (
                      (noticia.conteudo || '').substring(0, 100) + '...'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editandoNoticia?.id === noticia.id ? (
                      <div className="space-y-2">
                        {noticia.imagem && (
                          <img
                            src={noticia.imagem}
                            alt={noticia.titulo}
                            className="h-10 w-10 object-cover rounded"
                          />
                        )}
                        <input
                          type="file"
                          onChange={handleImagemChange}
                          accept="image/*"
                          className="text-xs"
                        />
                        <p className="text-xs text-gray-500">Deixe vazio para manter a imagem atual</p>
                      </div>
                    ) : (
                      noticia.imagem ? (
                        <img
                          src={noticia.imagem}
                          alt={noticia.titulo}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <span className="text-black">Sem imagem</span>
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editandoNoticia?.id === noticia.id ? (
                      <>
                        <button
                          onClick={handleSalvarEdicao}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => {
                            setEditandoNoticia(null);
                            setImagem(null);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
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
                          Eliminar
                        </button>
                      </>
                    )}
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