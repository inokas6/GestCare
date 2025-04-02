'use client';
import Navbar from "../../../componets/Home/navbar_home";
import Fotos from "../../../componets/Mama/MinhaBarriga/fotosbarriga";

const Home = () => {
  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbar />
      <div className="mt-40 bg-white"> 
        <Fotos />
      </div>
    </div> 
  );
};

export default Home;
