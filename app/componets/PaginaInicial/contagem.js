import React from 'react';

// Componente de estatísticas e notícias
const not = () => {
    return (
        // Contentor principal com fundo cinzento claro
        <div className="p-4 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-4 gap-4 bg-pink-100 p-4 rounded-lg text-center text-pink-500 text-2xl font-semibold">
        <div>XX <br /> Casais</div>
        <div>XX <br /> Eventos</div>
        <div>XX <br /> Parcerias</div>
        <div>XX <br /> News Letters</div>
      </div>
      
      <div className="columns-3 gap-4 mt-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className={`bg-white shadow-md rounded-lg overflow-hidden p-4 break-inside-avoid mb-4 ${index % 2 === 0 ? 'h-80' : 'h-60'}`}
          >
            <img 
              src="https://via.placeholder.com/300" 
              alt="" 
              className="w-full object-cover rounded-lg h-40"
            />
            <h3 className="text-lg font-semibold mt-2">Título da Notícia {index + 1}</h3>
            <p className="text-gray-500">Ler mais</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="btn btn-primary bg-pink-400 text-white px-6 py-2 rounded-full">Ver mais</button>
      </div>
    </div>
    );
};

// Exporta o componente de estatísticas e notícias
export default not;