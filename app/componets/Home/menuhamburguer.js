// Importação dos módulos necessários
"use client";
import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Componente do menu hambúrguer
const MenuHamb = () => {
    // Estado para controlar a abertura/fecho do menu
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const pathname = usePathname();

    // Fecha o menu quando clica fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fecha o menu quando a rota muda
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        // Contentor do menu
        <div className="relative" ref={menuRef}>
            <button
                className="btn bg-neutral"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                aria-controls="menu-content"
            >
                <Image src="/icons/menuhamburguer.png" alt="Menu" width={24} height={24} />
            </button>

            <div 
                id="menu-content"
                className={`absolute top-full left-0 w-56 bg-neutral p-2 shadow-lg rounded-box z-50 transition-all duration-300 ease-in-out ${
                    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
            >
                <ul className="menu bg-neutral rounded-box w-full">
                    <li>
                        <details>
                            <summary>Mamã</summary>
                            <ul>
                                <li>
                                    <Link 
                                        href="/Menu/Mama/MinhaBarriga"
                                        className={pathname === '/Menu/Mama/MinhaBarriga' ? 'active' : ''}
                                    >
                                        Minha Barriga
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href="/Menu/Mama/Conversar"
                                        className={pathname === '/Menu/Mama/Conversar' ? 'active' : ''}
                                    >
                                        Conversar
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href="/Menu/Mama/Calendario"
                                        className={pathname === '/Menu/Mama/Calendario' ? 'active' : ''}
                                    >
                                        Calendário
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href="/Menu/Mama/Diario"
                                        className={pathname === '/Menu/Mama/Diario' ? 'active' : ''}
                                    >
                                        Diário
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>                   
                    <li>
                        <details>
                            <summary>Bebé</summary>
                            <ul>
                                <li>
                                    <Link 
                                        href="/Menu/Bebe/PaginaBebe"
                                        className={pathname === '/Menu/Bebe/PaginaBebe' ? 'active' : ''}
                                    >
                                        Página do Bebé
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href="/Menu/Bebe/Nomes"
                                        className={pathname === '/Menu/Bebe/Nomes' ? 'active' : ''}
                                    >
                                        Nomes
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href="/Menu/Bebe/Ultrasom"
                                        className={pathname === '/Menu/Bebe/Ultrasom' ? 'active' : ''}
                                    >
                                        Ultrassom
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href="/Menu/Bebe/Tamanhos"
                                        className={pathname === '/Menu/Bebe/Tamanhos' ? 'active' : ''}
                                    >
                                        Tamanhos
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <Link 
                            href="/Menu/Chatgpt"
                            className={pathname === '/Menu/Calculadoras' ? 'active' : ''}
                        >
                            teste chat
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/Menu/Calculadoras"
                            className={pathname === '/Menu/Calculadoras' ? 'active' : ''}
                        >
                            Calculadoras
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/Menu/Modelo3D"
                            className={pathname === '/Menu/Modelo3D' ? 'active' : ''}
                        >
                            Modelo 3D
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

// Exporta o componente do menu hambúrguer
export default MenuHamb;
