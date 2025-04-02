import React, { useState } from "react";
import Image from "next/image";
import Menuhamburguer from "./menuhamburguer";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="navbar bg-neutral fixed top-0 left-0 w-full z-40 p-4 flex items-center">
            
            <Menuhamburguer />

            {/* Título */}
            <div className="flex-1 text-center">
                <a className="btn btn-ghost text-xl">GestCare</a>
            </div>

            {/* Ícone à direita */}
            <div className="flex-none">
                <button className="btn btn-square btn-ghost">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block h-5 w-5 stroke-current">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z">
                        </path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Navbar;
