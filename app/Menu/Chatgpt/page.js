"use client";
import Navbar from "../../componets/Home/navbar_home";
import ChatGPT from "../../componets/Chatgpt/chat";

export default function Page() {
  return (
    
    <div >
      <Navbar />
      <div className="chat-container mt-16">
        <ChatGPT />
      </div>
    </div>
  );
}