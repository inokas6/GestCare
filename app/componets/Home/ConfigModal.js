import { useRouter } from 'next/navigation';

const ConfigModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfigurarAgora = () => {
    router.push('/Menu/Mama/Calendario');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-pink-800">
            Configure a sua Gravidez
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            ✖️
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🤰</span>
          </div>
          
          <p className="text-gray-600">
            Para receber dicas personalizadas para cada semana da sua gravidez e saber o tamanho do seu bebê, 
            precisamos que você configure no calendário.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleConfigurarAgora}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
          >
            <span className="mr-2">📅</span>
            Configurar Agora
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            <span className="mr-2">⏰</span>
            Mais Tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal; 