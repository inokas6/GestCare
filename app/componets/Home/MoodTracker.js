import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-nextjs';
import { saveMood, getMoodHistory, getTodayMood } from '../../../utils/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MoodTracker = () => {
  const user = useUser();
  const [currentMood, setCurrentMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Feliz' },
    { id: 'excited', emoji: '🤩', label: 'Animada' },
    { id: 'neutral', emoji: '😐', label: 'Neutra' },
    { id: 'tired', emoji: '😴', label: 'Cansada' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
    { id: 'anxious', emoji: '😰', label: 'Ansiosa' },
  ];

  useEffect(() => {
    if (user) {
      loadTodayMood();
      loadMoodHistory();
    }
  }, [user]);

  const loadTodayMood = async () => {
    try {
      const mood = await getTodayMood(user.id);
      setCurrentMood(mood);
    } catch (error) {
      console.error('Erro ao carregar o humor do dia:', error);
    }
  };

  const loadMoodHistory = async () => {
    try {
      const history = await getMoodHistory(user.id);
      const formattedHistory = history.map(entry => ({
        mood: entry.mood_type,
        date: format(new Date(entry.created_at), 'dd/MM', { locale: ptBR })
      }));
      setMoodHistory(formattedHistory);
    } catch (error) {
      console.error('Erro ao carregar o histórico:', error);
    }
  };

  const handleMoodSelection = async (moodId) => {
    try {
      await saveMood(user.id, moodId);
      setCurrentMood(moodId);
      loadMoodHistory(); // Recarrega o histórico após salvar
    } catch (error) {
      console.error('Erro ao salvar o humor:', error);
    }
  };
  
  if (!user) {
    return <div className="text-center p-4">Por favor, faça login para registrar seu humor.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Como está seu humor hoje?</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`
              p-3 rounded-lg flex flex-col items-center
              ${currentMood === mood.id ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-50 hover:bg-gray-100'}
            `}
            onClick={() => handleMoodSelection(mood.id)}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className="text-xs">{mood.label}</span>
          </button>
        ))}
      </div>
      
      <h4 className="text-sm font-medium text-gray-700 mb-2">Histórico recente</h4>
      <div className="flex justify-between">
        {moodHistory.map((entry, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xl">
              {moods.find(m => m.id === entry.mood)?.emoji || '😐'}
            </span>
            <span className="text-xs text-gray-500 mt-1">{entry.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker; 