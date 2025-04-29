"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';


export default function CategoriasPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/forum/categorias', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Erro ao carregar categorias: ${response.status} - ${errorData.message || 'Erro desconhecido'}`
          );
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Os dados recebidos não são um array de categorias');
        }
        
        const categoriasOrdenadas = data
          .filter(cat => cat.ativa)
          .sort((a, b) => a.ordem - b.ordem);
          
        setCategorias(categoriasOrdenadas);
      } catch (err) {
        console.error('Erro detalhado:', err);
        setError(err.message || 'Não foi possível carregar as categorias. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const filteredCategorias = searchQuery 
    ? categorias.filter(cat => 
        cat.nome.toLowerCase().includes(searchQuery.toLowerCase()) && cat.ativa)
    : categorias.filter(cat => cat.ativa);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div className="pl-0 sm:pl-48 lg:pl-64 transition-all duration-300">
        <header className="bg-white shadow-sm flex justify-between items-center px-4 sm:px-6 py-4 border-b sticky top-0 z-10">
          <h1 className="text-xl font-bold text-purple-700">Explorar Categorias</h1>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar categoria..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-40 md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Comunidade de Mães</h2>
                <p className="text-gray-500">Escolha uma categoria para explorar discussões com outras mães</p>
              </div>
              
              {filteredCategorias.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Nenhuma categoria encontrada com "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {filteredCategorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      onClick={() => router.push(`/Menu/Mama/Conversar/categorias/${categoria.id}`)}
                      className="flex items-center justify-center md:justify-start space-x-2 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border text-sm md:text-base cursor-pointer"
                      style={{ borderLeft: `4px solid ${categoria.cor}` }}
                    >
                      <span className="hidden md:block text-xl">{categoria.icone}</span>
                      <span className="font-medium" style={{ color: categoria.cor }}>
                        {categoria.nome}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}