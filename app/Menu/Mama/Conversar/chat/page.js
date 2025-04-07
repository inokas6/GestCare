"use client";
import Sidebar from '../../../../componets/Mama/Conversar/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import Chat from '../../../../componets/Mama/Conversar/Forum/Chat';

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="mt-3">
                <Sidebar />
            </div>
            <div className="pl-0 sm:pl-48 lg:pl-64 pt-16">
                <Chat />
            </div>
        </div>
    );
}