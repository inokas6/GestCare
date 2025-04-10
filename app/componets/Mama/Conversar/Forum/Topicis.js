"use client";
import Navbar from "../../../componets/Home/navbar_home";
import { useState, useEffect } from 'react';
import TopicList from "../../../componets/Forum/TopicList";
import TopUsers from "../../../componets/Forum/TopUsers";
import NewTopic from "../../../componets/Forum/NewTopic";
import Sidebar from "../../../componets/Forum/Sidebar";
import { usePathname } from 'next/navigation';

export default function Page() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const pathname = usePathname();
    const [topics] = useState([
        { category: 'Technology', color: '#FF4444' },
        { category: 'Climate', color: '#4ADE80' },
        { category: 'Space exploration', color: '#8B5CF6' },
        { category: 'AI and ethics', color: '#FF6B6B' },
        { category: 'Social media', color: '#4FD1C5' },
        { category: 'Mental health', color: '#4299E1' },
        { category: 'Education', color: '#9F7AEA' },
        { category: 'Health', color: '#F687B3' },
        { category: 'Culture', color: '#68D391' },
        { category: 'Politics', color: '#F6AD55' },
        { category: 'Sports', color: '#9F7AEA' },
        { category: 'Public opinion', color: '#4ADE80' },
        { category: 'History', color: '#4FD1C5' },
        { category: 'Economy', color: '#4299E1' },
        { category: 'Business', color: '#F687B3' },
        { category: 'Science', color: '#8B5CF6' },
        { category: 'Philosophy', color: '#4FD1C5' },
        { category: 'Art', color: '#68D391' }
    ]);

    useEffect(() => {
        const section = pathname.split('/').pop();
        setActiveSection(section || 'home');
    }, [pathname]);

    const renderContent = () => {
        switch (activeSection) {
            case 'home':
                return (
                    <>
                        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Bem-vindo ao Fórum</h2>
                            <p className="text-gray-600 text-sm sm:text-base">Explore tópicos, participe de discussões e conecte-se com outros usuários.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
                            <div className="col-span-1 sm:col-span-9">
                                <TopicList />
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <TopUsers />
                            </div>
                        </div>
                    </>
                );
            case 'explore':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Explore Tópicos</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            {topics.map((topic, index) => (
                                <button
                                    key={index}
                                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm hover:bg-gray-50 transition-colors border"
                                    style={{ color: topic.color }}
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.color }}></span>
                                    <span>{topic.category}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'chat':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Chat</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Área de chat em desenvolvimento...</p>
                    </div>
                );
            case 'qna':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Minhas Perguntas e Respostas</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Suas perguntas e respostas aparecerão aqui.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            
            <div className="pl-0 sm:pl-48 lg:pl-64">
                <header className="bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 z-10 gap-3 sm:gap-0">
                    <h1 className="text-lg sm:text-xl font-semibold text-purple-600">H-Forum</h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-96">
                            <input
                                type="text"
                                placeholder="Search for Topics"
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
                            onClick={() => setIsNewTopicOpen(true)}
                        >
                            Start a New Topic
                        </button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    {renderContent()}
                </main>
            </div>

            <NewTopic 
                isOpen={isNewTopicOpen} 
                onClose={() => setIsNewTopicOpen(false)} 
            />
        </div>
    );
}