'use client';
import Navbar from "../../../componets/Home/navbar_home";
import Fotos from "../../../componets/Mama/MinhaBarriga/fotosbarriga";

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-pink-50 min-h-screen">
      <Navbar />
      <div className="mt-20"> 
        <Fotos />
      </div>
    </div> 
  );
};

export default Home;
