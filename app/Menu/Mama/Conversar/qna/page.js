"use client";
import Sidebar from '../../../../componets/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import { useState } from 'react';

export default function QnAPage() {
    const [questions] = useState([
        { id: 1, title: 'Como posso melhorar minha saúde mental?', date: '2024-03-15', answers: 5 },
        { id: 2, title: 'Dicas para uma alimentação saudável', date: '2024-03-14', answers: 3 },
        { id: 3, title: 'Exercícios para iniciantes', date: '2024-03-13', answers: 7 }
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="pl-64">
                <header className="bg-white flex justify-between items-center px-6 py-4 border-b sticky top-0 z-10">
                    <h1 className="text-xl font-semibold text-purple-600">Minhas Perguntas e Respostas</h1>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-6">Minhas Perguntas</h2>
                        <div className="space-y-4">
                            {questions.map((question) => (
                                <div key={question.id} className="border-b pb-4">
                                    <h3 className="text-lg font-medium text-gray-900">{question.title}</h3>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <span>Data: {question.date}</span>
                                        <span className="mx-2">•</span>
                                        <span>{question.answers} respostas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 