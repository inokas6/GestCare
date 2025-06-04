import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const TabelaNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [noticiaSelecionada, setNoticiaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchNoticias = async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('id, titulo, imagem, data, conteudo')
        .order('data', { ascending: false });

      if (error) {
        console.error("Erro ao buscar notícias:", error);
      } else {
        // Formatar as datas para exibição
        const noticiasFormatadas = data.map(noticia => ({
          ...noticia,
          data: new Date(noticia.data).toLocaleDateString('pt-BR')
        }));
        setNoticias(noticiasFormatadas);
      }
    };

    fetchNoticias();
  }, []);

  const abrirModal = (noticia) => {
    setNoticiaSelecionada(noticia);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setNoticiaSelecionada(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Últimas Notícias</h2>

      <div className="columns-3 gap-4 mt-6">
        {noticias.map((noticia, index) => (
          <div
            key={noticia.id}
            className="bg-white shadow-md rounded-lg overflow-hidden p-4 break-inside-avoid mb-4 h-80"
          >
            <img
              src={noticia.imagem}
              alt={noticia.titulo}
              className="w-full object-cover rounded-lg h-40"
            />
            <h3 className="text-lg font-semibold mt-2 text-black">{noticia.titulo}</h3>
            <p className="text-black">{noticia.data}</p>
            <p 
              className="text-pink-400 cursor-pointer hover:text-pink-500"
              onClick={() => abrirModal(noticia)}
            >
              Ler mais
            </p>
          </div>
        ))}
      </div>

      {modalAberto && noticiaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-black">{noticiaSelecionada.titulo}</h2>
              <button 
                onClick={fecharModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <img
              src={noticiaSelecionada.imagem}
              alt={noticiaSelecionada.titulo}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-600 mb-4">{noticiaSelecionada.data}</p>
            <div className="text-black whitespace-pre-wrap">
              {noticiaSelecionada.conteudo}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button className="btn btn-primary bg-pink-400 text-white px-6 py-2 rounded-full hover:bg-pink-500 transition-colors">
          Ver mais notícias
        </button>
      </div>
    </div>
  );
};

export default TabelaNoticias;
