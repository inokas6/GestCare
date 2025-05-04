import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Modelo({ semana, onError }) {
  const modelPath = `/modelos3d/semana${semana}.glb`;
  console.log('Tentando carregar modelo:', modelPath);
  
  try {
    const gltf = useGLTF(modelPath);
    console.log('Modelo carregado com sucesso:', gltf);
    return React.createElement('primitive', { object: gltf.scene });
  } catch (error) {
    console.error('Erro detalhado ao carregar modelo:', error);
    console.error('Caminho do modelo:', modelPath);
    onError();
    return null;
  }
}

function Modelo3D({ semana = 1, onError }) {
  console.log('Renderizando Modelo3D para semana:', semana);
  
  return React.createElement(
    Canvas,
    { 
      style: { height: '500px' },
      camera: { position: [0, 0, 5], fov: 50 }
    },
    React.createElement('ambientLight', { intensity: 0.6 }),
    React.createElement('directionalLight', { position: [0, 5, 5] }),
    React.createElement(Suspense, { 
      fallback: React.createElement('div', null, 'Carregando modelo...') 
    },
      React.createElement(Modelo, { semana, onError })
    ),
    React.createElement(OrbitControls)
  );
}

export default Modelo3D;
