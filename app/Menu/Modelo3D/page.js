'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '../../componets/Home/navbar_home';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Importando o componente Modelo3D com carregamento dinâmico para evitar problemas com SSR
const Modelo3D = dynamic(() => import('../../componets/Modelo3D/modelo3d.js'), {
  ssr: false,
  loading: () => <p className="text-center text-pink-700">A carregar o modelo 3D</p>
});


export default function BabyDevelopmentPage() {
  const [semanaAtual, setSemanaAtual] = useState(null);
  const [trimestreAtivo, setTrimestreAtivo] = useState(1);
  const [dadosSemana, setDadosSemana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erroModelo, setErroModelo] = useState(false);
  const [erroAuth, setErroAuth] = useState(false);
  const [modeloKey, setModeloKey] = useState(0); // Chave para forçar a atualização do modelo
  const supabase = createClientComponentClient();

  //semana atual da bd
  useEffect(() => {
    const buscarSemanaAtual = async () => {
      try {
        setLoading(true);
        
        //user atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao encontrar sessão:", sessionError);
          setErroAuth(true);
          setLoading(false);
          return;
        }

        if (!session) {
          console.log("user não autenticado");
          setErroAuth(true);
          setLoading(false);
          return;
        }

        // dados da gravidez do user
        const { data: gravidezData, error: gravidezError } = await supabase
          .from('gravidez_info')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (gravidezError) {
          console.error("Erro ao encontrar dados da gravidez:", gravidezError);
          setLoading(false);
          return;
        }

        if (gravidezData) {
          console.log('Dados da gravidez encontrados:', gravidezData);
          
          // Calcular a semana atual com base na data da última menstruação
          const dataDUM = new Date(gravidezData.data_ultima_menstruacao);
          const hoje = new Date();
          
          // Calcular a diferença em dias
          const diffTime = Math.abs(hoje - dataDUM);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Calcular a semana atual (considerando que a gravidez começa 2 semanas após a DUM)
          const semanaAtual = Math.floor(diffDays / 7) + 2;
          
          console.log('Data DUM:', dataDUM);
          console.log('Dias desde DUM:', diffDays);
          console.log('Semana atual calculada:', semanaAtual);

          // Limitar a semana atual a 40 semanas
          const semanaFinal = Math.min(semanaAtual, 40);

          // Buscar informações da semana atual
          const { data: infoData, error: infoError } = await supabase
            .from('info_gestacional')
            .select('*')
            .eq('semana', semanaFinal)
            .single();

          if (infoError) {
            console.error("Erro ao buscar informações gestacionais:", infoError);
            setLoading(false);
            return;
          }

          if (infoData) {
            console.log('Informações da semana encontradas:', infoData);
            setSemanaAtual(semanaFinal);
            setTrimestreAtivo(semanaFinal <= 13 ? 1 : semanaFinal <= 26 ? 2 : 3);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar semana atual:", error);
        setLoading(false);
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
  const selecionarSemana = async (semana) => {
    try {
      setLoading(true);
      setErroModelo(false);
      
      // Buscar informações da semana selecionada
      const { data: infoData, error: infoError } = await supabase
        .from('info_gestacional')
        .select('*')
        .eq('semana', semana)
        .single();

      if (infoError) {
        console.error("Erro ao buscar informações da semana:", infoError);
        setLoading(false);
        return;
      }

      if (infoData) {
        console.log('Informações da semana encontradas:', infoData);
        setSemanaAtual(semana);
        setTrimestreAtivo(semana <= 13 ? 1 : semana <= 26 ? 2 : 3);
        setDadosSemana(infoData);
        setModeloKey(prev => prev + 1); // Força a atualização do modelo
      }
    } catch (error) {
      console.error("Erro ao selecionar semana:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      
      <main className="container mt-16 mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center mt-16">
            <p className="text-pink-700 text-xl">A carregar</p>
          </div>
        ) : erroAuth ? (
          <div className="text-center mt-16">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-pink-700 mb-4">Acesso Restrito</h2>
              <p className="text-gray-600 mb-6">
                Para visualizar o modelo 3D do seu bebé, você precisa estar logada.
              </p>
              <Link 
                href="/login" 
                className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition-colors"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            
            
            <div className="flex flex-col md:flex-row gap-8">
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
                          key={modeloKey}
                          semana={semanaAtual} 
                          onError={() => setErroModelo(true)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Stats cards*/}
                <div className="stats-container w-full max-w-md bg-white rounded-xl overflow-hidden shadow-lg border border-pink-100 mb-6">
  <div className="flex justify-center items-center">
    <div className="stat p-4 text-center">
      <div className="stat-title text-pink-700 text-sm font-medium">Semana Atual</div>
      <div className="stat-value text-pink-800 text-2xl font-bold">{semanaAtual}</div>
      <div className="stat-desc text-pink-600 text-xs">
        {semanaAtual <= 13 ? '1º Trimestre' : semanaAtual <= 27 ? '2º Trimestre' : '3º Trimestre'}
      </div>
    </div>
  </div>
</div>

                

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
                        className={`week-btn py-3 text-lg rounded-lg transition-all ${
                          semanaAtual === semana 
                            ? 'bg-pink-600 text-white font-bold shadow-md transform scale-105' 
                            : 'bg-pink-700 bg-opacity-70 hover:bg-pink-600 text-white'
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