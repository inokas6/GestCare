import React, { useState } from 'react';
import Caracteristicas from "../caracteristicas/Caracteristicas"
import Signo from "../signos/signo"
import PeriodoFertil from "../periodoFertil/PeriodoFertil"
import DataParto from "../dataParto/DataParto"
import TamanhoEstimado from "../tamanhoEstimado/TamanhoEstimado"
import Link from 'next/link';

const PregnancyCalculators = () => {
  const [activeTab, setActiveTab] = useState('caracteristicas');
  const [hoverCard, setHoverCard] = useState(null);

  const calculators = [
    {
      id: 'caracteristicas',
      name: 'Características',
      icon: '/icons/menuhamburguer.png',
      color: 'from-pink-500 to-pink-400',
      shadowColor: 'pink-300',
      description: 'Descubra as possíveis características físicas que seu bebê pode ter com base na genética dos pais.',
    },
    {
      id: 'periodoFertil',
      name: 'Período Fértil',
      icon: 'calendar-alt',
      color: 'from-fuchsia-500 to-purple-400',
      shadowColor: 'fuchsia-300',
      description: 'Calcule seus dias mais férteis para aumentar as chances de engravidar conforme seu ciclo menstrual.',
    },
    {
      id: 'signos',
      name: 'Signos',
      icon: 'star',
      color: 'from-violet-500 to-violet-400',
      shadowColor: 'violet-300',
      description: 'Descubra o signo do zodíaco e as características astrológicas do seu bebê com base na data de nascimento.',
    },
    {
      id: 'dataParto',
      name: 'Data Parto',
      icon: 'baby',
      color: 'from-rose-500 to-rose-400',
      shadowColor: 'rose-300',
      description: 'Calcule a data provável do parto baseada na sua última menstruação ou data da concepção conhecida.',
    },
    {
      id: 'tamanhoEstimado',
      name: 'Tamanho Estimado',
      icon: 'weight',
      color: 'from-pink-600 to-pink-500',
      shadowColor: 'pink-400',
      description: 'Acompanhe o tamanho e peso estimados do seu bebê em cada semana da gestação, comparando com frutas e objetos.',
    },
  ];

  // Conteúdo para cada calculadora (poderia ser substituído por componentes reais de calculadoras)
  const renderCalculatorContent = (id) => {
    const calculator = calculators.find(c => c.id === id);
    
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-96">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${calculator.color} mb-4 flex items-center justify-center shadow-lg`}>
            <i className={`fas fa-${calculator.icon} text-white text-2xl`}></i>
          </div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            Calculadora de {calculator.name}
          </h3>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            {calculator.description}
          </p>
        </div>

        <div className="card w-full max-w-xl bg-white shadow-xl border border-pink-100">
          <div className="card-body">
            {id === 'caracteristicas' && <Caracteristicas />}
            {id === 'periodoFertil' && <PeriodoFertil />}
            {id === 'signos' && <Signo />}
            {id === 'dataParto' && <DataParto />}
            {id === 'tamanhoEstimado' && <TamanhoEstimado />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 mt-100">     

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 mt-50">
        

        {/* Calculator Selection Cards */}
        <h3 className="text-2xl font-bold text-pink-700 mb-6 text-center">Escolha sua calculadora</h3>
        
        <div className="calculator-selector mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {calculators.map((calculator) => (
              <div 
                key={calculator.id}
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform ${
                  activeTab === calculator.id 
                    ? 'ring-4 ring-offset-2 ring-pink-400 scale-105' 
                    : 'hover:scale-102'
                } ${
                  hoverCard === calculator.id ? 'shadow-2xl' : 'shadow-lg'
                }`}
                onClick={() => setActiveTab(calculator.id)}
                onMouseEnter={() => setHoverCard(calculator.id)}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className={`h-full bg-white border border-${calculator.shadowColor}`}>
                  <div className={`h-2 w-full bg-gradient-to-r ${calculator.color}`}></div>
                  <div className="p-6 flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${calculator.color} flex items-center justify-center mb-4 shadow-md`}>
                      <i className={`fas fa-${calculator.icon} text-white text-xl`}></i>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{calculator.name}</h3>
                    <p className="text-gray-500 text-sm text-center">{calculator.description}</p>
                  </div>
                </div>
                
                {activeTab === calculator.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calculator Content */}
        <div className="card bg-white shadow-2xl mb-12 border border-pink-100 overflow-hidden">
          {renderCalculatorContent(activeTab)}
        </div>

       
         
      
      </main>
      

      
    </div>
  );
};

export default PregnancyCalculators;