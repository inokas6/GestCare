import { useEffect, useState } from "react";

// Mapeamento de sintomas para emojis
const emojiMap = {
  Azia: "🔥",
  Fadiga: "😴",
  "Movimentos do bebé": "🤰",
  // Adicione outros sintomas e emojis conforme necessário
};

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    // Substitua a URL abaixo pela sua rota real da API
    fetch("/api/diario_sintomas/recentes")
      .then((res) => res.json())
      .then((data) => setSymptoms(data));
  }, []);

  // Função para formatar a data (exemplo simples)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
              <span className="text-xs text-gray-500 mr-2">{formatDate(symptom.created_at)}</span>
              <span className="mr-2 text-lg">{emojiMap[symptom.sintoma] || "❓"}</span>
              <span className="text-gray-700">{symptom.sintoma}</span>
            </div>
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