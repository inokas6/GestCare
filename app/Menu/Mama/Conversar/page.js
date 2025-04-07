"use client";
import Navbar from "../../../componets/Home/navbar_home";
import Sidebar from "../../../componets/Mama/Conversar/Forum/Sidebar";
import TopicList from "../../../componets/Mama/Conversar/Forum/TopicList";
import TopUsers from "../../../componets/Mama/Conversar/Forum/TopUsers";
import NewTopic from "../../../componets/Mama/Conversar/Forum/NewTopic";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);

    const handleNewTopic = () => {
        setIsNewTopicOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="mt-20">
                <div className="pl-64">
                    <header className="bg-white flex justify-between items-center px-6 py-4 border-b sticky top-0 z-10">
                        <div className="flex items-center space-x-4">
                            <div className="mt-20">
                                <Sidebar />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Pesquisar tópicos"
                                    className="w-96 px-4 py-2 bg-gray-100 rounded-lg focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                onClick={handleNewTopic}
                            >
                                Criar Novo Tópico
                            </button>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-6 py-8">
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                            <h2 className="text-2xl font-semibold mb-6">Bem-vindo ao Fórum</h2>
                            <p className="text-gray-600">Explore tópicos, participe de discussões e conecte-se com outros utilizadores.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <TopicList />
                            </div>
                            <div className="space-y-6">
                                <TopUsers />
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {isNewTopicOpen && (
                <NewTopic onClose={() => setIsNewTopicOpen(false)} />
            )}
        </div>
    );
}
