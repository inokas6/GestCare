'use client';
import Footerbaby from "./componets/PaginaInicial/footer";
import Navbarbaby from "./componets/PaginaInicial/navbar";
import Circulos from "./componets/PaginaInicial/circulos";
import Not from "./componets/PaginaInicial/bannernews";
import Contagem from "./componets/PaginaInicial/contagem";

const BabyCarePage = () => {
  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbarbaby />
      <Not />
      <Circulos/>
      <Contagem/>
      <Footerbaby />
    </div> 
  );
};

export default BabyCarePage;
