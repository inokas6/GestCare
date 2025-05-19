import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Menuhamburguer from "./menuhamburguer";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const notificationsRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Configurar um intervalo para buscar notificações a cada minuto
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("notificacoes")
                .select("*")
                .eq("user_id", user.id)
                .gte("data_criacao", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
                .order("data_criacao", { ascending: false })
                .limit(10);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.lida).length || 0);
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    const handleLogout = () => {
        router.push('/login');
    };

    const handleProfile = () => {
        router.push('/perfil');
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Marcar como lida
            if (!notification.lida) {
                const { error } = await supabase
                    .from("notificacoes")
                    .update({ lida: true })
                    .eq("id", notification.id);

                if (error) throw error;
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Fechar o dropdown de notificações
            setNotificationsOpen(false);

            // Redirecionar para o calendário
            router.push('/Mama/Calendario');
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    };

    const formatNotificationDate = (date) => {
        return format(new Date(date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    };

    return (
        <div className="navbar bg-neutral text-white fixed top-0 left-0 w-full z-40 p-4 flex items-center">
            <Menuhamburguer />

            <div className="flex-1 text-center">
                <a onClick={() => router.push('/home')} className="btn btn-ghost text-xl text-white cursor-pointer">GestCare</a>
            </div>

            <div className="relative" ref={notificationsRef}>
                <button 
                    className="btn btn-square btn-ghost mr-2 relative"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
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
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
                        </path>
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-neutral rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b border-neutral-focus">
                            <h3 className="text-sm font-medium text-white">Notificações</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-2 hover:bg-neutral-focus cursor-pointer ${
                                            !notification.lida ? 'bg-neutral-focus/50' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                <p className="text-sm text-white font-medium">
                                                    {notification.titulo}
                                                </p>
                                                <p className="text-xs text-gray-300 mt-1">
                                                    {notification.mensagem}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatNotificationDate(notification.data_criacao)}
                                                </p>
                                            </div>
                                            {!notification.lida && (
                                                <div className="ml-2">
                                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-center text-gray-400 text-sm">
                                    Nenhuma notificação
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

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
                        Perfil
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-neutral-focus transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                    </button>
                </div>
            )}
        </div>
    );
};

export default Navbar;
