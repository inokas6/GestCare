import React from 'react';

const Chatbot = () => {
  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <iframe
        src="https://poe.com/BotARQICASSP0" 
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        allow="microphone;"
        title="Assistente Virtual para Grávidas"
      />
    </div>
  );
};

export default Chatbot;
