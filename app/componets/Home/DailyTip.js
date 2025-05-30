import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { differenceInWeeks } from "date-fns";

const DailyTip = () => {
  const [dicaSemanal, setDicaSemanal] = useState("Carregando dicas...");
  const [semanaAtual, setSemanaAtual] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setDicaSemanal("Por favor, faça login para ver suas informações");
          return;
        }

        const { data: gravidezData, error: gravidezError } = await supabase
          .from("gravidez_info")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (gravidezError) throw gravidezError;

        const dataInicio = new Date(gravidezData.data_ultima_menstruacao || gravidezData.data_inicio);
        const hoje = new Date();
        const semanasDesdeInicio = differenceInWeeks(hoje, dataInicio) + 2;
        setSemanaAtual(semanasDesdeInicio);

        const { data: infoData, error: infoError } = await supabase
          .from("info_gestacional")
          .select("*")
          .eq("semana", semanasDesdeInicio)
          .single();

        if (infoError) throw infoError;

        if (infoData) {
          setDicaSemanal(infoData.dicas_mae || "Dicas e informações serão atualizadas em breve.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setDicaSemanal("Erro ao carregar informações. Por favor, tente novamente mais tarde.");
      }
    };

    fetchData();
  }, []);

  const getTrimester = (week) => {
    if (week <= 13) return 1;
    if (week <= 26) return 2;
    return 3;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Dica do dia</h3>
        <button className="text-purple-600 text-sm font-medium">Ver mais</button>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">Semana {semanaAtual}</h4>
        <p className="text-gray-700 text-sm mb-3">
          {dicaSemanal}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 9c2-2 5.5-1.5 5.5 1 0 1.5-1 2-2 3l-.5 1h3"></path>
              <circle cx="15" cy="12" r="3"></circle>
              <path d="M18 22a5 5 0 0 0 0-10"></path>
            </svg>
            <span className="text-xs font-medium">Dicas para {getTrimester(semanaAtual)}° trimestre</span>
          </div>
          <span className="text-xs text-gray-500">Hoje</span>
        </div>
      </div>
    </div>
  );
};

export default DailyTip; 