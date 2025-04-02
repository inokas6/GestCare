import React from 'react';
import Image from "next/image";

const Circulos = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-8 my-12 px-4">
      {/* First Circle - Baby Hand */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-white rounded-full">
          <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-full">
            <img 
              src="/images/baby-hand.jpg" 
              alt="" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-yellow-200 rounded-b-full">
          </div>
        </div>
      </div>

      {/* Second Circle - Baby Standing */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-white rounded-full">
          <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-full">
            
          

          <Image src="/bebe1.jpg" alt="Menu" width={24} height={24} />
            
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-pink-300 rounded-b-full">
          </div>
        </div>
      </div>

      {/* Third Circle - Baby Sleeping */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-white rounded-full">
          <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-full">
            <img 
              src="/images/baby-sleeping.jpg" 
              alt="" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-yellow-200 rounded-b-full">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Circulos;