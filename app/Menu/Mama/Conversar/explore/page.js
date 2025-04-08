"use client";
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import { useState } from 'react';

export default function ExplorePage() {
    const [topics] = useState([
        { category: 'categoria 1', color: '#FF4444' },
        { category: 'categoria 2', color: '#4ADE80' },
        { category: 'categoria 3', color: '#8B5CF6' },
        { category: 'categoria 4', color: '#FF6B6B' },
        { category: 'categoria 5', color: '#4FD1C5' },
        { category: 'categoria 6', color: '#4299E1' },
        { category: 'categoria 7', color: '#9F7AEA' },
        { category: 'categoria 8', color: '#F687B3' },
        { category: 'categoria 9', color: '#68D391' },
        { category: 'categoria 10', color: '#F6AD55' },
        { category: 'categoria 11', color: '#9F7AEA' },
        { category: 'categoria 12', color: '#4ADE80' },
        { category: 'categoria 13', color: '#4FD1C5' },
        { category: 'categoria 14', color: '#4299E1' },
        { category: 'categoria 15', color: '#F687B3' },
        { category: 'categoria 16', color: '#8B5CF6' },
        { category: 'categoria 17', color: '#4FD1C5' },
        { category: 'categoria 18', color: '#68D391' }
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="pl-0 sm:pl-48 lg:pl-64">
                <header className="bg-white flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 z-10">
                    <h1 className="text-lg sm:text-xl font-semibold text-purple-600">Categorias</h1>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Categorias</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                </main>
            </div>
        </div>
    );
} 