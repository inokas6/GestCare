"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    titulo: "",
    descricao: "",
    inicio_data: "",
    fim_data: "",
    tipo_evento: "importante",
  });
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
      setEvents(
        data.map((event) => ({
          id: event.id,
          title: event.titulo,
          start: event.inicio_data,
          end: event.fim_data || event.inicio_data,
          description: event.descricao,
          backgroundColor: getEventColor(event.tipo_evento),
          borderColor: getEventColor(event.tipo_evento),
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  const getEventColor = (type) => {
    const colors = {
      consulta: "#4CAF50",
      ovulacao: "#FF9800",
      parto: "#F44336",
      importante: "#2196F3",
    };
    return colors[type] || "#757575";
  };

  return (
    <div className="p-4 relative">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          selectable
          events={events}
          locale={ptBR}
        />
      </div>
    </div>
  );
}