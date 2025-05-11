'use client'
import { useState } from 'react';

export default function NomePage() {
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
      console.log('Buscando nome:', nome.trim());
      const res = await fetch(`/api/nomes?nome=${encodeURIComponent(nome.trim())}`);
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
    <main className="min-h-screen p-8 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-pink-600">
          Buscar Significado de um Nome
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex gap-4 mb-6">
            <input
              className="flex-1 p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite um nome (ex: Miguel)"
              onKeyPress={(e) => e.key === 'Enter' && buscarSignificado()}
            />
            <button
              onClick={buscarSignificado}
              disabled={carregando}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-pink-300 transition-colors"
            >
              {carregando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {erro && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
              {erro}
            </div>
          )}

          {resultado && (
            <div className="p-4 bg-pink-50 rounded-lg">
              <h2 className="text-lg font-semibold text-pink-700 mb-2">Significado:</h2>
              <p className="text-gray-700">{resultado}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
