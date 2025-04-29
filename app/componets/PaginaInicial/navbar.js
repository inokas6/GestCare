// Importação dos módulos necessários
import React from 'react';
import Link from 'next/link';

// Componente da barra de navegação
const navbar = () => {
  return (
    // Contentor principal da barra de navegação
    <div className="navbar bg-neutral">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li><a>Início</a></li>
            <li>
              <a>Serviços</a>
              <ul className="p-2 bg-neutral">
                <li><a>Calculadoras</a></li>
                <li><a>Fórum</a></li>
              </ul>
            </li>
            <li><a>Contactos</a></li>
          </ul>
        </div>
        <a className="btn btn-ghost text-xl">GestCare</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a>Início</a></li>
          <li><a>Serviços</a></li>
          <li><a>Contactos</a></li>
        </ul>
      </div>
      <div className="navbar-end space-x-1 flex">
      <Link href="/login" className="btn">Iniciar Sessão</Link>
      <Link href="/home" className="btn">Página Inicial</Link>
      </div>
    </div>);
};

// Exporta o componente
export default navbar;