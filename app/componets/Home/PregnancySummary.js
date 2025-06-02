import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DevelopmentItem from './DevelopmentItem';
import BabyModel3D from './BabyModel3D';
import { differenceInWeeks, addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PregnancySummary = ({ week }) => {
  const [infoSemanal, setInfoSemanal] = useState({
    dicas_mae: "carregando dicas..."
  });
  const [tamanhoBebe, setTamanhoBebe] = useState("...");
  const [error, setError] = useState(null);
  const [pregnancyData, setPregnancyData] = useState({
    dataInicio: null,
    semanaAtual: 0,
    diasNaSemana: 0,
    progresso: 0,
    tipo: null,
    ciclo_menstrual: 28,
    proximaOvulacao: null,
    inicioFertil: null,
    fimFertil: null
  });
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setError("Por favor, faça login para ver suas informações");
          return;
        }

        // Buscar dados da gravidez
        const { data: gravidezData, error: gravidezError } = await supabase
          .from("gravidez_info")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (gravidezError) {
          if (gravidezError.code === 'PGRST116') {
            console.log("Nenhum dado de gravidez encontrado para o usuário");
            return;
          }
          throw gravidezError;
        }

        if (!gravidezData) {
          console.log("Nenhum dado de gravidez encontrado");
          return;
        }

        // Se for planejamento, calcular período fértil
        if (gravidezData.tipo === 'planejamento') {
          const ciclo = gravidezData.ciclo_menstrual || 28;
          const dataUltimaMenstruacao = new Date(gravidezData.data_ultima_menstruacao);
          const hoje = new Date();
          let proximaOvulacao = new Date(dataUltimaMenstruacao);
          
          // Encontrar a próxima ovulação
          while (proximaOvulacao < hoje) {
            proximaOvulacao.setDate(proximaOvulacao.getDate() + ciclo);
          }
          
          // Calcular período fértil
          const inicioFertil = new Date(proximaOvulacao);
          inicioFertil.setDate(proximaOvulacao.getDate() - 2);
          const fimFertil = new Date(proximaOvulacao);
          fimFertil.setDate(proximaOvulacao.getDate() + 2);

          setPregnancyData({
            dataInicio: dataUltimaMenstruacao,
            tipo: 'planejamento',
            ciclo_menstrual: ciclo,
            proximaOvulacao,
            inicioFertil,
            fimFertil
          });

          setInfoSemanal({
            dicas_mae: "Para aumentar as chances de engravidar, mantenha relações durante todo o período fértil, especialmente no dia da ovulação e um dia antes."
          });
          
          return;
        }

        // Caso seja gravidez, calcular semanas
        const dataInicio = new Date(gravidezData.data_ultima_menstruacao || gravidezData.data_inicio);
        const hoje = new Date();
        const semanasDesdeInicio = differenceInWeeks(hoje, dataInicio) + 2;
        const diasNaSemana = Math.floor((hoje - addWeeks(dataInicio, semanasDesdeInicio - 2)) / (1000 * 60 * 60 * 24));
        const progresso = Math.min(Math.round((semanasDesdeInicio / 40) * 100), 100);

        setPregnancyData({
          dataInicio,
          semanaAtual: semanasDesdeInicio,
          diasNaSemana,
          progresso,
          tipo: 'gravida'
        });

        // Buscar informações da semana
        const { data: infoData, error: infoError } = await supabase
          .from("info_gestacional")
          .select("*")
          .eq("semana", semanasDesdeInicio)
          .single();
          
        if (infoError) {
          console.error("Erro ao buscar informações semanais:", infoError);
          setError("Erro ao buscar informações semanais");
          setInfoSemanal({
            dicas_mae: "Erro ao carregar dicas. Por favor, tente novamente mais tarde."
          });
        } else if (infoData) {
          console.log('Informações semanais encontradas:', infoData);
          setInfoSemanal({
            dicas_mae: infoData.dicas_mae || "Dicas e informações serão atualizadas em breve."
          });
        }

        // Buscar tamanho do bebé
        try {
          console.log('Buscando tamanho do bebé para a semana:', semanasDesdeInicio);
          const { data: tamanhoData, error: tamanhoError } = await supabase
            .from("tamanhos_bebe")
            .select("fruta")
            .eq("semana", semanasDesdeInicio)
            .single();
            
          if (tamanhoError) {
            console.error("Erro ao buscar tamanho do bebé:", {
              error: tamanhoError,
              message: tamanhoError.message,
              details: tamanhoError.details,
              hint: tamanhoError.hint,
              code: tamanhoError.code
            });
            setError("Erro ao buscar tamanho do bebé");
            setTamanhoBebe("Informação não disponível");
          } else if (tamanhoData) {
            console.log('Tamanho do bebé encontrado:', tamanhoData);
            setTamanhoBebe(tamanhoData.fruta);
          } else {
            console.log('Nenhum tamanho encontrado para a semana:', semanasDesdeInicio);
            setTamanhoBebe("Informação não disponível para esta semana");
          }
        } catch (error) {
          console.error("Erro ao buscar tamanho do bebé:", {
            error,
            message: error.message,
            stack: error.stack
          });
          setError("Erro ao buscar tamanho do bebé");
          setTamanhoBebe("Informação não disponível");
        }

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao buscar dados");
        setInfoSemanal({
          dicas_mae: "Erro ao carregar informações. Por favor, tente novamente mais tarde."
        });
        setTamanhoBebe("Informação não disponível");
      }
    };

    fetchData();
  }, []);

  const getTrimester = (week) => {
    if (week <= 13) return { number: 1, start: 1, end: 13 };
    if (week <= 26) return { number: 2, start: 14, end: 26 };
    return { number: 3, start: 27, end: 40 };
  };
  
  const trimester = getTrimester(pregnancyData.semanaAtual);
  
  return (
    <div className="bg-white rounded-2xl shadow-md mb-6 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 flex flex-col justify-center p-4">
          {pregnancyData.tipo === 'planejamento' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Planear a Gravidez</h2>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-pink-700 font-medium">
                  Próximo Período Fértil
                </p>
              </div>
              
              {/* Informações do período fértil */}
              <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600">📅</span>
                    <p className="text-pink-800">
                      <span className="font-medium">Período Fértil:</span> {format(pregnancyData.inicioFertil, "dd 'de' MMMM", { locale: ptBR })} até {format(pregnancyData.fimFertil, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600">⭐</span>
                    <p className="text-pink-800">
                      <span className="font-medium">Dia da Ovulação:</span> {format(pregnancyData.proximaOvulacao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600">🔄</span>
                    <p className="text-pink-800">
                      <span className="font-medium">Ciclo Menstrual:</span> {pregnancyData.ciclo_menstrual} dias
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Dica da semana */}
              <div className="space-y-3">
                <DevelopmentItem 
                  icon="info" 
                  text={infoSemanal.dicas_mae} 
                  color="pink" 
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Semana {pregnancyData.semanaAtual}</h2>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-purple-700 font-medium">
                  {trimester.number}º Trimestre
                </p>
                <span className="text-sm text-gray-500">
                  (Semana {trimester.start} a {trimester.end})
                </span>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-purple-500 h-4 rounded-full transition-all duration-500" 
                  style={{ width: `${pregnancyData.progresso}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-6">
                <span>Semana 1</span>
                <span>1º Trimestre</span>
                <span>2º Trimestre</span>
                <span>3º Trimestre</span>
                <span>Semana 40</span>
              </div>
              
              {/* Tamanho do bebé */}
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">📏</span>
                  <p className="text-purple-800 font-medium">
                    O seu bebé tem agora o tamanho de {tamanhoBebe}
                  </p>
                </div>
              </div>
              
              {/* Dica da semana */}
              <div className="space-y-3">
                <DevelopmentItem 
                  icon="info" 
                  text={infoSemanal.dicas_mae} 
                  color="blue" 
                />
              </div>
            </>
          )}
        </div>
        
        <div className="w-full md:w-1/2 p-4 flex justify-center">
          {pregnancyData.tipo === 'planejamento' ? (
            <div className="text-center p-6 bg-pink-50 rounded-lg">
              <span className="text-6xl mb-4 block">🌱</span>
              <h3 className="text-xl font-semibold text-pink-800 mb-2">Planear a sua gravidez</h3>
              <p className="text-pink-700">
                Mantenha um registo do seu ciclo menstrual e aproveite o seu período fértil para aumentar as chances de engravidar.
              </p>
            </div>
          ) : (
            <BabyModel3D week={pregnancyData.semanaAtual} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PregnancySummary; 