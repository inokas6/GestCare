'use client'
import { useState } from 'react';

const GrowthTracker = () => {
  const [nome, setNome] = useState('');
  const [resultado, setResultado] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const buscarSignificado = async () => {
    if (!nome.trim()) {
      setErro('Por favor, digite um nome');
      return;
    }

    setCarregando(true);
    setResultado('');
    setErro('');

    try {
      const res = await fetch(`/api/nomes?nome=${encodeURIComponent(nome.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao buscar nome');
      }

      if (data.meaning) {
        setResultado(data.meaning);
      } else {
        setErro('Significado não encontrado para este nome');
      }
    } catch (err) {
      setErro(err.message || 'Erro ao buscar nome');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-pink-600">Significado de Nomes</h3>
        <button 
          onClick={buscarSignificado}
          className="text-pink-500 text-sm font-medium hover:text-pink-600"
        >
          
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">
            🔍
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm transition-all duration-300 bg-pink-50/50 placeholder-pink-300 text-black"
            placeholder="Digite um nome..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && buscarSignificado()}
          />
        </div>
        
       

        {erro && (
          <div className="p-2 text-red-600 text-sm bg-red-50 rounded-lg">
            {erro}
          </div>
        )}

        {resultado && (
          <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-sm text-gray-700">{resultado}</p>
          </div>
        )}
        
        <button 
          onClick={buscarSignificado}
          disabled={carregando}
          className="mt-2 w-full py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition disabled:bg-pink-300"
        >
          {carregando ? '...' : 'Descobrir Significado'}
        </button>
      </div>
    </div>
  );
};

export default GrowthTracker; 