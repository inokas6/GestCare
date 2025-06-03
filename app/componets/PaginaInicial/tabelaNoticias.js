import React from 'react';

const TabelaNoticias = () => {
  // Dados de exemplo - você pode substituir por dados reais posteriormente
  const noticias = [
    {
      id: 1,
      titulo: "Cuidados com o bebê no verão",
      imagem: "https://via.placeholder.com/300",
      data: "2024-03-20"
    },
    {
      id: 2,
      titulo: "Alimentação saudável para crianças",
      imagem: "https://via.placeholder.com/300",
      data: "2024-03-19"
    },
    {
      id: 3,
      titulo: "Desenvolvimento infantil",
      imagem: "https://via.placeholder.com/300",
      data: "2024-03-18"
    },
    {
      id: 4,
      titulo: "Dicas para amamentação",
      imagem: "https://via.placeholder.com/300",
      data: "2024-03-17"
    },
    {
      id: 5,
      titulo: "Sono do bebê",
      imagem: "https://via.placeholder.com/300",
      data: "2024-03-16"
    },
    {
      id: 6,
      titulo: "Primeiros passos",
      imagem: "https://via.placeholder.com/300",
      data: "2024-03-15"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Últimas Notícias</h2>
      
      <div className="columns-3 gap-4 mt-6">
        {noticias.map((noticia, index) => (
          <div 
            key={noticia.id} 
            className={`bg-white shadow-md rounded-lg overflow-hidden p-4 break-inside-avoid mb-4 ${index % 2 === 0 ? 'h-80' : 'h-60'}`}
          >
            <img 
              src={noticia.imagem} 
              alt={noticia.titulo} 
              className="w-full object-cover rounded-lg h-40"
            />
            <h3 className="text-lg font-semibold mt-2">{noticia.titulo}</h3>
            <p className="text-gray-500">{noticia.data}</p>
            <p className="text-pink-400 cursor-pointer hover:text-pink-500">Ler mais</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="btn btn-primary bg-pink-400 text-white px-6 py-2 rounded-full hover:bg-pink-500 transition-colors">
          Ver mais notícias
        </button>
      </div>
    </div>
  );
};

export default TabelaNoticias; 