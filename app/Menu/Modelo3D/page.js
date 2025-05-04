'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '../../componets/Home/navbar_home';
import { createClient } from '@supabase/supabase-js';

// Importando o componente Modelo3D com carregamento dinâmico para evitar problemas com SSR
const Modelo3D = dynamic(() => import('../../componets/Modelo3D/modelo3d.js'), {
  ssr: false,
  loading: () => <p className="text-center text-pink-700">Carregando modelo 3D...</p>
});

// Dados de exemplo para as semanas de gestação
const semanaData = {
  18: {
    titulo: "Desenvolvimento incrível!",
    tamanho: "14 cm",
    comparacao: "Tamanho de um pimentão",
    peso: "190g",
    descricao: "Nesta semana, seu bebê já está com aproximadamente 14 centímetros e pesa cerca de 190 gramas. Os sistemas do corpo continuam a se desenvolver e aperfeiçoar. Os movimentos estão ficando mais coordenados e você pode começar a senti-los mais claramente.",
    curiosidades: [
      {
        titulo: "Desenvolvimento dos Sentidos",
        texto: "O bebê já consegue ouvir sons externos e pode reagir a músicas altas ou à sua voz."
      },
      {
        titulo: "Movimentos",
        texto: "O bebê está praticando movimentos de sucção e deglutição, preparando-se para a alimentação após o nascimento."
      },
      {
        titulo: "Impressões Digitais",
        texto: "As impressões digitais únicas do seu bebê já estão se formando nas pontas dos dedos."
      }
    ],
    dica: "Falar com o bebê ajuda a estabelecer vínculo e estimular o desenvolvimento auditivo. Experimente ler histórias em voz alta ou conversar sobre seu dia."
  }
  // Adicionar dados para outras semanas aqui
};

// Inicializar o cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BabyDevelopmentPage() {
  const [semanaAtual, setSemanaAtual] = useState(18);
  const [trimestreAtivo, setTrimestreAtivo] = useState(1);
  const [dadosSemana, setDadosSemana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erroModelo, setErroModelo] = useState(false);

  // Mapeia trimestres para as semanas correspondentes
  const trimestres = {
    1: Array.from({ length: 13 }, (_, i) => i + 1),
    2: Array.from({ length: 14 }, (_, i) => i + 14),
    3: Array.from({ length: 13 }, (_, i) => i + 28)
  };

  // Atualiza os dados quando a semana muda
  useEffect(() => {
    const buscarDadosSemana = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('info_gestacional')
          .select('*')
          .eq('semana', semanaAtual)
          .single();

        if (error) throw error;
        setDadosSemana(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosSemana();
  }, [semanaAtual]);

  // Alterna para um trimestre específico
  const selecionarTrimestre = (trimestre) => {
    setTrimestreAtivo(trimestre);
  };

  // Seleciona uma semana específica
  const selecionarSemana = (semana) => {
    setSemanaAtual(semana);
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <header className="text-center mt-16 mb-8">
        </header>
        
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - 3D Model Circle */}
          <div className="flex-1 flex flex-col items-center">
            <div className="model-circle mb-6" style={{
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'black',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #9d174d, #be185d)',
                padding: '8px',
                boxShadow: '0 10px 25px rgba(219, 39, 119, 0.4)'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'black'
                }}></div>
              </div>
              <div id="modelo3d-container" style={{ 
                width: '100%', 
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {erroModelo ? (
                    <div className="text-white text-center p-4">
                      <p className="text-lg font-semibold">Modelo ainda não criado</p>
                    </div>
                  ) : (
                    <Modelo3D 
                      semana={semanaAtual} 
                      onError={() => setErroModelo(true)}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="stats shadow bg-white w-full max-w-md">
              <div className="stat">
                <div className="stat-title text-pink-700">Semana Atual</div>
                <div className="stat-value text-pink-800">{semanaAtual}</div>
                <div className="stat-desc text-pink-600">
                  {semanaAtual <= 13 ? '1º Trimestre' : semanaAtual <= 27 ? '2º Trimestre' : '3º Trimestre'}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-pink-700">Tamanho</div>
                <div className="stat-value text-pink-800">{dadosSemana?.tamanho || '14 cm'}</div>
                <div className="stat-desc text-pink-600">{dadosSemana?.comparacao || 'Tamanho de um pimentão'}</div>
              </div>
              <div className="stat">
                <div className="stat-title text-pink-700">Peso</div>
                <div className="stat-value text-pink-800">{dadosSemana?.peso || '190g'}</div>
                <div className="stat-desc text-pink-600">Crescendo rapidamente</div>
              </div>
            </div>
            
            <button 
              className="current-week-btn text-white px-8 py-3 rounded-full mt-6 font-semibold"
              onClick={() => selecionarSemana(18)}
              style={{
                background: 'linear-gradient(45deg, #9d174d, #be185d)',
                boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Ver Semana Atual (18)
            </button>
          </div>
          
          {/* Right column - Week selection and info */}
          <div className="flex-1">
            {/* Trimester tabs */}
            <div className="flex mb-6 border-b border-pink-200">
              {[1, 2, 3].map(trimestre => (
                <div 
                  key={trimestre}
                  className={`px-6 py-3 text-pink-800 cursor-pointer transition-all duration-200 ${trimestreAtivo === trimestre ? 'font-bold border-b-3 border-pink-700' : ''}`}
                  onClick={() => selecionarTrimestre(trimestre)}
                  style={{
                    borderBottom: trimestreAtivo === trimestre ? '3px solid #be185d' : 'none'
                  }}
                >
                  {trimestre}º Trimestre
                </div>
              ))}
            </div>
            
            {/* Week selector */}
            <div className="week-selector mb-8" style={{
              background: 'linear-gradient(to right, #9d174d, #be185d)',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)'
            }}>
              <h3 className="text-white text-lg mb-3 font-semibold">Selecione uma semana</h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {trimestres[trimestreAtivo].map(semana => (
                  <button 
                    key={semana}
                    className={`week-btn btn btn-sm border-none text-white ${semanaAtual === semana ? 'active bg-white text-pink-700 font-bold' : 'bg-pink-700 hover:bg-pink-800'}`}
                    onClick={() => selecionarSemana(semana)}
                  >
                    {semana}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}