import DevelopmentItem from './DevelopmentItem';
import BabyModel3D from './BabyModel3D';

// Função auxiliar para obter o tamanho do bebê com base na semana
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
  
  return week <= 40 ? sizes[week - 1] : "tamanho de um bebê recém-nascido";
};

const PregnancySummary = ({ week }) => {
  const progressPercentage = (week / 40) * 100;
  
  return (
    <div className="bg-white rounded-2xl shadow-md mb-6 p-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 flex flex-col justify-center p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Semana {week}</h2>
          <p className="text-purple-700 font-medium mb-4">
            {week <= 13 ? '1º Trimestre' : week <= 26 ? '2º Trimestre' : '3º Trimestre'}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-6">
            <span>Semana 1</span>
            <span>Semana 40</span>
          </div>
          <div className="space-y-3">
            <DevelopmentItem 
              icon="ear" 
              text="Seu bebê já consegue ouvir sua voz" 
              color="pink" 
            />
            <DevelopmentItem 
              icon="heart" 
              text={`Tamanho aproximado: ${getBabySize(week)}`} 
              color="purple" 
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