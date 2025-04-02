const SymptomTracker = () => {
  const symptoms = [
    { name: 'Azia', level: 'medium', date: 'Ontem', color: 'pink' },
    { name: 'Fadiga', level: 'high', date: 'Há 3 dias', color: 'yellow' },
    { name: 'Movimentos do bebê', level: 'positive', date: 'Hoje', color: 'green' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sintomas recentes</h3>
        <button className="text-purple-600 text-sm font-medium">Registrar</button>
      </div>
      
      <div className="space-y-3">
        {symptoms.map((symptom, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full bg-${symptom.color}-400 mr-2`}></span>
              <span className="text-gray-700">{symptom.name}</span>
            </div>
            <span className="text-xs text-gray-500">{symptom.date}</span>
          </div>
        ))}
      </div>
      
      <button className="mt-4 w-full py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition">
        Ver todos os sintomas
      </button>
    </div>
  );
};

export default SymptomTracker; 