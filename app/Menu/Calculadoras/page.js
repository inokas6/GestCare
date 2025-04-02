'use client';
import Calculadora from "../../componets/Calculadoras/menu/menucalc";
import Navbar from "../../componets/Home/navbar_home";

const Calculadoras = () => {
    return (
        <div className="bg-gray-200 min-h-screen flex flex-col gap-8">
            <Navbar />
            <Calculadora />
        </div>
    );
};
export default Calculadoras;
