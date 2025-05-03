'use client';

import dynamic from 'next/dynamic';
import Navbar from '../../componets/Home/navbar_home';

const Modelo3D = dynamic(() => import('../../componets/Modelo3D/modelo3d.js'), {
  ssr: false,
  loading: () => <p>Carregando modelo 3D...</p>
});

export default function Modelo3DPage() {
  return (
    <div>
      <Navbar />
      <div id="modelo3d-container" style={{ width: '100%', height: '100vh' }}>
        <Modelo3D />
      </div>
    </div>
  );
}
