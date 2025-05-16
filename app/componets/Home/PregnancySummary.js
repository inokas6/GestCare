import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DevelopmentItem from './DevelopmentItem';
import BabyModel3D from './BabyModel3D';

const PregnancySummary = ({ week }) => {
  const [infoSemanal, setInfoSemanal] = useState({
    dicas_mae: "Carregando dicas..."
  });
  const [tamanhoBebe, setTamanhoBebe] = useState("Carregando...");
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Buscando dados para a semana:', week);
        
        // Buscar usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setError("Por favor, faça login para ver suas informações");
          return;
        }

        // Buscar informações da semana
        const { data: infoData, error: infoError } = await supabase
          .from("info_gestacional")
          .select("*")
          .eq("semana", week)
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
          console.log('Buscando tamanho do bebé para a semana:', week);
          const { data: tamanhoData, error: tamanhoError } = await supabase
            .from("tamanhos_bebe")
            .select("fruta")
            .eq("semana", week)
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
            console.log('Nenhum tamanho encontrado para a semana:', week);
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

    if (week > 0 && week <= 42) {
      fetchData();
    } else {
      console.log('Semana inválida:', week);
      setTamanhoBebe("Semana inválida");
    }
  }, [week]);

  const progressPercentage = (week / 40) * 100;
  const getTrimester = (week) => {
    if (week <= 13) return { number: 1, start: 1, end: 13 };
    if (week <= 26) return { number: 2, start: 14, end: 26 };
    return { number: 3, start: 27, end: 40 };
  };
  
  const trimester = getTrimester(week);
  
  return (
    <div className="bg-white rounded-2xl shadow-md mb-6 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 flex flex-col justify-center p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Semana {week}</h2>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-purple-700 font-medium">
              {trimester.number}º Trimestre
            </p>
            <span className="text-sm text-gray-500">
              (Semana {trimester.start} a {trimester.end})
            </span>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-4 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mb-6">
            <span>Semana 1</span>
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
        </div>
        
        <div className="w-full md:w-1/2 p-4 flex justify-center">
          <BabyModel3D week={week} />
        </div>
      </div>
    </div>
  );
};

export default PregnancySummary; 