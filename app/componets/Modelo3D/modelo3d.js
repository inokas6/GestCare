import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Criar uma única instância do cliente Supabase para toda a aplicação
const supabase = createClientComponentClient();

/**
 * Função para pré-carregar um modelo 3D específico
 * @param {number} semana - A semana da gravidez para carregar o modelo correspondente
 */
function preloadModel(semana) {
  const modelPath = `/modelos3d/semana${semana}.glb`;
  useGLTF.preload(modelPath);
}

/**
 * Componente que renderiza o modelo 3D de uma semana específica
 * @param {number} semana - A semana da gravidez
 * @param {function} onError - Função de callback para lidar com erros
 */
function Modelo({ semana, onError }) {
  const modelPath = `/modelos3d/semana${semana}.glb`;
  console.log('A carregar modelo:', modelPath);
  
  try {
    // Carrega o modelo GLTF usando o hook useGLTF
    const gltf = useGLTF(modelPath);
    console.log('Modelo carregado com sucesso:', gltf);
    
    // Renderiza o modelo como um objeto primitivo com rotação personalizada
    // A rotação é ajustada para orientar corretamente o modelo 3D
    return React.createElement('primitive', { 
      object: gltf.scene,
      rotation: [-Math.PI / 2 + Math.PI / 2 + Math.PI, Math.PI + 0.3, Math.PI / 2] // Rotação invertida + 90 graus + 180 graus no eixo X + 180 graus no eixo Y + 0.3 radianos para a direita + 90 graus no eixo Z
    });
  } catch (error) {
    // Em caso de erro, mostra um cubo vermelho como fallback
    console.error('Erro detalhado ao carregar modelo:', error);
    console.error('Caminho do modelo:', modelPath);
    onError();
    return React.createElement('mesh', null, 
      React.createElement('boxGeometry', { args: [1, 1, 1] }),
      React.createElement('meshStandardMaterial', { color: 'red' })
    );
  }
}

/**
 * Componente principal Modelo3D que gere o estado e a lógica de carregamento
 * @param {number} semana - Semana opcional da gravidez (se não fornecida, busca da base de dados)
 * @param {function} onError - Função de callback para lidar com erros
 */
function Modelo3D({ semana = null, onError }) {
  // Estados para gerir o componente
  const [semanaAtual, setSemanaAtual] = useState(semana); // Semana atual a mostrar
  const [error, setError] = useState(null); // Estado de erro
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
  const [modelLoaded, setModelLoaded] = useState(false); // Estado de carregamento do modelo
  const [key, setKey] = useState(0); // Chave para forçar re-renderização do Canvas

  // Efeito para reiniciar estados quando a semana mudar
  useEffect(() => {
    setModelLoaded(false);
    setError(null);
    setKey(prev => prev + 1); // Incrementa a key para forçar re-renderização
  }, [semana]);

  // Efeito para carregar o modelo quando a semana mudar
  useEffect(() => {
    if (semanaAtual) {
      try {
        preloadModel(semanaAtual);
        setModelLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar modelo:', error);
        setModelLoaded(false);
      }
    }
  }, [semanaAtual]);

  // Efeito principal para buscar dados da semana atual
  useEffect(() => {
    const fetchSemana = async () => {
      setIsLoading(true);
      setModelLoaded(false);
      setError(null);
      
      // Se uma semana específica foi fornecida como prop, usa-a diretamente
      if (semana !== null) {
        setSemanaAtual(semana);
        setIsLoading(false);
        return;
      }

      try {
        // Verifica se o utilizador está autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setError("Por favor, faça login para ver o modelo 3D");
          setIsLoading(false);
          return;
        }

        // Busca informações da semana atual da base de dados
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

  /**
   * Função para lidar com erros de carregamento do modelo
   */
  const handleModelError = () => {
    setModelLoaded(false);
    setError("Erro ao carregar modelo 3D");
    if (onError) onError();
  };

  // Renderização do estado de carregamento
  if (isLoading) {
    return React.createElement('div', { className: 'flex items-center justify-center h-[500px]' }, 
      React.createElement('div', { className: 'text-gray-600' }, 'A carregar...')
    );
  }

  // Renderização do estado de erro
  if (error) {
    return React.createElement('div', { className: 'flex items-center justify-center h-[500px]' },
      React.createElement('div', { className: 'text-red-600' }, error)
    );
  }

  // Renderização quando não há semana definida
  if (!semanaAtual) {
    return React.createElement('div', { className: 'flex items-center justify-center h-[500px]' },
      React.createElement('div', { className: 'text-gray-600' }, 'Semana não definida')
    );
  }

  console.log('Renderizando Modelo3D para semana:', semanaAtual);
  
  // Renderização principal do Canvas 3D
  return React.createElement(
    Canvas,
    { 
      style: { height: '500px' },
      camera: { position: [0, 2, 5], fov: 50 }, // Posição e campo de visão da câmara
      key: key // Usa a key para forçar re-renderização quando necessário
    },
    // Iluminação ambiente para iluminar toda a cena
    React.createElement('ambientLight', { intensity: 0.7 }),
    // Luz direcional principal
    React.createElement('directionalLight', { position: [0, 8, 2], intensity: 1.2 }),
    // Luz direcional secundária para preencher sombras
    React.createElement('directionalLight', { position: [2, 6, 0], intensity: 0.6 }),
    // Suspense para mostrar loading enquanto o modelo carrega
    React.createElement(Suspense, { 
      fallback: React.createElement('div', { className: 'flex items-center justify-center h-full' }, 
        React.createElement('div', { className: 'text-gray-600' }, 'A carregar o modelo...')
      )
    },
      // Componente do modelo 3D
      React.createElement(Modelo, { 
        semana: semanaAtual, 
        onError: handleModelError 
      })
    ),
    // Controlos de órbita para permitir rotação e zoom do modelo
    React.createElement(OrbitControls)
  );
}

// Exporta o componente como padrão
export default Modelo3D;
