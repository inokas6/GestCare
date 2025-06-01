'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Usuários', path: '/admin/users', icon: '👥' },
    { name: 'Informações gest', path: '/admin/info-gestacional', icon: '👥' },
    { name: 'Fotos Barriga', path: '/admin/fotos-barriga', icon: '👥' },    
    { name: 'Chat', path: '/admin/chat', icon: '👥' },
    { name: 'Publicações', path: '/admin/topicos', icon: '👥' },
    { name: 'Configurações', path: '/admin/configuracoes', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center p-4 ${
                pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-2xl font-semibold text-gray-800">Painel Administrativo</h1>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 