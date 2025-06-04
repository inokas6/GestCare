"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, parseISO, addWeeks, differenceInWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";


export default function CalendarioGravidez() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [infoSemanal, setInfoSemanal] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showPregnancyForm, setShowPregnancyForm] = useState(false);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [pregnancyData, setPregnancyData] = useState({
    dataInicio: null,
    semanaAtual: 0,
    diasNaSemana: 0,
    progresso: 0,
  });
  
  const [newEvent, setNewEvent] = useState({
    titulo: "",
    descricao: "",
    inicio_data: "",
    fim_data: "",
    tipo_evento: "consulta",
    lembrete: false,
    lembrete_antecedencia: 1,
    user_id: ""
  });
  
  const supabase = createClientComponentClient();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const fetchCurrentUserAndData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setNewEvent(prev => ({ ...prev, user_id: user.id }));
        await fetchEvents(user.id);
        await fetchPregnancyData(user.id);
      }
      setIsLoading(false);
    };
    
    fetchCurrentUserAndData();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchPregnancyData = async (userId) => {
    try {
      if (!userId) {
        throw new Error("ID do usuário não fornecido");
      }

      // Buscar dados da gravidez ou planejamento do usuário
      const { data, error } = await supabase
        .from("gravidez_info")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("Nenhum dado de gravidez encontrado para o usuário");
          return;
        }
        throw error;
      }
      
      if (!data) {
        console.log("Nenhum dado de gravidez encontrado");
        return;
      }

      // Se for planejamento, não calcular semanas de gravidez, mas sim ovulação
      if (data.tipo === 'planejamento') {
        // Calcular próximas ovulações
        const ciclo = data.ciclo_menstrual || 28;
        const dataUltimaMenstruacao = new Date(data.data_ultima_menstruacao);
        const hoje = new Date();
        let proximaOvulacao = new Date(dataUltimaMenstruacao);
        while (proximaOvulacao < hoje) {
          proximaOvulacao.setDate(proximaOvulacao.getDate() + ciclo);
        }
        // Período fértil: 2 dias antes e 2 dias depois da ovulação
        const inicioFertil = new Date(proximaOvulacao);
        inicioFertil.setDate(proximaOvulacao.getDate() - 2);
        const fimFertil = new Date(proximaOvulacao);
        fimFertil.setDate(proximaOvulacao.getDate() + 2);

        setPregnancyData({
          dataInicio: data.data_ultima_menstruacao,
          semanaAtual: 0,
          diasNaSemana: 0,
          progresso: 0,
          tipo: 'planejamento',
          ciclo_menstrual: ciclo,
          proximaOvulacao: proximaOvulacao,
          inicioFertil: inicioFertil,
          fimFertil: fimFertil
        });
        return;
      }
      // Caso seja gravidez
      const dataInicio = new Date(data.data_ultima_menstruacao || data.data_inicio);
      const hoje = new Date();
      const semanasDesdeInicio = differenceInWeeks(hoje, dataInicio) + 2;
      const diasNaSemana = Math.floor((hoje - addWeeks(dataInicio, semanasDesdeInicio - 2)) / (1000 * 60 * 60 * 24));
      const progresso = Math.min(Math.round((semanasDesdeInicio / 40) * 100), 100);
      setPregnancyData({
        dataInicio,
        semanaAtual: semanasDesdeInicio,
        diasNaSemana,
        progresso,
        dataProvavel: data.data_provavel_parto,
        tipo: 'gravida',
        ciclo_menstrual: data.ciclo_menstrual || 28
      });
      await fetchInfoSemanal(semanasDesdeInicio);
    } catch (error) {
      console.error("Erro ao buscar dados da gravidez:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }
  };
  
  const fetchInfoSemanal = async (semana) => {
    try {
      const { data, error } = await supabase
        .from("info_gestacional")
        .select("*")
        .eq("semana", semana)
        .single();
        
      if (error) throw error;
      
      setInfoSemanal(data);
    } catch (error) {
      console.error("Erro ao buscar informações semanais:", error);
      // Se não encontrar info para semana específica, buscar conteúdo genérico
      setInfoSemanal({
        semana: semana,
        desenvolvimento_bebe: "O bebé continua se desenvolvendo nesta semana.",
        sintomas_comuns: "Cada gravidez é única. Consulte seu médico para mais informações.",
        dicas_mae: "Mantenha uma alimentação saudável e descanse o suficiente.",
        cuidados_especiais: "Faça os exames recomendados pelo seu médico."
      });
    }
  };

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
        .gte("inicio_data", new Date().toISOString().split('T')[0])
        .order("inicio_data", { ascending: true });
        
      if (error) throw error;
      
      // Transformar os eventos do banco em eventos para o calendário
      const calendarEvents = data.map((event) => ({
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
          lembrete: event.lembrete,
          lembrete_antecedencia: event.lembrete_antecedencia,
          rawData: event
        }
      }));
      
      // Adicionar eventos semanais da gravidez se temos os dados
      if (pregnancyData.dataInicio) {
        if (pregnancyData.tipo === 'planejamento') {
          // Adicionar eventos do período fértil para os próximos 6 ciclos
          const dataUltimaMenstruacao = new Date(pregnancyData.dataInicio);
          const ciclo = pregnancyData.ciclo_menstrual || 28;
          
          for (let i = 0; i < 6; i++) {
            const dataOvulacao = new Date(dataUltimaMenstruacao);
            dataOvulacao.setDate(dataOvulacao.getDate() + (ciclo * i) + 14); // 14 dias após a menstruação
            
            // Período fértil: 2 dias antes e 2 dias depois da ovulação
            const inicioFertil = new Date(dataOvulacao);
            inicioFertil.setDate(dataOvulacao.getDate() - 2);
            const fimFertil = new Date(dataOvulacao);
            fimFertil.setDate(dataOvulacao.getDate() + 2);
            
            calendarEvents.push({
              id: `periodo-fertil-${i}`,
              title: `Período Fértil - Ciclo ${i + 1}`,
              start: inicioFertil.toISOString().split('T')[0],
              end: fimFertil.toISOString().split('T')[0],
              backgroundColor: "rgba(255, 93, 143, 0.2)",
              borderColor: "#FF5D8F",
              textColor: "#FF5D8F",
              display: "background",
              extendedProps: {
                tipo_evento: "ovulacao",
                ciclo: i + 1
              }
            });
            
            // Adicionar o dia da ovulação como um evento específico
            calendarEvents.push({
              id: `ovulacao-${i}`,
              title: `Ovulação - Ciclo ${i + 1}`,
              start: dataOvulacao.toISOString().split('T')[0],
              backgroundColor: "#FF5D8F",
              borderColor: "#FF5D8F",
              textColor: "#ffffff",
              extendedProps: {
                tipo_evento: "ovulacao",
                ciclo: i + 1
              }
            });
          }
        } else {
          // Adicionar eventos semanais da gravidez
          const semanasGravidez = [];
          for (let i = 1; i <= 40; i++) {
            const dataInicio = addWeeks(pregnancyData.dataInicio, i - 2);
            semanasGravidez.push({
              id: `semana-${i}`,
              title: `Semana ${i}`,
              start: dataInicio,
              end: addWeeks(dataInicio, 1),
              backgroundColor: "rgba(147, 51, 234, 0.2)",
              borderColor: "rgba(147, 51, 234, 0.5)",
              textColor: "#6B21A8",
              classNames: ["evento-semana-gravidez"],
              display: "background",
              extendedProps: {
                tipo_evento: "semana_gravidez",
                semana: i
              }
            });
          }
          
          // Adicionar data provável do parto
          if (pregnancyData.dataProvavel) {
            semanasGravidez.push({
              id: "data-parto",
              title: "Data Provável do Parto",
              start: pregnancyData.dataProvavel,
              backgroundColor: "#EF4444",
              borderColor: "#EF4444",
              textColor: "#ffffff",
              extendedProps: {
                tipo_evento: "parto"
              }
            });
          }
          
          calendarEvents.push(...semanasGravidez);
        }
      }
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  const getEventColor = (type) => {
    const colors = {
      consulta: "#9D4EDD", // Roxo mais vibrante
      exame: "#0EA5E9", // Azul claro
      ovulacao: "#FF5D8F", // Rosa mais vibrante
      parto: "#EF4444", // Vermelho mais vibrante
      importante: "#4F46E5", // Índigo
      marco: "#16A34A", // Verde
      lembrete: "#F59E0B", // Âmbar
    };
    return colors[type] || "#6B7280"; // Cinza mais escuro para melhor contraste
  };

  const getEventIcon = (type) => {
    const icons = {
      consulta: "👩‍⚕️",
      exame: "🔬",
      ovulacao: "🌱",
      parto: "👶",
      importante: "⭐",
      marco: "🏆",
      lembrete: "🔔",
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
      tipo_evento: "consulta",
      lembrete: false,
      lembrete_antecedencia: 1
    }));
    
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setPendingAction({
      type: 'save',
      message: 'Deseja salvar este evento?',
      callback: async () => {
        try {
          setIsLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error("Usuário não autenticado");
          }
          
          const eventData = {
            user_id: user.id,
            titulo: newEvent.titulo,
            descricao: newEvent.descricao,
            inicio_data: newEvent.inicio_data,
            fim_data: newEvent.fim_data || newEvent.inicio_data,
            tipo_evento: newEvent.tipo_evento,
            lembrete: newEvent.lembrete,
            lembrete_antecedencia: newEvent.lembrete ? newEvent.lembrete_antecedencia : null
          };
          
          const { data, error } = await supabase
            .from("calendario")
            .insert([eventData]);
            
          if (error) throw error;
          
          setShowModal(false);
          await fetchEvents(user.id);
          
          setMessage({ text: 'Evento criado com sucesso!', type: 'success' });
          
          setNewEvent({
            titulo: "",
            descricao: "",
            inicio_data: "",
            fim_data: "",
            tipo_evento: "consulta",
            lembrete: false,
            lembrete_antecedencia: 1,
            user_id: user.id
          });
        } catch (error) {
          console.error("Erro ao adicionar evento:", error);
          setMessage({ text: 'Erro ao criar evento: ' + error.message, type: 'error' });
        } finally {
          setIsLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleEventClick = (info) => {
    const eventType = info.event.extendedProps.tipo_evento;
    
    if (eventType === "semana_gravidez") {
      // Se clicou numa semana da gravidez, mostrar informações da semana
      fetchInfoSemanal(info.event.extendedProps.semana);
      setShowInfo(true);
      return;
    }
    
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      description: info.event.extendedProps.rawData.descricao,
      tipo_evento: info.event.extendedProps.tipo_evento,
      lembrete: info.event.extendedProps.lembrete,
      lembrete_antecedencia: info.event.extendedProps.lembrete_antecedencia,
      rawData: info.event.extendedProps.rawData
    });
    setShowEventDetails(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;
    
    setPendingAction({
      type: 'delete',
      message: 'Tem certeza que deseja eliminar este evento? Esta ação não poderá ser revertida!',
      callback: async () => {
        try {
          setIsLoading(true);
          const { error } = await supabase
            .from("calendario")
            .delete()
            .eq("id", selectedEvent.id);
            
          if (error) throw error;
          
          await fetchEvents();
          setShowEventDetails(false);
          setMessage({ text: 'Evento eliminado com sucesso!', type: 'success' });
        } catch (error) {
          console.error("Erro ao eliminar evento:", error);
          setMessage({ text: 'Erro ao eliminar evento: ' + error.message, type: 'error' });
        } finally {
          setIsLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const formatEventDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="bg-pink-50 min-h-screen pt-20">
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-200' : 'bg-red-200'
        } text-black`}>
          {message.text}
        </div>
      )}

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-black">Confirmar ação</h3>
            <p className="mb-6 text-black">{pendingAction?.message || 'Tem certeza que deseja realizar esta ação?'}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-black"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (pendingAction?.callback) {
                    pendingAction.callback();
                  }
                  setShowConfirmDialog(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de progresso da gravidez */}
      {pregnancyData.tipo === 'gravida' && pregnancyData.semanaAtual > 0 && (
        <div className="bg-white shadow-md p-4 mb-6 rounded-lg mx-4 md:mx-6 mt-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-pink-800 mb-2 md:mb-0">
                {pregnancyData.semanaAtual <= 40 ? (
                  <>
                    Você está na <span className="font-bold text-pink-600">{pregnancyData.semanaAtual}ª semana</span> de 40 
                    {pregnancyData.diasNaSemana > 0 && (
                      <span className="text-sm text-pink-600"> (+ {pregnancyData.diasNaSemana} {pregnancyData.diasNaSemana === 1 ? 'dia' : 'dias'})</span>
                    )}
                  </>
                ) : (
                  <span className="font-bold text-pink-600">Seu bebé já deve ter nascido! 👶</span>
                )}
              </h3>
              
              <button
                onClick={() => {
                  fetchInfoSemanal(pregnancyData.semanaAtual);
                  setShowInfo(true);
                }}
                className="text-sm bg-pink-100 hover:bg-pink-200 text-pink-800 px-4 py-2 rounded-full transition-colors"
              >
                Ver informações desta semana
              </button>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-pink-700 transition-all duration-700 ease-in-out" 
                style={{ width: `${pregnancyData.progresso}%` }}
              ></div>
            </div>
            
            {/* Marcos importantes */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <div>Início</div>
              <div>1º Trimestre</div>
              <div>2º Trimestre</div>
              <div>3º Trimestre</div>
              <div>40ª Semana</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Exibir período fértil se for planejamento */}
      {pregnancyData.tipo === 'planejamento' && pregnancyData.inicioFertil && (
        <div className="bg-white shadow-md p-4 mb-6 rounded-lg mx-4 md:mx-6 mt-4">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-lg font-semibold text-pink-800 mb-2">Seu próximo período fértil:</h3>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <span className="text-pink-600 font-bold">
                {format(new Date(pregnancyData.inicioFertil), "dd 'de' MMMM", { locale: ptBR })} até {format(new Date(pregnancyData.fimFertil), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <span className="text-sm text-gray-500">(Baseado em ciclo de {pregnancyData.ciclo_menstrual} dias)</span>
            </div>
            <div className="mt-2 text-pink-700">Dica: Aproveite esse período para tentar engravidar! O ideal é manter relações um dia antes e no dia da ovulação.</div>
          </div>
        </div>
      )}
      
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header com título e botão de adicionar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-pink-800 flex items-center">
              <span className="mr-2 text-pink-500 text-3xl">📅</span>
              <span className="text-pink-700">
                Calendário da Gravidez
              </span>
            </h2>
            <button
              className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
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
              <span className="mr-2 text-lg">+</span> 
              <span className="font-medium">Novo Evento</span>
            </button>
          </div>

          {/* Calendário principal */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-pink-100 transition-all duration-300 hover:shadow-2xl">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth",
                  }}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  selectable={true}
                  events={events}
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
                  views={{
                    dayGridMonth: {
                      dayMaxEventRows: 3,
                    },
                    timeGridWeek: {
                      slotDuration: '01:00:00',
                      slotLabelFormat: {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }
                    }
                  }}
                  eventContent={(eventInfo) => {
                    if (eventInfo.event.display === 'background') {
                      return (
                        <div className="text-xs md:text-sm font-bold pl-1 pt-0.5 text-pink-700">
                          {eventInfo.event.title}
                        </div>
                      );
                    }
                    
                    return (
                      <div className="px-2 py-1 flex items-center w-full overflow-hidden text-black">
                        <span className="mr-1">{getEventIcon(eventInfo.event.extendedProps.tipo_evento)}</span>
                        <span className="font-medium truncate">{eventInfo.event.title}</span>
                        {eventInfo.event.extendedProps.lembrete && (
                          <span className="ml-1">🔔</span>
                        )}
                      </div>
                    );
                  }}
                />

                {/* Legenda de cores */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Consulta</span>
                  </div>
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Exame</span>
                  </div>
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Ovulação</span>
                  </div>
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Parto</span>
                  </div>
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Conquista</span>
                  </div>
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Lembrete</span>
                  </div>
                  <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-xs text-gray-700">Importante</span>
                  </div>
                </div>
                
                {/* Dica para o usuário */}
                <div className="mt-6 bg-pink-50 border border-pink-100 rounded-lg p-4 text-center text-sm text-pink-700">
                  <p>✨ <span className="font-medium">Dica:</span> Clique em uma data para adicionar um novo evento, em um evento existente para ver detalhes, ou em uma semana destacada para ver informações sobre o desenvolvimento do bebé.</p>
                </div>
              </>
            )}
          </div>
          
          {/* Próximos eventos */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-pink-100">
            <h3 className="text-lg font-bold text-black mb-4">Próximos Eventos</h3>
            
            {events.filter(e => 
              new Date(e.start) >= new Date(new Date().setHours(0, 0, 0, 0)) && 
              e.extendedProps && 
              e.extendedProps.tipo_evento !== "semana_gravidez"
            ).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {events
                  .filter(e => 
                    new Date(e.start) >= new Date(new Date().setHours(0, 0, 0, 0)) && 
                    e.extendedProps && 
                    e.extendedProps.tipo_evento !== "semana_gravidez"
                  )
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .slice(0, 5)
                  .map(event => (
                    <div 
                      key={event.id} 
                      className="flex items-center p-3 rounded-lg bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-colors cursor-pointer text-black"
                      onClick={() => {
                        setSelectedEvent({
                          id: event.id,
                          title: event.title,
                          start: event.start,
                          end: event.end,
                          description: event.extendedProps.rawData?.descricao || "",
                          tipo_evento: event.extendedProps.tipo_evento,
                          lembrete: event.extendedProps.lembrete,
                          lembrete_antecedencia: event.extendedProps.lembrete_antecedencia,
                          rawData: event.extendedProps.rawData
                        });
                        setShowEventDetails(true);
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm mr-3 text-black"
                        style={{ backgroundColor: event.backgroundColor }}
                      >
                        {getEventIcon(event.extendedProps.tipo_evento)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{event.title}</div>
                        <div className="text-xs text-black">{formatEventDate(event.start)}</div>
                      </div>
                      {event.extendedProps.lembrete && (
                        <div className="text-lg text-black">🔔</div>
                      )}
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nenhum evento próximo. Clique em uma data no calendário para adicionar.
              </div>
            )}
          </div>
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
              <h3 className="text-xl font-bold text-pink-800">
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
                  className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
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
                  className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                  placeholder="Adicione detalhes sobre o eventocarregando"
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
                    className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
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
                    className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="tipo_evento">
                  Tipo de Evento
                </label>
                <div className="relative">
                  <select
                    id="tipo_evento"
                    name="tipo_evento"
                    value={newEvent.tipo_evento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none text-black"
                  >
                    <option value="consulta">👩‍⚕️ Consulta Médica</option>
                    <option value="exame">🔬 Exame</option>
                    <option value="marco">🏆 Conquista</option>
                    <option value="ovulacao">🌱 Ovulação</option>
                    <option value="parto">👶 Parto</option>
                    <option value="lembrete">🔔 Lembrete</option>
                    <option value="importante">⭐ Evento Importante</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="lembrete"
                    type="checkbox"
                    name="lembrete"
                    checked={newEvent.lembrete}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="lembrete" className="ml-2 block text-sm text-gray-700">
                    Definir lembrete para este evento
                  </label>
                </div>
                
                {newEvent.lembrete && (
                  <div className="mt-3 pl-6">
                    <label className="block text-gray-700 text-sm mb-2" htmlFor="lembrete_antecedencia">
                      Antecipar lembrete em:
                    </label>
                    <select
                      id="lembrete_antecedencia"
                      name="lembrete_antecedencia"
                      value={newEvent.lembrete_antecedencia}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none text-black"
                    >
                      <option value="0">No dia</option>
                      <option value="1">1 dia antes</option>
                      <option value="2">2 dias antes</option>
                      <option value="3">3 dias antes</option>
                      <option value="7">1 semana antes</option>
                    </select>
                  </div>
                )}
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
                  className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <span className="mr-2">💾</span>
                  )}
                  Guardar Evento
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
                <h3 className="text-xl font-bold text-pink-800 truncate">{selectedEvent.title}</h3>
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
              <div className="bg-pink-50 rounded-lg p-4 mb-4">
                <p className="font-medium text-sm text-gray-500 mb-1">Data</p>
                <div className="text-pink-800">
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
              
              <div className="mb-4">
                <p className="font-medium text-sm text-gray-500 mb-1">Tipo</p>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getEventColor(selectedEvent.tipo_evento) }}
                  ></div>
                  <p className="text-gray-700">
                    {selectedEvent.tipo_evento === 'consulta' && 'Consulta Médica'}
                    {selectedEvent.tipo_evento === 'exame' && 'Exame'}
                    {selectedEvent.tipo_evento === 'ovulacao' && 'Ovulação'}
                    {selectedEvent.tipo_evento === 'parto' && 'Parto'}
                    {selectedEvent.tipo_evento === 'marco' && 'Conquista'}
                    {selectedEvent.tipo_evento === 'lembrete' && 'Lembrete'}
                    {selectedEvent.tipo_evento === 'importante' && 'Evento Importante'}
                  </p>
                </div>
              </div>
              
              {selectedEvent.lembrete && (
                <div className="bg-amber-50 rounded-lg p-3 flex items-center">
                  <span className="text-amber-500 text-xl mr-2">🔔</span>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Lembrete definido</p>
                    <p className="text-xs text-amber-700">
                      {selectedEvent.lembrete_antecedencia === 0 && 'No dia do evento'}
                      {selectedEvent.lembrete_antecedencia === 1 && '1 dia antes'}
                      {selectedEvent.lembrete_antecedencia === 2 && '2 dias antes'}
                      {selectedEvent.lembrete_antecedencia === 3 && '3 dias antes'}
                      {selectedEvent.lembrete_antecedencia === 7 && '1 semana antes'}
                    </p>
                  </div>
                </div>
              )}
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
                  "Eliminar"
                )}
              </button>
              <button
                onClick={() => setShowEventDetails(false)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Informações Semanais */}
      {showInfo && infoSemanal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-700 to-pink-600 bg-clip-text text-transparent">
                Semana {infoSemanal.semana} da Gravidez
              </h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="Fechar"
              >
                ✖️
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Desenvolvimento do bebé */}
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">👶</span>
                  <h4 className="text-lg font-semibold text-pink-800">Desenvolvimento do Bebé</h4>
                </div>
                <p className="text-pink-700">{infoSemanal.desenvolvimento_bebe}</p>
              </div>
              
              {/* Sintomas comuns */}
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">🤰</span>
                  <h4 className="text-lg font-semibold text-pink-800">Sintomas Comuns</h4>
                </div>
                <p className="text-pink-700">{infoSemanal.sintomas_comuns}</p>
              </div>
              
              {/* Dicas para a mãe */}
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">💡</span>
                  <h4 className="text-lg font-semibold text-pink-800">Dicas para a Mãe</h4>
                </div>
                <p className="text-pink-700">{infoSemanal.dicas_mae}</p>
              </div>
              
              {/* Cuidados especiais */}
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">⚠️</span>
                  <h4 className="text-lg font-semibold text-pink-800">Cuidados Especiais</h4>
                </div>
                <p className="text-pink-700">{infoSemanal.cuidados_especiais}</p>
              </div>
              
              {/* Adicionar ao calendário */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
                    setNewEvent(prev => ({
                      ...prev,
                      titulo: `Semana ${infoSemanal.semana} - Consulta de acompanhamento`,
                      descricao: `Desenvolvimento do bebé: ${infoSemanal.desenvolvimento_bebe.substring(0, 100)}carregando`,
                      inicio_data: format(new Date(), "yyyy-MM-dd"),
                      tipo_evento: "consulta",
                    }));
                    setShowInfo(false);
                    setShowModal(true);
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                >
                  <span className="mr-2">📅</span>
                  Adicionar consulta de acompanhamento ao calendário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para configuração da data inicial da gravidez (mostrado se não houver dados) */}
      {!isLoading && !pregnancyData.dataInicio && !showPregnancyForm && !showPlanningForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-pink-800">
                Configurar calendário
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">Para personalizar o seu calendário, por favor, selecione uma opção:</p>
            
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setShowPregnancyForm(true)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
              >
                <span className="mr-2">🤰</span>
                Estou Grávida
              </button>
              
              <button
                onClick={() => setShowPlanningForm(true)}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
              >
                <span className="mr-2">📅</span>
                Quero Engravidar
              </button>
              
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowPregnancyForm(false);
                  setShowPlanningForm(false);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                <span className="mr-2">⏰</span>
                Definir Depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para configuração da gravidez */}
      {showPregnancyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-pink-800">
                Estou grávida!
              </h3>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              
              const formData = new FormData(e.target);
              const data_ultima_menstruacao = formData.get('data_ultima_menstruacao');
              const data_provavel_parto = formData.get('data_provavel_parto');
              
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado");
                
                if (!data_ultima_menstruacao) {
                  throw new Error("A data da última menstruação é obrigatória");
                }

                const dadosGravidez = {
                  user_id: user.id,
                  data_ultima_menstruacao: data_ultima_menstruacao,
                  data_inicio: new Date().toISOString().split('T')[0],
                  tipo: 'gravida'
                };

                if (data_provavel_parto) {
                  dadosGravidez.data_provavel_parto = data_provavel_parto;
                }
                
                const { error } = await supabase
                  .from("gravidez_info")
                  .insert([dadosGravidez]);
                  
                if (error) throw error;
                
                await fetchPregnancyData(user.id);
                showNotification("Calendário configurado com sucesso!");
                setShowPregnancyForm(false);
                setShowModal(false);
                setShowPlanningForm(false);
              } catch (error) {
                console.error("Erro ao configurar dados da gravidez:", error);
                showNotification(error.message || "Erro ao configurar dados. Tente novamente.", "error");
              } finally {
                setIsLoading(false);
              }
            }}>
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="data_ultima_menstruacao">
                  Data da última menstruação
                </label>
                <input
                  id="data_ultima_menstruacao"
                  type="date"
                  name="data_ultima_menstruacao"
                  className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Usamos esta data para calcular a semana da gravidez</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="data_provavel_parto">
                  Data provável do parto (opcional)
                </label>
                <input
                  id="data_provavel_parto"
                  type="date"
                  name="data_provavel_parto"
                  className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                />
                <p className="text-xs text-gray-500 mt-1">Se o seu médico já a informou de uma data provável</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPregnancyForm(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <span className="mr-2">✨</span>
                  )}
                  Configurar Calendário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para planejamento da gravidez */}
      {showPlanningForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-pink-800">
                Quero engravidar!
              </h3>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              
              const formData = new FormData(e.target);
              const data_ultima_menstruacao = formData.get('data_ultima_menstruacao');
              const ciclo_menstrual = formData.get('ciclo_menstrual');
              
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado");
                
                if (!data_ultima_menstruacao) {
                  throw new Error("A data da última menstruação é obrigatória");
                }

                const dadosPlanejamento = {
                  user_id: user.id,
                  data_ultima_menstruacao: data_ultima_menstruacao,
                  ciclo_menstrual: ciclo_menstrual || 28,
                  tipo: 'planejamento',
                  data_inicio: new Date().toISOString().split('T')[0]
                };
                
                const { error } = await supabase
                  .from("gravidez_info")
                  .insert([dadosPlanejamento]);
                  
                if (error) throw error;

                // Calcular e adicionar próximas ovulações
                const dataUltimaMenstruacao = new Date(data_ultima_menstruacao);
                const ciclo = parseInt(ciclo_menstrual) || 28;
                
                // Adicionar próximas 6 ovulações
                for (let i = 0; i < 6; i++) {
                  const dataOvulacao = new Date(dataUltimaMenstruacao);
                  dataOvulacao.setDate(dataOvulacao.getDate() + (ciclo * i) + 14); // 14 dias após a menstruação
                  
                  const eventoOvulacao = {
                    user_id: user.id,
                    titulo: `Período Fértil - Ciclo ${i + 1}`,
                    descricao: `Período fértil estimado para o ciclo ${i + 1}. A ovulação geralmente ocorre 14 dias após o início da menstruação.`,
                    inicio_data: dataOvulacao.toISOString().split('T')[0],
                    fim_data: new Date(dataOvulacao.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 5 dias de período fértil
                    tipo_evento: 'ovulacao',
                    lembrete: true,
                    lembrete_antecedencia: 2
                  };
                  
                  await supabase
                    .from("calendario")
                    .insert([eventoOvulacao]);
                }
                
                await fetchEvents(user.id);
                showNotification("Calendário de planejamento configurado com sucesso!");
                setShowPlanningForm(false);
                setShowModal(false);
                setShowPregnancyForm(false);
              } catch (error) {
                console.error("Erro ao configurar planejamento:", error);
                showNotification(error.message || "Erro ao configurar dados. Tente novamente.", "error");
              } finally {
                setIsLoading(false);
              }
            }}>
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="data_ultima_menstruacao">
                  Data da última menstruação
                </label>
                <input
                  id="data_ultima_menstruacao"
                  type="date"
                  name="data_ultima_menstruacao"
                  className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="ciclo_menstrual">
                  Duração do ciclo menstrual (em dias)
                </label>
                <input
                  id="ciclo_menstrual"
                  type="number"
                  name="ciclo_menstrual"
                  min="21"
                  max="35"
                  defaultValue="28"
                  className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-black"
                />
                <p className="text-xs text-gray-500 mt-1">O ciclo padrão é de 28 dias. Ajuste conforme seu ciclo.</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPlanningForm(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <span className="mr-2">✨</span>
                  )}
                  Configurar Calendário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}