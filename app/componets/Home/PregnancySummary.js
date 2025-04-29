import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DevelopmentItem from './DevelopmentItem';
import BabyModel3D from './BabyModel3D';

// Função auxiliar para obter o tamanho do bebé com base na semana
const getBabySize = (week) => {
  const sizes = [
    "tamanho de uma semente de papoula",
    "tamanho de uma semente de gergelim",
    "tamanho de um grão de arroz",
    "tamanho de um feijão pequeno",
    "tamanho de uma amora",
    "tamanho de uma framboesa",
    "tamanho de uma uva",
    "tamanho de uma azeitona",
    "tamanho de um morango",
    "tamanho de uma tâmara",
    "tamanho de um figo",
    "tamanho de um limão",
    "tamanho de um pêssego",
    "tamanho de uma laranja",
    "tamanho de uma maçã",
    "tamanho de uma pêra",
    "tamanho de uma batata",
    "tamanho de uma pimenta",
    "tamanho de uma manga",
    "tamanho de uma banana",
    "tamanho de uma cenoura",
    "tamanho de um abacate",
    "tamanho de uma papaia",
    "tamanho de um milho",
    "tamanho de uma couve-flor",
    "tamanho de uma couve",
    "tamanho de uma alface",
    "tamanho de uma berinjela",
    "tamanho de um abacaxi",
    "tamanho de um melão pequeno",
    "tamanho de um repolho",
    "tamanho de um coco",
    "tamanho de um melão",
    "tamanho de um abacaxi grande",
    "tamanho de um melão cantaloupe",
    "tamanho de uma melancia pequena",
    "tamanho de um alface romana",
    "tamanho de uma melancia",
    "tamanho de uma abóbora",
    "tamanho de uma melancia média"
  ];
  
  return week <= 40 ? sizes[week - 1] : "tamanho de um bebé recém-nascido";
};

const PregnancySummary = ({ week }) => {
  const [infoSemanal, setInfoSemanal] = useState({
    dicas_mae: "Carregando dicas..."
  });
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchInfoSemanal = async () => {
      try {
        const { data, error } = await supabase
          .from("info_gestacional")
          .select("*")
          .eq("semana", week)
          .single();
          
        if (error) {
          console.error("Erro ao buscar informações semanais:", error);
          setInfoSemanal({
            dicas_mae: "Dicas e informações serão atualizadas em breve."
          });
          return;
        }
        
        if (!data) {
          setInfoSemanal({
            dicas_mae: "Dicas e informações serão atualizadas em breve."
          });
          return;
        }
        
        setInfoSemanal({
          dicas_mae: data.dicas_mae || "Dicas e informações serão atualizadas em breve."
        });
      } catch (error) {
        console.error("Erro ao buscar informações semanais:", error);
        setInfoSemanal({
          dicas_mae: "Dicas e informações serão atualizadas em breve."
        });
      }
    };

    fetchInfoSemanal();
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
                O seu bebé tem agora o {getBabySize(week)}
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