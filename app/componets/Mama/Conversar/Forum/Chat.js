"use client";
import { useState } from 'react';

export default function Chat() {
    const [onlineUsers] = useState(0);
    const [topUsers] = useState([
        { id: 1, name: 'Himanshu' },
        { id: 2, name: 'Rohan' },
        { id: 3, name: 'Ritika' },
        { id: 4, name: 'Karan' },
        { id: 5, name: 'Parth' },
        { id: 6, name: 'Vedant' },
        { id: 7, name: 'Kartik' }
    ]);

    return (
        <div className="flex flex-col sm:flex-row h-screen bg-gray-50 font-sans">
            {/* Área principal do chat */}
            <div className="flex-1 flex flex-col">
                {/* Cabeçalho */}
                <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex justify-between items-center">
                        Online Users
                        <span className="text-purple-600 font-bold text-sm sm:text-base">{onlineUsers}</span>
                    </h2>
                </div>

                {/* Área de mensagens */}
                <div className="flex-1 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
                    <p className="text-gray-400 italic text-sm sm:text-base">No messages yet...</p>
                </div>

                {/* Campo de entrada */}
                <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-t">
                    <div className="flex items-center rounded-xl border bg-white focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
                        <input
                            type="text"
                            placeholder="Write a message..."
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 sm:py-3 transition flex items-center justify-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Barra lateral direita */}
            <div className="w-full sm:w-72 bg-white border-l px-4 sm:px-6 py-4 sm:py-6 shadow-inner">
                <button className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl transition mb-4 sm:mb-6 text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                    </svg>
                    <span>Start New Topic</span>
                </button>

                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Top Users</h3>
                <div className="space-y-2 sm:space-y-3">
                    {topUsers.map(user => (
                        <div key={user.id} className="flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-purple-100 text-purple-600 font-semibold rounded-full flex items-center justify-center text-xs sm:text-sm">
                                {user.name[0]}
                            </div>
                            <span className="text-sm sm:text-base text-gray-700">{user.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
