'use client'
import { useState } from 'react';
import Navbar from '../../../componets/Home/navbar_home';

export default function NomePage() {
  const [nome, setNome] = useState('');
  const [resultado, setResultado] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarExemplos, setMostrarExemplos] = useState(false);

  const exemplosNomes = ['Sofia', 'Miguel', 'Laura', 'Gabriel', 'Helena'];

  const buscarSignificado = async (nomeParaBuscar = nome) => {
    if (!nomeParaBuscar.trim()) {
      setErro('Por favor, digite um nome');
      return;
    }

    setCarregando(true);
    setResultado('');
    setErro('');

    try {
      console.log('Buscando nome:', nomeParaBuscar.trim());
      const res = await fetch(`/api/nomes?nome=${encodeURIComponent(nomeParaBuscar.trim())}`);
      const data = await res.json();
      
      console.log('Resposta da API:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao buscar nome');
      }

      if (data.meaning) {
        setResultado(data.meaning);
      } else {
        setErro('Significado não encontrado para este nome');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setErro(err.message || 'Erro ao buscar nome');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <Navbar />
      
      {/* Header com fundo decorativo */}
      <div className="relative py-16 bg-pink-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-pink-300"></div>
            <div className="absolute top-40 left-40 w-16 h-16 rounded-full bg-pink-400"></div>
            <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-pink-200"></div>
            <div className="absolute bottom-10 right-40 w-16 h-16 rounded-full bg-pink-300"></div>
            <div className="absolute bottom-40 left-20 w-20 h-20 rounded-full bg-pink-200"></div>
          </div>
        </div>
        
        
      </div>
      
      {/* Área de busca */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
          <div className="relative mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 text-xl">
                  🔍
                </span>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-lg transition-all duration-300 bg-pink-50/50 placeholder-pink-300"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome do bebê..."
                  onKeyPress={(e) => e.key === 'Enter' && buscarSignificado()}
                />
              </div>
              <button
                onClick={() => buscarSignificado()}
                disabled={carregando}
                className="px-8 py-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:bg-pink-300 transition-all duration-300 text-lg font-medium shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap"
              >
                {carregando ? (
                  <>
                    <span className="mr-2 animate-spin text-xl">⏳</span>
                    A procurar...
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-xl">✨</span>
                    Descobrir
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <button 
                onClick={() => setMostrarExemplos(!mostrarExemplos)}
                className="text-pink-500 text-sm hover:text-pink-700 flex items-center"
              >
                <span className="mr-1">📋</span>
                {mostrarExemplos ? 'Ocultar exemplos' : 'Ver exemplos populares'}
              </button>
            </div>
            
            {mostrarExemplos && (
              <div className="mt-3 flex flex-wrap gap-2">
                {exemplosNomes.map((exemploNome) => (
                  <button
                    key={exemploNome}
                    onClick={() => {
                      setNome(exemploNome);
                      buscarSignificado(exemploNome);
                    }}
                    className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors text-sm"
                  >
                    {exemploNome}
                  </button>
                ))}
              </div>
            )}
          </div>

          {erro && (
            <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-center">
              <span className="mr-2 text-xl">⚠️</span>
              {erro}
            </div>
          )}

          {resultado && (
            <div className="p-0 overflow-hidden bg-white rounded-2xl border-2 border-pink-200 shadow-lg transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-pink-100 to-pink-50 px-6 py-4 border-b border-pink-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold text-pink-600">{nome}</h2>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-pink-500 text-xl">👶</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <span className="mr-2 text-xl text-pink-500"></span>
                    <h3 className="text-xl font-semibold text-pink-700">Significado</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-8">{resultado}</p>
                </div>
                
                
              </div>
            </div>
          )}
          
          {!resultado && !erro && (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-pink-50/50 rounded-xl border border-dashed border-pink-200">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👶</span>
              </div>
              <p className="text-pink-500 text-center max-w-md">
                Digite o nome do bebê para descobrir seu significado e origem.
              </p>
            </div>
          )}
        </div>
        
        {/* Informações adicionais */}
        
      </div>
      
      
    </main>
  );
}