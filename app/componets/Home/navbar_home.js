import React, { useState } from "react";
import Image from "next/image";
import Menuhamburguer from "./menuhamburguer";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        router.push('/login');
    };

    const handleProfile = () => {
        router.push('/perfil');
    };

    return (
        <div className="navbar bg-neutral fixed top-0 left-0 w-full z-40 p-4 flex items-center">
            
            <Menuhamburguer />

            <div className="flex-1 text-center">
                <a onClick={() => router.push('/home')} className="btn btn-ghost text-xl cursor-pointer">GestCare</a>
            </div>

            <div className="flex-none relative">
                <button 
                    className="btn btn-square btn-ghost"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
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
                
                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-neutral rounded-md shadow-lg py-1 z-50">
                        <button
                            onClick={handleProfile}
                            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-neutral-focus transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Ver Perfil
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-neutral-focus transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
