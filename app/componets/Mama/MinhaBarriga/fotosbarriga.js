import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const MinhaBarriga = () => {
  const supabase = createClientComponentClient();
  const [currentMonth, setCurrentMonth] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(null);
  const [prevMonth, setPrevMonth] = useState(null);
  const [userPhotos, setUserPhotos] = useState(Array(9).fill([]));
  const [developmentPhotos, setDevelopmentPhotos] = useState(Array(9).fill(null));
  const [activeTab, setActiveTab] = useState("development");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Verificar sessão do usuário
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Carregar fotos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // Buscar fotos de desenvolvimento
        const { data: devPhotos, error: devError } = await supabase
          .from('fotos_barriga_meses')
          .select('*')
          .order('mes');

        if (devError) throw devError;

        if (devPhotos) {
          const photos = Array(9).fill(null);
          devPhotos.forEach(foto => {
            photos[foto.mes - 1] = foto.url;
          });
          setDevelopmentPhotos(photos);
        }

        // Buscar fotos do usuário
        const { data: userSession } = await supabase.auth.getSession();
        if (userSession?.session?.user?.id) {
          const { data: userPhotosData, error: userError } = await supabase
            .from('user_fotos_barriga')
            .select('*')
            .eq('user_id', userSession.session.user.id)
            .order('created_at');

          if (userError) throw userError;

          if (userPhotosData) {
            // Inicializar array com 9 arrays vazios
            const photos = Array(9).fill().map(() => []);
            
            // Distribuir as fotos pelos meses corretos
            userPhotosData.forEach(foto => {
              if (foto.mes >= 1 && foto.mes <= 9) {
                photos[foto.mes - 1].push({
                  id: foto.id,
                  url: foto.url,
                  descricao: foto.descricao
                });
              }
            });
            setUserPhotos(photos);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar fotos:', error);
        setMessage({ text: 'Erro ao carregar fotos: ' + error.message, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [supabase, session]);

  const handlePrevious = () => {
    if (!isTransitioning && currentMonth > 1) {
      setPrevMonth(currentMonth);
      setDirection('right');
      setIsTransitioning(true);
      setCurrentMonth(currentMonth - 1);
      setSelectedPhotoIndex(0);
    }
  };

  const handleNext = () => {
    if (!isTransitioning && currentMonth < 9) {
      setPrevMonth(currentMonth);
      setDirection('left');
      setIsTransitioning(true);
      setCurrentMonth(currentMonth + 1);
      setSelectedPhotoIndex(0);
    }
  };

  const handleMonthSelect = (monthIndex) => {
    if (!isTransitioning && monthIndex + 1 !== currentMonth) {
      setPrevMonth(currentMonth);
      setDirection(monthIndex + 1 > currentMonth ? 'left' : 'right');
      setIsTransitioning(true);
      setCurrentMonth(monthIndex + 1);
      setSelectedPhotoIndex(0);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentMonth]);

  const shouldShowImage = (month) => {
    if (!isTransitioning) return month === currentMonth;
    return [currentMonth, prevMonth].includes(month);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (!session?.user) {
      setMessage({ text: 'Você precisa estar logado para enviar fotos', type: 'error' });
      return;
    }

    setPendingAction({
      type: 'upload',
      message: 'Deseja fazer upload destas fotos?',
      callback: async () => {
        try {
          for (const file of files) {
            if (!file.type.startsWith('image/')) {
              setMessage({ text: 'Por favor, selecione apenas arquivos de imagem.', type: 'error' });
              continue;
            }

            if (file.size > 5 * 1024 * 1024) {
              setMessage({ text: 'O arquivo é muito grande. O tamanho máximo é 5MB.', type: 'error' });
              continue;
            }

            // Criar um nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `fotos-barriga/${fileName}`;

            // Converter a imagem para Blob
            const blob = new Blob([file], { type: file.type });

            // Upload do arquivo para o Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('fotos-barriga')
              .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Erro no upload:', uploadError);
              setMessage({ text: `Erro ao fazer upload da imagem: ${uploadError.message}`, type: 'error' });
              continue;
            }

            // Obter URL pública do arquivo
            const { data: { publicUrl } } = supabase.storage
              .from('fotos-barriga')
              .getPublicUrl(filePath);

            // Salvar no banco de dados
            const { data: savedPhoto, error: saveError } = await supabase
              .from('user_fotos_barriga')
              .insert([{
                user_id: session.user.id,
                mes: currentMonth,
                url: publicUrl,
                descricao: ''
              }])
              .select()
              .single();

            if (saveError) {
              console.error('Erro ao salvar no banco:', saveError);
              await supabase.storage
                .from('fotos')
                .remove([`fotos-barriga/${session.user.id}/${filePath}`]);
              setMessage({ text: `Erro ao salvar a foto: ${saveError.message}`, type: 'error' });
              continue;
            }

            // Atualizar estado local apenas para o mês atual
            const newPhotos = [...userPhotos];
            newPhotos[currentMonth - 1] = [
              ...newPhotos[currentMonth - 1],
              {
                id: savedPhoto.id,
                url: savedPhoto.url,
                descricao: savedPhoto.descricao
              }
            ];
            setUserPhotos(newPhotos);

            setMessage({ text: 'Foto adicionada com sucesso!', type: 'success' });
          }
        } catch (error) {
          console.error('Erro ao fazer upload da foto:', error);
          setMessage({ text: `Erro ao fazer upload da foto: ${error.message}`, type: 'error' });
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const confirmDeletePhoto = (monthIndex, photoIndex) => {
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja excluir esta foto? Esta ação não poderá ser revertida.',
      callback: async () => {
        await deletePhoto(monthIndex, photoIndex);
      }
    });
    setShowConfirmDialog(true);
  };

  const deletePhoto = async (monthIndex, photoIndex) => {
    if (!session?.user) return;

    try {
      const photo = userPhotos[monthIndex][photoIndex];
      if (!photo?.id) return;

      const { error } = await supabase
        .from('user_fotos_barriga')
        .delete()
        .eq('id', photo.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Remover arquivo do storage
      const urlParts = photo.url.split('/');
      const filePath = urlParts[urlParts.length - 1];
      await supabase.storage
        .from('fotos')
        .remove([`fotos-barriga/${session.user.id}/${filePath}`]);

      const newPhotos = [...userPhotos];
      const monthPhotos = [...newPhotos[monthIndex]];
      monthPhotos.splice(photoIndex, 1);
      newPhotos[monthIndex] = monthPhotos;
      
      if (selectedPhotoIndex >= monthPhotos.length) {
        setSelectedPhotoIndex(Math.max(0, monthPhotos.length - 1));
      }
      
      setUserPhotos(newPhotos);

      setMessage({ text: 'Foto excluída com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      setMessage({ text: 'Erro ao deletar foto. Tente novamente.', type: 'error' });
    }
  };

  // Adicionar useEffect para limpar mensagens após 5 segundos
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const shareAlbum = () => {
    setMessage({ text: 'Funcionalidade de compartilhamento em desenvolvimento!', type: 'info' });
  };

  const currentMonthPhotos = userPhotos[currentMonth - 1] || [];
  const displayedPhoto = activeTab === "development" 
    ? developmentPhotos[currentMonth - 1]
    : (currentMonthPhotos.length > 0 ? currentMonthPhotos[selectedPhotoIndex].url : null);

  const IconUpload = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );

  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"></path>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
    </svg>
  );

  const ShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-gray-50 rounded-3xl shadow-lg">
      {/* Mensagem de feedback */}
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] ${
          message.type === 'success' ? 'bg-green-200' : message.type === 'error' ? 'bg-red-200' : 'bg-blue-200'
        } text-black`}>
          {message.text}
        </div>
      )}

      {/* Diálogo de confirmação */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
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

      <div className="w-full bg-pink-800 text-white p-4 rounded-t-2xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-center">Minha Barriga</h1>
        <p className="text-center text-pink-100">Acompanhe a sua gestação mês a mês</p>
      </div>

      <div className="flex w-full max-w-md mb-6">
        <button 
          onClick={() => setActiveTab("development")} 
          className={`flex-1 py-3 px-4 rounded-tl-lg rounded-bl-lg font-medium transition-colors ${activeTab === "development" ? "bg-pink-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Desenvolvimento Fetal
        </button>
        <button 
          onClick={() => setActiveTab("photos")} 
          className={`flex-1 py-3 px-4 rounded-tr-lg rounded-br-lg font-medium transition-colors ${activeTab === "photos" ? "bg-pink-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Minhas Fotos
        </button>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-md p-4 mb-6">
        <div className="relative h-64 md:h-80 w-full flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-800"></div>
            </div>
          ) : activeTab === "development" ? (
            shouldShowImage(currentMonth) && developmentPhotos[currentMonth - 1] && (
              <img 
                src={developmentPhotos[currentMonth - 1]} 
                alt={`Mês ${currentMonth}`} 
                className="absolute h-64 md:h-80 object-contain rounded-xl shadow-lg transition-all duration-700"
              />
            )
          ) : (
            shouldShowImage(currentMonth) && displayedPhoto ? (
              <img 
                src={displayedPhoto} 
                alt={`Mês ${currentMonth}`} 
                className="absolute h-64 md:h-80 object-contain rounded-xl shadow-lg transition-all duration-700"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 md:h-80 w-full bg-gray-100 rounded-xl">
                <p className="text-black mb-2">Sem fotos para o mês {currentMonth}</p>
                {session?.user ? (
                  <label htmlFor="photo-upload" className="bg-pink-800 hover:bg-pink-900 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center">
                    <IconUpload className="mr-2" /> Adicionar Foto
                  </label>
                ) : (
                  <p className="text-black">Faça login para adicionar fotos</p>
                )}
              </div>
            )
          )}
        </div>

        <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" multiple />
        
        {activeTab === "photos" && currentMonthPhotos.length > 0 && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              onClick={() => confirmDeletePhoto(currentMonth - 1, selectedPhotoIndex)} 
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors"
            >
              <TrashIcon />
            </button>
            <label 
              htmlFor="photo-upload" 
              className="bg-pink-800 hover:bg-pink-900 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors"
            >
              <IconUpload />
            </label>
          </div>
        )}

        <div className="absolute top-0 bottom-0 left-2 flex items-center">
          <button 
            onClick={handlePrevious} 
            disabled={currentMonth === 1 || isTransitioning} 
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center ${currentMonth === 1 ? 'bg-gray-300 text-gray-500' : 'bg-pink-800 hover:bg-pink-900 text-white transition-colors'}`}
          >
            &lt;
          </button>
        </div>
        <div className="absolute top-0 bottom-0 right-2 flex items-center">
          <button 
            onClick={handleNext} 
            disabled={currentMonth === 9 || isTransitioning} 
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center ${currentMonth === 9 ? 'bg-gray-300 text-gray-500' : 'bg-pink-800 hover:bg-pink-900 text-white transition-colors'}`}
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white py-3 px-6 rounded-full shadow-md">
        <h2 className="text-xl font-semibold text-pink-800 text-center">Mês {currentMonth}</h2>
      </div>

      <div className="flex justify-center mb-8">
        {Array.from({ length: 9 }).map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => handleMonthSelect(idx)} 
            className={`w-10 h-10 mx-1 rounded-full transition-colors ${currentMonth === idx + 1 ? 'bg-pink-800 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {activeTab === "photos" && (
        <div className="w-full bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex justify-center gap-4 mb-4">
            <label htmlFor="photo-upload-bottom" className="bg-pink-800 hover:bg-pink-900 text-white py-2 px-4 rounded-lg flex items-center cursor-pointer transition-colors">
              <IconUpload className="mr-2" /> Adicionar Fotos
            </label>
            <input id="photo-upload-bottom" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" multiple />

            <button onClick={shareAlbum} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center">
              <ShareIcon className="mr-2" /> Partilhar Álbum
            </button>
          </div>

          {/* Mini gallery for current month with thumbnails */}
          {currentMonthPhotos.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-black mb-2">Fotos do Mês {currentMonth}</h3>
              <div className="flex flex-wrap gap-2">
                {currentMonthPhotos.map((photo, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedPhotoIndex(idx)} 
                    className={`relative w-16 h-16 rounded-md overflow-hidden cursor-pointer transition-all ${selectedPhotoIndex === idx ? 'ring-2 ring-pink-700 transform scale-105' : ''}`}
                  >
                    <img src={photo.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-lg font-medium text-black mb-2">Todos os Meses</h3>
          <div className="grid grid-cols-3 gap-3">
            {userPhotos.map((photos, idx) => (
              <div 
                key={idx} 
                onClick={() => handleMonthSelect(idx)} 
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${currentMonth === idx + 1 ? 'border-pink-700 shadow-md' : 'border-gray-200 hover:border-pink-300'}`}
              >
                {photos.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img src={photos[0].url} alt={`Mês ${idx + 1}`} className="w-full h-full object-cover" />
                    {photos.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        +{photos.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">Mês {idx + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinhaBarriga;