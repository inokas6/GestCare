'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('Token no dashboard:', token);
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Aqui você pode adicionar uma chamada para verificar o token e obter dados do usuário
    // Por exemplo:
    // fetchUserData(token);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Painel Administrativo</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sair
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <nav>
            <ul>
              <li>Dashboard</li>
              <li>Usuários</li>
              <li>Configurações</li>
            </ul>
          </nav>
        </div>

        <div className={styles.content}>
          <h2>Bem-vindo ao Painel Administrativo</h2>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Total de Usuários</h3>
              <p>0</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total de Posts</h3>
              <p>0</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total de Comentários</h3>
              <p>0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 