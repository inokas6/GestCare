'use client';

import React, { useState, useEffect } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Carrega o script do Botpress quando o componente é montado
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v2.5/inject.js';
    script1.async = true;
    
    script1.onload = () => {
      // Inicializa o Botpress após o script ser carregado
      window.botpressWebChat.init({
        host: 'https://cdn.botpress.cloud/webchat/v2.5',
        botId: '1ebad5ff-c1fa-4d9a-aed9-5d296ccedb6f',
        containerWidth: '100%',
        layoutWidth: '100%',
        showConversationsButton: false,
        enableTranscriptDownload: false,
        showPoweredBy: false,
        theme: {
          primaryColor: '#007bff',
          secondaryColor: '#f8f9fa',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        locale: 'pt',
        container: '#bp-widget-container'
      });
    };

    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2025/05/27/10/20250527102638-9QQAQ5KC.js';
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      // Remove os scripts quando o componente é desmontado
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Assistente Virtual para Grávidas
          </h2>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            Converse com nosso assistente virtual especializado em gestação
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Iniciar Conversa
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-11/12 h-5/6 bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-200 hover:bg-gray-50 z-10"
            >
              ×
            </button>
            <div id="bp-widget" className="w-full h-full">
              <div id="bp-widget-container" className="w-full h-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;