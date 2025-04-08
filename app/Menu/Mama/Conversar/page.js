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
        <div className="min-h-screen bg-gray-50">
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
                        <header className="bg-white flex flex-col items-center px-4 sm:px-6 py-6 border-b sticky top-16 z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-3xl">
                                <div className="relative w-full sm:w-96">
                                    <input
                                        type="text"
                                        placeholder="Pesquisar tópicos"
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-100 rounded-lg focus:outline-none text-sm sm:text-base"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                                    onClick={handleNewTopic}
                                >
                                    Criar Novo Tópico
                                </button>
                            </div>
                        </header>

                        <main className={`max-w-7xl mx-auto ${isMobile ? 'px-2' : 'px-4 sm:px-6'} py-4 sm:py-8`}>
                            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-8">
                                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Bem-vindo ao Fórum</h2>
                                <p className="text-gray-600 text-sm sm:text-base">Explore tópicos, participe de discussões e conecte-se com outros utilizadores.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                                <div className="lg:col-span-2">
                                    <TopicList />
                                </div>
                                <div className="space-y-4 sm:space-y-6">
                                    <TopUsers />
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