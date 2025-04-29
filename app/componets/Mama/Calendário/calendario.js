"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    titulo: "",
    descricao: "",
    inicio_data: "",
    fim_data: "",
    tipo_evento: "importante",
    user_id: ""
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setNewEvent(prev => ({ ...prev, user_id: user.id }));
        await fetchEvents(user.id);
      }
      setIsLoading(false);
    };
    
    fetchCurrentUser();
  }, []);

  const fetchEvents = async (userId) => {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("Usuário não autenticado");
          return;
        }
        userId = user.id;
      }
      
      const { data, error } = await supabase
        .from("calendario")
        .select("*")
        .eq("user_id", userId)
        .order("inicio_data", { ascending: true });
        
      if (error) throw error;
      
      setEvents(
        data.map((event) => ({
          id: event.id,
          title: event.titulo,
          start: event.inicio_data,
          end: event.fim_data || event.inicio_data,
          description: event.descricao,
          backgroundColor: getEventColor(event.tipo_evento),
          borderColor: getEventColor(event.tipo_evento),
          textColor: "#ffffff",
          extendedProps: {
            tipo_evento: event.tipo_evento,
            rawData: event
          }
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  const getEventColor = (type) => {
    const colors = {
      consulta: "#9D4EDD", // Roxo mais vibrante
      ovulacao: "#FF5D8F", // Rosa mais vibrante
      parto: "#FF4D6D", // Vermelho mais vibrante
      importante: "#4361EE", // Azul mais vibrante
    };
    return colors[type] || "#6B7280"; // Cinza mais escuro para melhor contraste
  };

  const getEventIcon = (type) => {
    const icons = {
      consulta: "👩‍⚕️",
      ovulacao: "🌱",
      parto: "👶",
      importante: "⭐",
    };
    return icons[type] || "📝";
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setNewEvent(prev => ({
      ...prev,
      titulo: "",
      descricao: "",
      inicio_data: info.dateStr,
      fim_data: info.dateStr,
      tipo_evento: "importante"
    }));
    
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Usuário não autenticado");
        setIsLoading(false);
        return;
      }
      
      const eventData = {
        user_id: user.id,
        titulo: newEvent.titulo,
        descricao: newEvent.descricao,
        inicio_data: newEvent.inicio_data,
        fim_data: newEvent.fim_data || newEvent.inicio_data,
        tipo_evento: newEvent.tipo_evento
      };
      
      const { data, error } = await supabase
        .from("calendario")
        .insert([eventData]);
        
      if (error) throw error;
      
      setShowModal(false);
      await fetchEvents(user.id);
      
      // Notificação de sucesso
      showNotification("Evento criado com sucesso!");
      
      setNewEvent({
        titulo: "",
        descricao: "",
        inicio_data: "",
        fim_data: "",
        tipo_evento: "importante",
        user_id: user.id
      });
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      showNotification("Erro ao criar evento. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      description: info.event.extendedProps.rawData.descricao,
      tipo_evento: info.event.extendedProps.tipo_evento,
      rawData: info.event.extendedProps.rawData
    });
    setShowEventDetails(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("calendario")
        .delete()
        .eq("id", selectedEvent.id);
        
      if (error) throw error;
      
      await fetchEvents();
      setShowEventDetails(false);
      showNotification("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      showNotification("Erro ao excluir evento. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } transition-opacity duration-500 z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  const formatEventDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="p-4 md:p-6 relative bg-gradient-to-b from-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header com título e botão de adicionar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800 flex items-center">
            <span className="mr-2 text-pink-500 text-3xl">📅</span>
            <span className="bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              Calendário da Gravidez
            </span>
          </h2>
          <button
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
            onClick={() => {
              setSelectedDate(format(new Date(), "yyyy-MM-dd"));
              setNewEvent(prev => ({
                ...prev,
                inicio_data: format(new Date(), "yyyy-MM-dd"),
                fim_data: format(new Date(), "yyyy-MM-dd"),
              }));
              setShowModal(true);
            }}
            aria-label="Adicionar novo evento"
          >
            <span className="mr-2 text-lg">➕</span> 
            <span className="font-medium">Novo Evento</span>
          </button>
        </div>

        {/* Calendário principal */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-purple-100 transition-all duration-300 hover:shadow-2xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek",
                }}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                selectable={true}
                events={events}
                locale={ptBR}
                height="auto"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                }}
                buttonText={{
                  today: "Hoje",
                  month: "Mês",
                  week: "Semana",
                }}
                dayMaxEvents={3}
                eventClassNames="rounded-lg shadow-sm hover:shadow-md transition-shadow"
                eventContent={(eventInfo) => {
                  return (
                    <div className="px-2 py-1 flex items-center w-full overflow-hidden">
                      <span className="mr-1">{getEventIcon(eventInfo.event.extendedProps.tipo_evento)}</span>
                      <span className="font-medium truncate">{eventInfo.event.title}</span>
                    </div>
                  )
                }}
              />

              {/* Legenda de cores */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Consulta</span>
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-pink-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Ovulação</span>
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Parto</span>
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Importante</span>
                </div>
              </div>
              
              {/* Dica para o usuário */}
              <div className="mt-6 bg-purple-50 border border-purple-100 rounded-lg p-4 text-center text-sm text-purple-700">
                <p>✨ <span className="font-medium">Dica:</span> Clique em uma data para adicionar um novo evento ou em um evento existente para ver detalhes.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Novo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-purple-800">
                {selectedDate ? `Novo Evento: ${formatEventDate(selectedDate)}` : 'Novo Evento'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="Fechar"
              >
                ✖️
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="titulo">
                  Título
                </label>
                <input
                  id="titulo"
                  type="text"
                  name="titulo"
                  value={newEvent.titulo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Consulta pré-natal"
                  required
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="descricao">
                  Descrição (opcional)
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={newEvent.descricao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Adicione detalhes sobre o evento..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="inicio_data">
                    Data de Início
                  </label>
                  <input
                    id="inicio_data"
                    type="date"
                    name="inicio_data"
                    value={newEvent.inicio_data}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fim_data">
                    Data de Fim (opcional)
                  </label>
                  <input
                    id="fim_data"
                    type="date"
                    name="fim_data"
                    value={newEvent.fim_data}
                    onChange={handleInputChange}
                    min={newEvent.inicio_data}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="tipo_evento">
                  Tipo de Evento
                </label>
                <div className="relative">
                  <select
                    id="tipo_evento"
                    name="tipo_evento"
                    value={newEvent.tipo_evento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="consulta">👩‍⚕️ Consulta Médica</option>
                    <option value="ovulacao">🌱 Ovulação</option>
                    <option value="parto">👶 Parto</option>
                    <option value="importante">⭐ Evento Importante</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <span className="mr-2">💾</span>
                  )}
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEventDetails(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getEventIcon(selectedEvent.tipo_evento)}</span>
                <h3 className="text-xl font-bold text-purple-800 truncate">{selectedEvent.title}</h3>
              </div>
              <button 
                onClick={() => setShowEventDetails(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="Fechar"
              >
                ✖️
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="font-medium text-sm text-gray-500 mb-1">Data</p>
                <div className="text-purple-800">
                  {formatEventDate(selectedEvent.start)}
                  {selectedEvent.end && selectedEvent.start !== selectedEvent.end && (
                    <> até {formatEventDate(selectedEvent.end)}</>
                  )}
                </div>
              </div>
              
              {selectedEvent.description && (
                <div className="mb-4">
                  <p className="font-medium text-sm text-gray-500 mb-1">Descrição</p>
                  <p className="text-gray-700 whitespace-pre-line">{selectedEvent.description}</p>
                </div>
              )}
              
              <div>
                <p className="font-medium text-sm text-gray-500 mb-1">Tipo</p>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getEventColor(selectedEvent.tipo_evento) }}
                  ></div>
                  <p className="text-gray-700">
                    {selectedEvent.tipo_evento === 'consulta' && 'Consulta Médica'}
                    {selectedEvent.tipo_evento === 'ovulacao' && 'Ovulação'}
                    {selectedEvent.tipo_evento === 'parto' && 'Parto'}
                    {selectedEvent.tipo_evento === 'importante' && 'Evento Importante'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteEvent}
                className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Excluir"
                )}
              </button>
              <button
                onClick={() => setShowEventDetails(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}