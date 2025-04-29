import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-nextjs';
import { saveMood, getMoodHistory, getTodayMood } from '../../../utils/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';

// Componente principal para rastreamento do humor
const MoodTracker = () => {
  // Obtém o utilizador atual através do hook useUser
  const user = useUser();
  // Estado para armazenar o humor atual do utilizador
  const [currentMood, setCurrentMood] = useState(null);
  // Estado para armazenar o histórico de humores
  const [moodHistory, setMoodHistory] = useState([]);

  // Array com as opções de humor disponíveis
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Feliz' },
    { id: 'excited', emoji: '🤩', label: 'Animada' },
    { id: 'neutral', emoji: '😐', label: 'Neutra' },
    { id: 'tired', emoji: '😴', label: 'Cansada' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
    { id: 'anxious', emoji: '😰', label: 'Ansiosa' },
  ];

  // Efeito que carrega os dados quando o utilizador é autenticado
  useEffect(() => {
    if (user) {
      loadTodayMood();
      loadMoodHistory();
    }
  }, [user]);

  // Função para carregar o humor do dia atual
  const loadTodayMood = async () => {
    try {
      const mood = await getTodayMood(user.id);
      setCurrentMood(mood);
    } catch (error) {
      console.error('Erro ao carregar o humor do dia:', error);
    }
  };

  // Função para carregar o histórico de humores
  const loadMoodHistory = async () => {
    try {
      const history = await getMoodHistory(user.id);
      // Formata as datas do histórico para o formato português
      const formattedHistory = history.map(entry => ({
        mood: entry.mood_type,
        date: format(new Date(entry.created_at), 'dd/MM', { locale: ptBR })
      }));
      setMoodHistory(formattedHistory);
    } catch (error) {
      console.error('Erro ao carregar o histórico:', error);
    }
  };

  // Função para guardar a seleção de humor do utilizador
  const handleMoodSelection = async (moodId) => {
    try {
      await saveMood(user.id, moodId);
      setCurrentMood(moodId);
      loadMoodHistory(); // Recarrega o histórico após guardar
    } catch (error) {
      console.error('Erro ao salvar o humor:', error);
    }
  };
  
  if (!user) {
    return <div className="text-center p-4">Por favor, faça login para registrar seu humor.</div>;
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho com título e subtítulo */}
      <View style={styles.header}>
        <Text style={styles.title}>Como te sentes hoje?</Text>
        <Text style={styles.subtitle}>Seleciona o teu humor</Text>
      </View>

      {/* Lista de opções de humor */}
      <View style={styles.moodOptions}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodOption,
              currentMood === mood.id && styles.selectedMood
            ]}
            onPress={() => handleMoodSelection(mood.id)}
          >
            <Text style={styles.moodText}>{mood.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gráfico de histórico de humor */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Histórico</Text>
        <View style={styles.historyChart}>
          {moodHistory.map((entry, index) => (
            <View key={index} style={styles.historyBar}>
              <View
                style={[
                  styles.bar,
                  { height: `${(entry.mood / 5) * 100}%` }
                ]}
              />
              <Text style={styles.dateText}>{entry.date}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Estilos para os componentes
const styles = StyleSheet.create({
  // Estilo do container principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  // Estilo do cabeçalho
  header: {
    marginBottom: 20,
  },
  // Estilo do título principal
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // Estilo do subtítulo
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  // Estilo do container de opções de humor
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  // Estilo de cada opção de humor
  moodOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilo da opção de humor selecionada
  selectedMood: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  // Estilo do texto do humor (emoji)
  moodText: {
    fontSize: 24,
  },
  // Estilo do container do histórico
  historyContainer: {
    marginTop: 20,
  },
  // Estilo do título do histórico
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // Estilo do gráfico de histórico
  historyChart: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  // Estilo de cada barra do histórico
  historyBar: {
    alignItems: 'center',
    width: 30,
  },
  // Estilo da barra individual
  bar: {
    width: 20,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  // Estilo do texto da data
  dateText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
});

export default MoodTracker; 