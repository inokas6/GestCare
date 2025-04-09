"use client";
import Navbar from "../../../componets/Home/navbar_home";
import Sidebar from "../../../componets/Mama/Conversar/Forum/Sidebar";
import TopicList from "../../../componets/Mama/Conversar/Forum/TopicList";
import TopUsers from "../../../componets/Mama/Conversar/Forum/TopUsers";
import NewTopic from "../../../componets/Mama/Conversar/Forum/NewTopic";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Page() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState('latest'); // 'latest', 'popular', 'unanswered'

    // Detectar tamanho da tela para determinar se é dispositivo móvel
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // Verificar na inicialização
        checkIfMobile();
        
        // Adicionar event listener para redimensionamento
        window.addEventListener('resize', checkIfMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const handleNewTopic = () => {
        setIsNewTopicOpen(true);
    };

    return (
        <div className="min-h-screen mt-18 bg-gray-100">
            {/* Navbar fixa no topo */}
            <div className="fixed top-0 left-0 right-0 z-30">
                <Navbar />
            </div>
            
            {/* Sidebar */}
            <Sidebar />
            
            {/* Container principal com padding-top para evitar sobreposição com a navbar */}
            <div className="pt-16">
                <div className="flex flex-row">
                    {/* Conteúdo principal com margem à esquerda para dar espaço à sidebar em desktop */}
                    <div className={`flex-1 ${isMobile ? 'ml-0 pl-4' : 'ml-48 lg:ml-64'}`}>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-3xl">
                                <div className="relative w-full sm:w-96">
                                    <input
                                        type="text"
                                        placeholder="Pesquisar tópicos"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-sm sm:text-base"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <svg className="w-5 h-5 absolute right-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm sm:text-base font-medium shadow-sm hover:shadow flex items-center justify-center"
                                    onClick={handleNewTopic}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Criar Novo Tópico
                                </button>
                            </div>
                        

                        <main className={`max-w-7xl mx-auto ${isMobile ? 'px-3' : 'px-5 sm:px-6'} py-6 sm:py-8`}>
                            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                                <div className="relative z-10">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Bem-vindo ao Fórum</h2>
                                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                        Explore tópicos, participe de discussões e conecte-se com outros utilizadores neste espaço de comunidade.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs de navegação */}
                            <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
                                <div className="flex space-x-1">
                                    <button 
                                        className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                            activeTab === 'latest' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setActiveTab('latest')}
                                    >
                                        Recentes
                                    </button>
                                    <button 
                                        className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                            activeTab === 'popular' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setActiveTab('popular')}
                                    >
                                        Populares
                                    </button>
                                    <button 
                                        className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                                            activeTab === 'unanswered' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setActiveTab('unanswered')}
                                    >
                                        Sem Resposta
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                <div className="lg:col-span-2">
                                    <TopicList />
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                                            <h3 className="font-semibold text-purple-700">Utilizadores em Destaque</h3>
                                        </div>
                                        <div className="p-2">
                                            <TopUsers />
                                        </div>
                                    </div>
                                    
                                    {/* Widget adicional */}
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                                            <h3 className="font-semibold text-purple-700">Categorias</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all">
                                                    Todas
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all">
                                                    Dúvidas
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all">
                                                    Sugestões
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all">
                                                    Notícias
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all">
                                                    Ajuda
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {isNewTopicOpen && (
                <NewTopic onClose={() => setIsNewTopicOpen(false)} />
            )}
        </div>
    );
}