import React, { useState, useEffect } from 'react';
import { useSupabaseUser, useSupabaseClient } from '@supabase/auth-helpers-nextjs';
//import { useFetch } from 'use-http';

const MinhaBarriga = () => {
  const [currentMonth, setCurrentMonth] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(null);
  const [prevMonth, setPrevMonth] = useState(null);
  const [userPhotos, setUserPhotos] = useState(Array(9).fill(null));
  const [activeTab, setActiveTab] = useState("development");
  const user = useSupabaseUser();
  const client = useSupabaseClient();
  
  const developmentImages = Array(9).fill("/api/placeholder/400/320");
    
  useEffect(() => {
    const carregarFotos = async () => {
      if (!user?.id) return;

      try {
        const { data: fotos } = await useFetch(`/api/fotos_barriga/${user.id}`);
        
        if (fotos) {
          const fotosOrganizadas = Array(9).fill(null);
          fotos.forEach(foto => {
            fotosOrganizadas[foto.mes - 1] = foto.url;
          });
          setUserPhotos(fotosOrganizadas);
        }
      } catch (erro) {
        console.error('Erro ao carregar fotos:', erro);
      }
    };

    carregarFotos();
  }, [user]);

  const handlePrevious = () => {
    if (!isTransitioning && currentMonth > 1) {
      setPrevMonth(currentMonth);
      setDirection('right');
      setIsTransitioning(true);
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNext = () => {
    if (!isTransitioning && currentMonth < 9) {
      setPrevMonth(currentMonth);
      setDirection('left');
      setIsTransitioning(true);
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleMonthSelect = (monthIndex) => {
    if (!isTransitioning && monthIndex + 1 !== currentMonth) {
      setPrevMonth(currentMonth);
      setDirection(monthIndex + 1 > currentMonth ? 'left' : 'right');
      setIsTransitioning(true);
      setCurrentMonth(monthIndex + 1);
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
    if (direction === 'left') return month === currentMonth || month === prevMonth;
    if (direction === 'right') return month === currentMonth || month === prevMonth;
    return false;
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;

    try {
      // Upload da imagem para o storage do Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${currentMonth}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await client.storage
        .from('fotos-barriga')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data: { publicUrl } } = client.storage
        .from('fotos-barriga')
        .getPublicUrl(fileName);

      // Salvar referência no banco de dados
      const { error: dbError } = await client
        .from('user_fotos_barriga')
        .upsert({
          user_id: user.id,
          mes: currentMonth,
          url: publicUrl,
          descricao: `Foto do mês ${currentMonth}`
        }, {
          onConflict: 'user_id,mes'
        });

      if (dbError) throw dbError;

      // Atualizar estado local
      const newPhotos = [...userPhotos];
      newPhotos[currentMonth - 1] = publicUrl;
      setUserPhotos(newPhotos);

    } catch (erro) {
      console.error('Erro ao fazer upload:', erro);
      alert('Erro ao fazer upload da foto. Tente novamente.');
    }
  };

  const shareAlbum = () => {
    // Implement sharing functionality
    alert("Compartilhar álbum de fotos");
  };
  
  // Custom SVG icons
  const IconCamera = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );
  
  const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );
  
  const IconShare = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );
  
  const IconChevronLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
  
  const IconChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
  
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-pink-50 rounded-3xl shadow-lg">
      {/* Header */}
      <div className="w-full bg-pink-400 text-white p-4 rounded-t-2xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-center">Minha Barriga</h1>
        <p className="text-center text-pink-100">Acompanhe sua gestação mês a mês</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex w-full max-w-md mb-6">
        <button 
          onClick={() => setActiveTab("development")}
          className={`flex-1 py-3 px-4 rounded-tl-lg rounded-bl-lg font-medium transition-all duration-300 
            ${activeTab === "development" 
              ? "bg-pink-500 text-white shadow-md" 
              : "bg-pink-200 text-pink-700 hover:bg-pink-300"}`}
        >
          Desenvolvimento Fetal
        </button>
        <button 
          onClick={() => setActiveTab("photos")}
          className={`flex-1 py-3 px-4 rounded-tr-lg rounded-br-lg font-medium transition-all duration-300
            ${activeTab === "photos" 
              ? "bg-pink-500 text-white shadow-md" 
              : "bg-pink-200 text-pink-700 hover:bg-pink-300"}`}
        >
          Minhas Fotos
        </button>
      </div>
      
      {/* Main Carousel Area */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-md p-4 mb-6">
        <div className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center">
          {activeTab === "development" ? (
            // Development Images
            <div className="relative h-full w-full flex items-center justify-center">
              {Array.from({ length: 9 }).map((_, idx) => {
                const month = idx + 1;
                const isVisible = shouldShowImage(month);
                const isCurrent = month === currentMonth;
                const isPrev = month === prevMonth;
                
                if (!isVisible) return null;
                
                return (
                  <div
                    key={`dev-${month}`}
                    className={`absolute transition-all duration-700 ease-in-out transform
                      ${!isTransitioning && isCurrent ? 'opacity-100 scale-100 translate-x-0' : ''}
                      ${isTransitioning && isCurrent && direction === 'left' ? 
                        'opacity-100 scale-100 animate-smooth-slide-in-left' : ''}
                      ${isTransitioning && isCurrent && direction === 'right' ? 
                        'opacity-100 scale-100 animate-smooth-slide-in-right' : ''}
                      ${isTransitioning && isPrev && direction === 'left' ? 
                        'opacity-0 scale-90 animate-smooth-slide-out-left' : ''}
                      ${isTransitioning && isPrev && direction === 'right' ? 
                        'opacity-0 scale-90 animate-smooth-slide-out-right' : ''}`}
                  >
                    <img 
                      src={developmentImages[month - 1]} 
                      alt={`Feto no mês ${month}`} 
                      className="h-64 md:h-80 object-contain rounded-xl shadow-lg"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // User Photos
            <div className="relative h-full w-full flex items-center justify-center">
              {userPhotos[currentMonth - 1] ? (
                <img 
                  src={userPhotos[currentMonth - 1]} 
                  alt={`Minha barriga no mês ${currentMonth}`} 
                  className="h-64 md:h-80 object-contain rounded-xl shadow-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full bg-pink-100 rounded-xl border-2 border-dashed border-pink-300">
                  <div className="text-pink-400 mb-3">
                    <IconCamera />
                  </div>
                  <p className="text-pink-500 font-medium text-center mb-4">Adicione uma foto da sua barriga no mês {currentMonth}</p>
                  <label htmlFor="photo-upload" className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors">
                    <IconUpload />
                    Fazer Upload
                  </label>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Animation definitions */}
        <style jsx>{`
          @keyframes smoothSlideInLeft {
            0% { transform: translateX(100%) scale(0.9); opacity: 0; }
            20% { opacity: 0.5; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
          
          @keyframes smoothSlideInRight {
            0% { transform: translateX(-100%) scale(0.9); opacity: 0; }
            20% { opacity: 0.5; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
          
          @keyframes smoothSlideOutLeft {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            20% { opacity: 0.5; }
            100% { transform: translateX(-100%) scale(0.9); opacity: 0; }
          }
          
          @keyframes smoothSlideOutRight {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            20% { opacity: 0.5; }
            100% { transform: translateX(100%) scale(0.9); opacity: 0; }
          }
          
          .animate-smooth-slide-in-left {
            animation: smoothSlideInLeft 800ms cubic-bezier(0.33, 1, 0.68, 1) forwards;
          }
          
          .animate-smooth-slide-in-right {
            animation: smoothSlideInRight 800ms cubic-bezier(0.33, 1, 0.68, 1) forwards;
          }
          
          .animate-smooth-slide-out-left {
            animation: smoothSlideOutLeft 800ms cubic-bezier(0.33, 1, 0.68, 1) forwards;
          }
          
          .animate-smooth-slide-out-right {
            animation: smoothSlideOutRight 800ms cubic-bezier(0.33, 1, 0.68, 1) forwards;
          }
        `}</style>
        
        {/* Navigation buttons */}
        <div className="absolute top-0 bottom-0 left-2 flex items-center">
          <button 
            onClick={handlePrevious}
            disabled={currentMonth === 1 || isTransitioning}
            className={`flex items-center justify-center w-10 h-10 rounded-full z-40 
              ${currentMonth === 1 || isTransitioning 
                ? 'bg-pink-200 text-pink-400 cursor-not-allowed' 
                : 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer shadow-md hover:shadow-lg'}
              transition-all`}
            aria-label="Mês anterior"
          >
            <IconChevronLeft />
          </button>
        </div>
        
        <div className="absolute top-0 bottom-0 right-2 flex items-center">
          <button 
            onClick={handleNext}
            disabled={currentMonth === 9 || isTransitioning}
            className={`flex items-center justify-center w-10 h-10 rounded-full z-40 
              ${currentMonth === 9 || isTransitioning 
                ? 'bg-pink-200 text-pink-400 cursor-not-allowed' 
                : 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer shadow-md hover:shadow-lg'}
              transition-all`}
            aria-label="Próximo mês"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>
      
      {/* Month Indicator */}
      <div className="mb-6 bg-white py-3 px-6 rounded-full shadow-md">
        <h2 className="text-xl font-semibold text-pink-600 text-center">Mês {currentMonth}</h2>
      </div>
      
      {/* Month Selection Dots */}
      <div className="flex justify-center mb-8">
        {Array.from({ length: 9 }).map((_, idx) => (
          <button
            key={`month-dot-${idx}`}
            onClick={() => handleMonthSelect(idx)}
            className={`w-10 h-10 mx-1 rounded-full flex items-center justify-center transition-all
              ${currentMonth === idx + 1
                ? 'bg-pink-500 text-white shadow-md scale-110'
                : 'bg-pink-200 text-pink-600 hover:bg-pink-300'}
            `}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      
      {/* Photo Album Tools - Only show when photos tab is active */}
      {activeTab === "photos" && (
        <div className="w-full bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex justify-center gap-4">
            <label htmlFor="photo-upload-bottom" className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors">
              <IconUpload />
              Adicionar Foto
            </label>
            <input 
              id="photo-upload-bottom" 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
            
            <button 
              onClick={shareAlbum}
              className="bg-pink-100 hover:bg-pink-200 text-pink-700 py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <IconShare />
              Compartilhar Álbum
            </button>
          </div>
          
          {/* Photo thumbnails */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-pink-600 mb-3">Meu Álbum de Fotos</h3>
            <div className="grid grid-cols-3 gap-3">
              {userPhotos.map((photo, idx) => (
                <div 
                  key={`photo-thumb-${idx}`} 
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all
                    ${currentMonth === idx + 1 ? 'border-pink-500 shadow-md' : 'border-pink-200'}
                    ${photo ? '' : 'border-dashed'}`}
                  onClick={() => handleMonthSelect(idx)}
                >
                  {photo ? (
                    <img 
                      src={photo} 
                      alt={`Mês ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pink-50">
                      <span className="text-pink-400 text-sm font-medium">{idx + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinhaBarriga;