'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao processar callback:', error);
        router.push('/login');
        return;
      }

      if (session) {
        const next = searchParams.get('next') || '/';
        router.push(next);
      }
    };

    handleCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold">Processando...</h1>
          <p className="py-6">Por favor, aguarde enquanto processamos sua solicitação.</p>
        </div>
      </div>
    </div>
  );
} 