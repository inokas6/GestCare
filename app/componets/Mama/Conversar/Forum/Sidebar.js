"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const menuItems = [
        { id: 1, nome: 'Pagina inicial', path: '/Menu/Mama/Conversar' },
        { id: 2, nome: 'Categorias', path: '/Menu/Mama/Conversar/explore' },
        { id: 3, nome: 'Chat', path: '/Menu/Mama/Conversar/chat' },
        { id: 4, nome: 'Meus posts', path: '/Menu/Mama/Conversar/qna' },
    ];

    // Detectar tamanho da tela para determinar se é dispositivo móvel
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // Verificar na inicialização
        checkIfMobile();
        
        // Adicionar event listener para redimensionamento
        window.addEventListener('resize', checkIfMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Versão móvel - menu hambúrguer
    if (isMobile) {
        return (
            <>
                {/* Botão do menu hambúrguer - posicionado abaixo da navbar */}
                <button
                    className="fixed top-16 left-4 z-30 p-3 rounded-full bg-white shadow-lg mt-4 hover:bg-purple-50 transition-all duration-300"
                    onClick={toggleMenu}
                    aria-label="Menu de navegação"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        className="h-6 w-6 text-purple-600"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                        />
                    </svg>
                </button>

                {/* Menu lateral que aparece quando clicado */}
                <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={toggleMenu}
                    style={{ top: '64px' }} // Posiciona o overlay abaixo da navbar
                >
                    <div 
                        className={`fixed top-16 left-0 h-full w-64 bg-white shadow-xl rounded-tr-3xl rounded-br-3xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 pt-12"> {/* Espaço extra no topo para o botão hambúrguer */}
                            <nav className="space-y-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.path}
                                        className={`flex items-center px-5 py-4 rounded-xl text-base transition-all duration-200 ${
                                            pathname === item.path
                                                ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-purple-500'
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className={`mr-3 ${pathname === item.path ? 'text-purple-600' : 'text-gray-400'}`}>
                                            {pathname === item.path ? '|' : '|'}
                                        </span>
                                        {item.nome}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Versão desktop - sidebar fixa
    return (
        <div className="fixed left-0 top-16 h-full w-48 sm:w-64 bg-white border-r z-20 shadow-md rounded-tr-2xl">
            <div className="p-4 sm:p-6">
               
                <nav className="space-y-2 sm:space-y-3">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`flex items-center px-4 sm:px-5 py-3 rounded-xl text-sm sm:text-base transition-all duration-200 ${
                                pathname === item.path
                                    ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-purple-500'
                            }`}
                        >
                            <span className={`mr-3 ${pathname === item.path ? 'text-purple-600' : 'text-gray-400'}`}>
                                {pathname === item.path ? '|' : '|'}
                            </span>
                            {item.nome}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}