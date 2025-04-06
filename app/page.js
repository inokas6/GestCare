'use client';
import Footerbaby from "./componets/PaginaInicial/footer";
import Navbarbaby from "./componets/PaginaInicial/navbar";
import Circulos from "./componets/PaginaInicial/circulos";
import Not from "./componets/PaginaInicial/bannernews";
import Contagem from "./componets/PaginaInicial/contagem";
import Chat from './componets/Forum/Chat';

const BabyCarePage = () => {
  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbarbaby /> 
      <Not />   
      <Circulos/>         
      <Contagem/>
      <Chat />
      <Footerbaby />
    </div> 
  );
};

export default BabyCarePage;
