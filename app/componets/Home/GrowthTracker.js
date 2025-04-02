const GrowthTracker = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Meu crescimento</h3>
        <button className="text-purple-600 text-sm font-medium">Atualizar</button>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Peso</span>
            <span className="font-medium text-gray-800">68.5 kg <span className="text-green-500">+0.7</span></span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pink-400 h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Barriga</span>
            <span className="font-medium text-gray-800">92 cm <span className="text-green-500">+2</span></span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-400 h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
        
        <button className="mt-2 w-full py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition">
          Ver histórico
        </button>
      </div>
    </div>
  );
};

export default GrowthTracker; 