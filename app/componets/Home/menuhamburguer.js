// Importação dos módulos necessários
"use client";
import Image from "next/image";
import Link from 'next/link';
import { useState } from 'react';

// Componente do menu hambúrguer
const MenuHamb = () => {
    // Estado para controlar a abertura/fecho do menu
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        // Contentor do menu
        <div className="relative">
            <button
                className="btn bg-neutral"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <Image src="/icons/menuhamburguer.png" alt="Menu" width={24} height={24} />
            </button>

            {menuOpen && (
                <div className="absolute top-full left-0 w-56 bg-neutral p-2 shadow-lg rounded-box z-50">
                    <ul className="menu bg-neutral rounded-box w-full">
                        <li>
                            <details>
                                <summary>Mamã</summary>
                                <ul>
                                    <li><Link href="/Menu/Mama/MinhaBarriga">Minha Barriga</Link></li>
                                    <li><Link href="/Menu/Mama/Conversar">Conversar</Link></li>
                                    <li><Link href="/Menu/Mama/Calendario">Calendario</Link></li>
                                    <li><Link href="/Menu/Mama/Diario">Diário</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details>
                                <summary>Papá</summary>
                                <ul>
                                    <li><Link href="/Menu/Papa/Ajuda">Ajuda</Link></li>
                                    <li><Link href="/Menu/Papa/Videos">Videos</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details>
                                <summary>Bebé</summary>
                                <ul>
                                    <li><Link href="/Menu/Bebe/PaginaBebe">Pagina bebe ???</Link></li>
                                    <li><Link href="/Menu/Bebe/Nomes">Nomes</Link></li>
                                    <li><Link href="/Menu/Bebe/Ultrasom">Ultrasom</Link></li>
                                    <li><Link href="/Menu/Bebe/Tamanhos">Tamanhos</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <Link href="/Menu/Calculadoras/">Calculadoras</Link>
                        </li>
                        <li>
                            <Link href="/Menu/Modelo3D">Modelo 3D</Link>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

// Exporta o componente do menu hambúrguer
export default MenuHamb;
