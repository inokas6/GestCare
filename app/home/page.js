'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { differenceInWeeks, addWeeks } from "date-fns";
import Navbar from "../componets/Home/navbar_home";
import NavButton from "../componets/Home/NavButton";
import PregnancySummary from "../componets/Home/PregnancySummary";
import CalendarWidget from "../componets/Home/CalendarWidget";
//import MoodTracker from "../componets/Home/MoodTracker";
import DailyTip from "../componets/Home/DailyTip";
import SymptomTracker from "../componets/Home/SymptomTracker";
import GrowthTracker from "../componets/Home/Nomes";
import AppointmentsWidget from "../componets/Home/AppointmentsWidget";

const Home = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMood, setCurrentMood] = useState('happy');
  const [moodHistory, setMoodHistory] = useState([
    { date: '28/03', mood: 'happy' },
    { date: '29/03', mood: 'neutral' },
    { date: '30/03', mood: 'tired' },
    { date: '31/03', mood: 'happy' },
    { date: '01/04', mood: 'happy' },
  ]);
  const supabase = createClientComponentClient();

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
            theme: {
              primaryColor: '#007bff',
              secondaryColor: '#f8f9fa',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            locale: 'pt',
            container: '#bp-widget-container'
          });
        }
      }, 1000);
    };

    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2025/05/27/10/20250527102638-9QQAQ5KC.js';
    script2.async = true;
    document.body.appendChild(script2);

    const fetchPregnancyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("gravidez_info")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (error) {
          console.error("Erro ao buscar dados da gravidez:", error);
          return;
        }
        
        if (!data) return;
        
        const dataInicio = new Date(data.data_ultima_menstruacao || data.data_inicio);
        const hoje = new Date();
        
        // Calcular semana atual (considerando que a gravidez começa 2 semanas após a última menstruação)
        const semanasDesdeInicio = differenceInWeeks(hoje, dataInicio) + 2;
        setCurrentWeek(semanasDesdeInicio);
        
      } catch (error) {
        console.error("Erro ao buscar dados da gravidez:", error);
      }
    };

    fetchPregnancyData();

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
    <div className="bg-gradient-to-b from-purple-50 to-pink-50 min-h-screen pb-20">
      {/* Navbar personalizado */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 mt-[70px]">
        {/* Resumo da gravidez com progresso e modelo 3D */}
        <PregnancySummary week={currentWeek} />
        
        {/* Dashboard principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Calendário personalizado */}
          <CalendarWidget 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
          />
          
          {/* Widget de humor 
          <MoodTracker 
            currentMood={currentMood} 
            setCurrentMood={setCurrentMood}
            moodHistory={moodHistory}
          />*/}
          
          {/* Dica do dia */}
          <DailyTip />
          
          {/* Sintomas recentes */}
          <SymptomTracker />
          
          {/* Medidas */}
          <GrowthTracker />
          
          {/* Consultas */}
          <AppointmentsWidget />
        </div>
      </div>
    </div>
  );
};

export default Home;