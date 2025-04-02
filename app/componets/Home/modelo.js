import React from 'react';

const Modelo = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
      <div className="sketchfab-embed-wrapper"> 
        <iframe 
          title="Fetus" 
          frameBorder="0" 
          allowFullScreen 
          mozAllowFullScreen="true" 
          webkitAllowFullScreen="true" 
          allow="autoplay; fullscreen; xr-spatial-tracking" 
          src="https://sketchfab.com/models/4b7712f7404c4b998778f17aba2d0782/embed">
        </iframe>
      </div>
    </div>
  );
};

export default Modelo;
