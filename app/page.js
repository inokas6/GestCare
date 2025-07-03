'use client';
import Footerbaby from "./componets/PaginaInicial/footer";
import Navbarbaby from "./componets/PaginaInicial/navbar";
import Not from "./componets/PaginaInicial/bannernews";
import TabelaNoticias from "./componets/PaginaInicial/tabelaNoticias";
import Chatbot from "./componets/ChatBot/chat";

const BabyCarePage = () => {
  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbarbaby />
      <Not />
      
      <TabelaNoticias />
      <Chatbot />
      {/*  */}
      <Footerbaby />
    </div> 
  );
};

export default BabyCarePage;
