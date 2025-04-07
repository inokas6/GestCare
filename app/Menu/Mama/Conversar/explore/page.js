"use client";
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import { useState } from 'react';

export default function ExplorePage() {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="pl-64">
                <header className="bg-white flex justify-between items-center px-6 py-4 border-b sticky top-0 z-10">
                    <h1 className="text-xl font-semibold text-purple-600">Explore Topics</h1>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-6">Explore Tópicos</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {topics.map((topic, index) => (
                                <button
                                    key={index}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors border"
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