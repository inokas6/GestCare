import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Criar uma única instância do cliente Supabase
const supabase = createClientComponentClient();

// Pré-carregar o modelo
function preloadModel(semana) {
  const modelPath = `/modelos3d/semana${semana}.glb`;
  useGLTF.preload(modelPath);
}

function Modelo({ semana, onError }) {
  const modelPath = `/modelos3d/semana${semana}.glb`;
  console.log('A carregar modelo:', modelPath);
  
  try {
    const gltf = useGLTF(modelPath);
    console.log('Modelo carregado com sucesso:', gltf);
    return React.createElement('primitive', { object: gltf.scene });
  } catch (error) {
    console.error('Erro detalhado ao carregar modelo:', error);
    console.error('Caminho do modelo:', modelPath);
    onError();
    return React.createElement('mesh', null, 
      React.createElement('boxGeometry', { args: [1, 1, 1] }),
      React.createElement('meshStandardMaterial', { color: 'red' })
    );
  }
}

function Modelo3D({ semana = null, onError }) {
  const [semanaAtual, setSemanaAtual] = useState(semana);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [key, setKey] = useState(0); // Novo estado para forçar re-renderização

  // Resetar estados quando a semana mudar
  useEffect(() => {
    setModelLoaded(false);
    setError(null);
    setKey(prev => prev + 1); // Incrementa a key para forçar re-renderização
  }, [semana]);

  // Pré-carregar o modelo quando a semana mudar
  useEffect(() => {
    if (semanaAtual) {
      try {
        preloadModel(semanaAtual);
        setModelLoaded(true);
      } catch (error) {
        console.error('Erro ao pré-carregar modelo:', error);
        setModelLoaded(false);
      }
    }
  }, [semanaAtual]);

  useEffect(() => {
    const fetchSemana = async () => {
      setIsLoading(true);
      setModelLoaded(false);
      setError(null);
      
      // Se uma semana específica foi fornecida como prop, use-a
      if (semana !== null) {
        setSemanaAtual(semana);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setError("Por favor, faça login para ver o modelo 3D");
          setIsLoading(false);
          return;
        }

        // Buscar informações da semana atual
        const { data: infoData, error: infoError } = await supabase
          .from("info_gestacional")
          .select("semana")
          .order('semana', { ascending: false })
          .limit(1)
          .single();

        if (infoError) {
          console.error("Erro ao buscar semana atual:", infoError);
          setError("Erro ao buscar semana atual");
        } else if (infoData) {
          console.log('Semana atual encontrada:', infoData);
          setSemanaAtual(infoData.semana);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao buscar dados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSemana();
  }, [semana]);

  const handleModelError = () => {
    setModelLoaded(false);
    setError("Erro ao carregar modelo 3D");
    if (onError) onError();
  };

  if (isLoading) {
    return React.createElement('div', { className: 'flex items-center justify-center h-[500px]' }, 
      React.createElement('div', { className: 'text-gray-600' }, 'A carregar...')
    );
  }

  if (error) {
    return React.createElement('div', { className: 'flex items-center justify-center h-[500px]' },
      React.createElement('div', { className: 'text-red-600' }, error)
    );
  }

  if (!semanaAtual) {
    return React.createElement('div', { className: 'flex items-center justify-center h-[500px]' },
      React.createElement('div', { className: 'text-gray-600' }, 'Semana não definida')
    );
  }

  console.log('Renderizando Modelo3D para semana:', semanaAtual);
  
  return React.createElement(
    Canvas,
    { 
      style: { height: '500px' },
      camera: { position: [0, 0, 5], fov: 50 },
      key: key // Usa a key para forçar re-renderização
    },
    React.createElement('ambientLight', { intensity: 0.6 }),
    React.createElement('directionalLight', { position: [0, 5, 5] }),
    React.createElement(Suspense, { 
      fallback: React.createElement('div', { className: 'flex items-center justify-center h-full' }, 
        React.createElement('div', { className: 'text-gray-600' }, 'A carregar o modelo...')
      )
    },
      React.createElement(Modelo, { 
        semana: semanaAtual, 
        onError: handleModelError 
      })
    ),
    React.createElement(OrbitControls)
  );
}

export default Modelo3D;
