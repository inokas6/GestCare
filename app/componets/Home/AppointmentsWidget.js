import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentsWidget = () => {
  const [appointments, setAppointments] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("calendario")
        .select("*")
        .eq("user_id", user.id)
        .eq("tipo_evento", "consulta")
        .gte("inicio_data", new Date().toISOString())
        .order("inicio_data", { ascending: true })
        .limit(2);

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d MMMM", { locale: ptBR });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Próximas consultas</h3>
      </div>
      
      <div className="border-l-2 border-purple-200 pl-4 space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id}>
              <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-1">
                {formatDate(appointment.inicio_data)}
              </span>
              <h4 className="font-medium text-gray-800">{appointment.titulo}</h4>
              <p className="text-gray-600 text-sm">
                {appointment.descricao}, {formatTime(appointment.inicio_data)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma consulta agendada</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentsWidget; 