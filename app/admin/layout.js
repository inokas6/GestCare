'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin';

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/admin/home" className="text-xl font-bold text-black hover:text-pink-600 transition-colors">
                    Painel Admin
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">                
                  <Link href="/admin/users" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Utilizadores
                  </Link>
                  <Link href="/admin/topicos" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Tópicos
                  </Link>
                  <Link href="/admin/calendario" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Calendário
                  </Link>
                  <Link href="/admin/noticias" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Notícias
                  </Link>
                  <Link href="/admin/info-gestacional" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Informações Gestacionais
                  </Link>
                  <Link href="/admin/categorias" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Categorias
                  </Link>
                  <Link href="/admin/tamanhos-bebe" className="border-transparent text-black hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Tamanhos do Bebê
                  </Link>
                  {/* <Link href="/admin/configuracoes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Configurações
                  </Link> */}
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={!isLoginPage ? "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" : ""}>
        {children}
      </main>
    </div>
  );
} 