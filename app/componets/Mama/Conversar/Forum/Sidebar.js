"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    
    const menuItems = [
        { id: 1, nome: 'Início', path: '/Menu/Mama/Conversar' },
        { id: 2, nome: 'Minhas Publicações', path: '/Menu/Mama/Conversar/minhas-publicacoes' },
        { id: 3, nome: 'Favoritos', path: '/Menu/Mama/Conversar/favoritos' },
        { id: 4, nome: 'Notificações', path: '/Menu/Mama/Conversar/notificacoes' }
    ];

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Menu</h2>
                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`block px-4 py-2 rounded-lg ${
                                pathname === item.path
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {item.nome}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
} 