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
      // Aguarda um pequeno intervalo para garantir que o objeto botpressWebChat esteja disponível
      setTimeout(() => {
        if (window.botpressWebChat) {
          window.botpressWebChat.init({
            host: 'https://cdn.botpress.cloud/webchat/v2.5',
            botId: '1ebad5ff-c1fa-4d9a-aed9-5d296ccedb6f',
            containerWidth: '100%',
            layoutWidth: '100%',
            showConversationsButton: false,
            enableTranscriptDownload: false,
            showPoweredBy: false,
            resetOnMount: true,
            disableSessionStorage: true,
            disableLocalStorage: true,
            clearMessagesOnReset: true,
            theme: {
              primaryColor: '#007bff',
              secondaryColor: '#f8f9fa',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            locale: 'pt',
            container: '#bp-widget-container'
          });

          // Força a limpeza do chat
          window.botpressWebChat.reset();
        }
      }, 1000);
    };

    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2025/05/27/10/20250527102638-9QQAQ5KC.js';
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      // Remove os scripts quando o componente é desmontado
      if (document.body.contains(script1)) {
        document.body.removeChild(script1);
      }
      if (document.body.contains(script2)) {
        document.body.removeChild(script2);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div id="bp-widget-container"></div>
      </div>
    </div>
  );
}

export default Chatbot; 