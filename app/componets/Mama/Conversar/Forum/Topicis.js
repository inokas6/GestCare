"use client";
import { useState } from 'react';
import TopicList from './TopicList';
import TopUsers from './TopUsers';
import Navbar from '../../../Home/navbar_home';
import Sidebar from './Sidebar';

export default function Page() {
    const [activeSection, setActiveSection] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');

    const topics = [
        { category: 'Gravidez', color: '#8B5CF6' },
        { category: 'Amamentação', color: '#EC4899' },
        { category: 'Cuidados', color: '#10B981' },
        { category: 'Dúvidas', color: '#F59E0B' },
        { category: 'Experiências', color: '#3B82F6' },
        { category: 'Dicas', color: '#6366F1' },
        { category: 'Saúde', color: '#EF4444' },
        { category: 'Alimentação', color: '#14B8A6' }
    ];

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
            case 'categorias':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Categorias</h2>
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
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="pl-0 sm:pl-48 lg:pl-64">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}