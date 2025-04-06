"use client";
import Sidebar from '../../../../componets/Forum/Sidebar';
import Navbar from '../../../../componets/Home/navbar_home';
import Chat from '../../../../componets/Forum/Chat';

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <div className="pl-64 pt-16">
                <Chat />
            </div>
        </div>
    );
}