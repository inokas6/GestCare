"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  const menuItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Usuários", path: "/admin/users" },
    { name: "Calendário", path: "/admin/calendario" },
    { name: "Fórum", path: "/admin/forum" },
    { name: "Tópicos", path: "/admin/topicos" },
    { name: "Categorias", path: "/admin/categorias" },
    { name: "Fotos", path: "/admin/fotos" },
    { name: "Comentários", path: "/admin/comentarios" },
    { name: "Respostas", path: "/admin/respostas" },
    { name: "Diários", path: "/admin/diarios" },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="text-2xl font-bold mb-8 border-b pb-4 border-gray-600">
          Painel Admin
        </div>
        <nav className="flex-1">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  href={item.path}
                  className={`block p-2 rounded ${
                    pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-600">
          <Link
            href="/"
            className="block p-2 text-gray-300 hover:text-white"
          >
            Voltar ao Site
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
} 