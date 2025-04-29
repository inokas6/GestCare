import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const CalendarWidget = ({ selectedDate, setSelectedDate }) => {
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendario")
        .select("*")
        .order("inicio_data", { ascending: true });
      
      if (error) throw error;
      
      setEvents(data.map(event => ({
        id: event.id,
        date: new Date(event.inicio_data),
        title: event.titulo,
        type: event.tipo_evento,
        description: event.descricao
      })));
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };
  
  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };
  
  const days = getDaysInMonth(month, year);
  const currentDate = new Date();
  
  const changeMonth = (increment) => {
    let newMonth = month + increment;
    let newYear = year;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setMonth(newMonth);
    setYear(newYear);
  };
  
  const getMonthName = (month) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month];
  };
  
  const hasEvent = (day) => {
    if (!day) return false;
    return events.some(event => 
      event.date.getDate() === day.getDate() && 
      event.date.getMonth() === day.getMonth() && 
      event.date.getFullYear() === day.getFullYear()
    );
  };
  
  // Obter eventos para o dia selecionado
  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(event => 
      event.date.getDate() === day.getDate() && 
      event.date.getMonth() === day.getMonth() && 
      event.date.getFullYear() === day.getFullYear()
    );
  };
  
  const selectedDayEvents = getEventsForDay(selectedDate);
  
  const getEventColor = (type) => {
    const colors = {
      consulta: "bg-green-100 text-green-700",
      ovulacao: "bg-orange-100 text-orange-700",
      parto: "bg-red-100 text-red-700",
      importante: "bg-blue-100 text-blue-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-1 row-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Calendário</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-full hover:bg-purple-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span className="font-medium text-gray-700">{getMonthName(month)} {year}</span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-1 rounded-full hover:bg-purple-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-gray-500 text-xs font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`
                aspect-square flex flex-col items-center justify-center rounded-full
                text-sm relative
                ${!day ? 'text-gray-300' : ''}
                ${day && day.getDate() === currentDate.getDate() && day.getMonth() === currentDate.getMonth() && day.getFullYear() === currentDate.getFullYear() ? 'border-2 border-purple-400' : ''}
                ${day && selectedDate && day.getDate() === selectedDate.getDate() && day.getMonth() === selectedDate.getMonth() && day.getFullYear() === selectedDate.getFullYear() ? 'bg-purple-500 text-white' : day ? 'hover:bg-purple-100 cursor-pointer' : ''}
              `}
              onClick={() => day && setSelectedDate(day)}
            >
              {day && day.getDate()}
              {day && hasEvent(day) && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-pink-500"></span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Eventos</h4>
        {selectedDayEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedDayEvents.map((event, index) => (
              <div key={index} className={`p-2 rounded-lg text-sm ${getEventColor(event.type)}`}>
                {event.title}
                {event.description && (
                  <p className="text-xs mt-1 opacity-75">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Nenhum evento para {selectedDate?.getDate()}/{selectedDate?.getMonth() + 1}
          </div>
        )}
        
        <button className="mt-3 w-full py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition">
          Adicionar evento
        </button>
      </div>
    </div>
  );
};

export default CalendarWidget; 