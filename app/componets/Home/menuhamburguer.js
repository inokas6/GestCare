import React, { useState } from "react";
import Image from "next/image";
import Link from 'next/link';

const menuhamb = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
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
                            <details close="true">
                                <summary>Mamã</summary>
                                <ul>
                                    <li><Link href="/Menu/Mama/MinhaBarriga">Minha Barriga</Link></li>
                                    <li><Link href="/Menu/Mama/Conversar">Conversar</Link></li>
                                    <li><Link href="/Menu/Mama/Calendario">Calendario</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details close="true">
                                <summary>Papá</summary>
                                <ul>
                                    <li><a>Ajuda</a></li>
                                    <li><a>Videos</a></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details close="true">
                                <summary>Bebé</summary>
                                <ul>
                                    <li><a>Nomes</a></li>
                                    <li><a>Ultrasom</a></li>
                                    <li><a>Tamanhos</a></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <Link href="/Menu/Calculadoras/">Calculadoras</Link>
                        </li>
                        <li>
                            <a>Modelo 3D</a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default menuhamb;
