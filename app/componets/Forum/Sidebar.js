"use client";
import { useState, useEffect } from 'react';
import { forum } from '../../lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchCategorias() {
            try {
                const { data, error } = await forum.getCategorias();
                if (error) throw error;
                setCategorias(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCategorias();
    }, []);

    if (loading) return <div className="text-center py-4">Carregando...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Erro: {error}</div>;

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Categorias</h2>
                <nav className="space-y-2">
                    <Link
                        href="/Menu/Mama/Conversar"
                        className={`block px-4 py-2 rounded-lg ${
                            pathname === '/Menu/Mama/Conversar'
                                ? 'bg-purple-100 text-purple-600'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Todas as Categorias
                    </Link>
                    {categorias.map((categoria) => (
                        <Link
                            key={categoria.id}
                            href={`/Menu/Mama/Conversar/categoria/${categoria.id}`}
                            className={`block px-4 py-2 rounded-lg ${
                                pathname === `/Menu/Mama/Conversar/categoria/${categoria.id}`
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {categoria.nome}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
} 