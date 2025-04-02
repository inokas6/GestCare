'use client';
import { useState } from 'react';
import Navbar from "../componets/Home/navbar_home";
import NavButton from "../componets/Home/NavButton";
import PregnancySummary from "../componets/Home/PregnancySummary";
import CalendarWidget from "../componets/Home/CalendarWidget";
//import MoodTracker from "../componets/Home/MoodTracker";
import DailyTip from "../componets/Home/DailyTip";
import SymptomTracker from "../componets/Home/SymptomTracker";
import GrowthTracker from "../componets/Home/GrowthTracker";
import AppointmentsWidget from "../componets/Home/AppointmentsWidget";

const Home = () => {
  const [currentWeek, setCurrentWeek] = useState(24);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMood, setCurrentMood] = useState('happy');
  const [moodHistory, setMoodHistory] = useState([
    { date: '28/03', mood: 'happy' },
    { date: '29/03', mood: 'neutral' },
    { date: '30/03', mood: 'tired' },
    { date: '31/03', mood: 'happy' },
    { date: '01/04', mood: 'happy' },
  ]);

  return (
    <div className="bg-gradient-to-b from-purple-50 to-pink-50 min-h-screen pb-20">
      {/* Navbar personalizado */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 pt-20">
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