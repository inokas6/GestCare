import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Mapeamento de sintomas para emojis
const emojiMap = {
  Azia: "🔥",
  Fadiga: "😴",
  "Movimentos do bebé": "🤰",
  // Adicione outros sintomas e emojis conforme necessário
};

// Opções de humor para exibir emojis e rótulos
const moodOptions = [
  { value: 'feliz', emoji: '😊', label: 'Feliz' },
  { value: 'cansada', emoji: '😴', label: 'Cansada' },
  { value: 'enjoada', emoji: '🤢', label: 'Enjoada' },
  { value: 'ansiosa', emoji: '😰', label: 'Ansiosa' },
  { value: 'energética', emoji: '⚡', label: 'Energética' },
  { value: 'emotiva', emoji: '😢', label: 'Emotiva' }
];

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSymptoms();
    fetchMoodEntries();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;

      const { data, error } = await supabase
        .from('diario_sintomas')
        .select('*')
        .eq('entrada_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSymptoms(data || []);
    } catch (error) {
      console.error("Erro ao buscar sintomas:", error);
    }
  };

  const fetchMoodEntries = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;

      const { data, error } = await supabase
        .from('diario_entradas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(5);

      if (error) throw error;
      setMoodEntries(data || []);
    } catch (error) {
      console.error("Erro ao buscar entradas de humor:", error);
    }
  };

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
        <h3 className="text-lg font-semibold text-gray-800">Sintomas e Humor recentes</h3>
        
      </div>
      <div className="space-y-3">
        {symptoms.length === 0 && moodEntries.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Nenhuma entrada no diário ainda.</p>
            
          </div>
        ) : (
          <>
            {symptoms.map((symptom, index) => (
              <div key={`symptom-${index}`} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">{formatDate(symptom.created_at)}</span>
                  <span className="mr-2 text-lg">{emojiMap[symptom.sintoma] || "❓"}</span>
                  <span className="text-gray-700">{symptom.sintoma}</span>
                </div>
              </div>
            ))}
            {moodEntries.map((entry, index) => {
              const moodOption = moodOptions.find(m => m.value === entry.humor);
              return (
                <div key={`mood-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">{formatDate(entry.data)}</span>
                    <span className="mr-2 text-lg">{moodOption?.emoji || "❓"}</span>
                    <span className="text-gray-700">{moodOption?.label || entry.humor}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default SymptomTracker; 