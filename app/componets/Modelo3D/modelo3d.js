import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Modelo() {
  const gltf = useGLTF('/modelos3d/semana1.glb');
  return React.createElement('primitive', { object: gltf.scene });
}

function Modelo3D() {
  return React.createElement(
    Canvas,
    { style: { height: '500px' } },
    React.createElement('ambientLight', { intensity: 0.5 }),
    React.createElement('directionalLight', { position: [0, 5, 5] }),
    React.createElement(Suspense, { fallback: null },
      React.createElement(Modelo)
    ),
    React.createElement(OrbitControls)
  );
}

export default Modelo3D;
