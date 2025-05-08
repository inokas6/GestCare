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
  const [semanaAtual, setSemanaAtual] = useState(null);
  const [trimestreAtivo, setTrimestreAtivo] = useState(1);
  const [dadosSemana, setDadosSemana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erroModelo, setErroModelo] = useState(false);

  // Buscar semana atual do banco de dados
  useEffect(() => {
    const buscarSemanaAtual = async () => {
      try {
        const { data: infoData, error: infoError } = await supabase
          .from("info_gestacional")
          .select("*")
          .eq("semana", 18) // Semana atual fixa
          .single();

        if (infoError) {
          console.error("Erro ao buscar semana atual:", infoError);
          setSemanaAtual(18); // Valor padrão em caso de erro
        } else if (infoData) {
          console.log('Semana atual encontrada:', infoData);
          setSemanaAtual(infoData.semana);
          setTrimestreAtivo(infoData.semana <= 13 ? 1 : infoData.semana <= 26 ? 2 : 3);
        }
      } catch (error) {
        console.error("Erro ao buscar semana atual:", error);
        setSemanaAtual(18); // Valor padrão em caso de erro
      }
    };

    buscarSemanaAtual();
  }, []);

  // Mapeia trimestres para as semanas correspondentes
  const trimestres = {
    1: Array.from({ length: 13 }, (_, i) => i + 1),
    2: Array.from({ length: 14 }, (_, i) => i + 14),
    3: Array.from({ length: 13 }, (_, i) => i + 28)
  };

  // Atualiza os dados quando a semana muda
  useEffect(() => {
    if (!semanaAtual) return; // Não busca dados se semanaAtual for null

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
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center mt-16">
            <p className="text-pink-700 text-xl">Carregando informações...</p>
          </div>
        ) : (
          <>
            <header className="text-center mb-4">
              <h1 className="text-3xl font-bold text-pink-800">Desenvolvimento do Bebê</h1>
              <p className="text-pink-600">Acompanhe o crescimento semana a semana</p>
            </header>
            
            {/* Layout reorganizado */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* 3D Model - Agora muito maior e mais proeminente */}
              <div className="md:w-1/2 flex flex-col items-center justify-start">
                <div className="model-circle mb-6" style={{
                  width: '100%',
                  maxWidth: '500px',
                  aspectRatio: '1/1',
                  borderRadius: '50%',
                  background: 'black',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(190, 24, 93, 0.4)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #9d174d, #be185d)',
                    padding: '10px',
                    boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.2)'
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
                
                {/* Stats cards - redesenhados e mais atraentes */}
                <div className="stats-container w-full max-w-md bg-white rounded-xl overflow-hidden shadow-lg border border-pink-100 mb-6">
                  <div className="grid grid-cols-3 divide-x divide-pink-100">
                    <div className="stat p-4 text-center">
                      <div className="stat-title text-pink-700 text-sm font-medium">Semana Atual</div>
                      <div className="stat-value text-pink-800 text-2xl font-bold">{semanaAtual}</div>
                      <div className="stat-desc text-pink-600 text-xs">
                        {semanaAtual <= 13 ? '1º Trimestre' : semanaAtual <= 27 ? '2º Trimestre' : '3º Trimestre'}
                      </div>
                    </div>
                    <div className="stat p-4 text-center">
                      <div className="stat-title text-pink-700 text-sm font-medium">Tamanho</div>
                      <div className="stat-value text-pink-800 text-2xl font-bold">{dadosSemana?.tamanho || '14 cm'}</div>
                      <div className="stat-desc text-pink-600 text-xs">{dadosSemana?.comparacao || 'Tamanho de um pimentão'}</div>
                    </div>
                    <div className="stat p-4 text-center">
                      <div className="stat-title text-pink-700 text-sm font-medium">Peso</div>
                      <div className="stat-value text-pink-800 text-2xl font-bold">{dadosSemana?.peso || '190g'}</div>
                      <div className="stat-desc text-pink-600 text-xs">Crescendo rapidamente</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="current-week-btn text-white px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105"
                  onClick={() => selecionarSemana(semanaAtual)}
                  style={{
                    background: 'linear-gradient(45deg, #9d174d, #be185d)',
                    boxShadow: '0 6px 20px rgba(219, 39, 119, 0.4)',
                  }}
                >
                  Ver Semana Atual ({semanaAtual})
                </button>
              </div>
              
              {/* Right column - Week selection and info */}
              <div className="md:w-1/2">
                {/* Trimester tabs - melhorados e mais interativos */}
                <div className="flex mb-6 border-b border-pink-200 bg-white rounded-t-xl overflow-hidden shadow-md">
                  {[1, 2, 3].map(trimestre => (
                    <div 
                      key={trimestre}
                      className={`flex-1 px-6 py-4 text-center text-pink-800 cursor-pointer transition-all duration-200 hover:bg-pink-50 ${trimestreAtivo === trimestre ? 'font-bold bg-pink-100' : ''}`}
                      onClick={() => selecionarTrimestre(trimestre)}
                      style={{
                        borderBottom: trimestreAtivo === trimestre ? '3px solid #be185d' : 'none'
                      }}
                    >
                      {trimestre}º Trimestre
                    </div>
                  ))}
                </div>
                
                {/* Week selector - redesenhado para layout vertical e botões maiores */}
                <div className="week-selector mb-8 rounded-xl overflow-hidden shadow-lg" style={{
                  background: 'linear-gradient(to right, #9d174d, #be185d)',
                  padding: '1.5rem',
                  boxShadow: '0 10px 25px rgba(219, 39, 119, 0.3)'
                }}>
                  <h3 className="text-white text-xl mb-4 font-semibold">Selecione uma semana</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {trimestres[trimestreAtivo].map(semana => (
                      <button 
                        key={semana}
                        className={`week-btn py-3 text-lg rounded-lg text-white transition-all ${
                          semanaAtual === semana 
                            ? 'bg-white text-pink-700 font-bold shadow-md transform scale-105' 
                            : 'bg-pink-700 bg-opacity-70 hover:bg-pink-600'
                        }`}
                        onClick={() => selecionarSemana(semana)}
                      >
                        {semana}
                      </button>
                    ))}
                  </div>
                </div>
                
                
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}