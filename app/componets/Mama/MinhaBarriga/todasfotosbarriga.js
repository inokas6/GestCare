import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const TodasFotosBarriga = () => {
  const supabase = createClientComponentClient();
  const [allUserPhotos, setAllUserPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Carregar todas as fotos e usuários
  useEffect(() => {
    const fetchAllPhotos = async () => {
      try {
        // Buscar todos os usuários que têm fotos
        const { data: userPhotosData, error: userError } = await supabase
          .from('user_fotos_barriga')
          .select(`
            *,
            user:user_id (
              id,
              email,
              nome
            )
          `)
          .order('created_at', { ascending: false });

        if (userError) throw userError;

        if (userPhotosData) {
          // Agrupar fotos por usuário
          const photosByUser = userPhotosData.reduce((acc, photo) => {
            const userId = photo.user_id;
            if (!acc[userId]) {
              acc[userId] = {
                user: photo.user,
                photos: []
              };
            }
            acc[userId].photos.push({
              id: photo.id,
              url: photo.url,
              mes: photo.mes,
              descricao: photo.descricao,
              created_at: photo.created_at
            });
            return acc;
          }, {});

          setAllUserPhotos(Object.values(photosByUser));
          setUsers(Object.values(photosByUser).map(userData => userData.user));
        }
      } catch (error) {
        console.error('Erro ao carregar fotos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPhotos();
  }, [supabase]);

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('user_fotos_barriga')
        .update({
          mes: editingPhoto.mes,
          descricao: editingPhoto.descricao
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      // Atualizar o estado local
      setAllUserPhotos(prevPhotos => 
        prevPhotos.map(userData => ({
          ...userData,
          photos: userData.photos.map(photo => 
            photo.id === editingPhoto.id ? editingPhoto : photo
          )
        }))
      );
      setEditingPhoto(null);
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      alert('Erro ao atualizar foto');
    }
  };

  const handleDelete = async (photoId) => {
    try {
      const { error } = await supabase
        .from('user_fotos_barriga')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Atualizar o estado local
      setAllUserPhotos(prevPhotos => 
        prevPhotos.map(userData => ({
          ...userData,
          photos: userData.photos.filter(photo => photo.id !== photoId)
        }))
      );
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      alert('Erro ao excluir foto');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-800"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 bg-gray-50 rounded-3xl shadow-lg">
      <div className="w-full bg-pink-800 text-white p-4 rounded-t-2xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-center">Gerenciamento de Fotos da Barriga</h1>
        <p className="text-center text-pink-100">Visualize e gerencie as fotos de todos os usuários</p>
      </div>

      {/* Seletor de Usuário */}
      <div className="w-full mb-6">
        <select
          value={selectedUser || ''}
          onChange={(e) => handleUserSelect(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Todos os usuários</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nome || user.email}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de Fotos */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUserPhotos
          .filter(userData => !selectedUser || userData.user.id === selectedUser)
          .map((userData) => (
            <div key={userData.user.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-pink-100">
                <h2 className="text-lg font-semibold text-pink-800">
                  {userData.user.nome || userData.user.email}
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {userData.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square group">
                      <img
                        src={photo.url}
                        alt={`Mês ${photo.mes}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        Mês {photo.mes}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(photo)}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(photo.id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal de Edição */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Editar Foto</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mês</label>
                <select
                  value={editingPhoto.mes}
                  onChange={(e) => setEditingPhoto({...editingPhoto, mes: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(mes => (
                    <option key={mes} value={mes}>
                      {mes}º Mês
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={editingPhoto.descricao}
                  onChange={(e) => setEditingPhoto({...editingPhoto, descricao: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>
            <p className="mb-4">Tem certeza que deseja excluir esta foto?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodasFotosBarriga; 