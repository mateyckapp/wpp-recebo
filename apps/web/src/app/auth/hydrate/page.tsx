'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HydratePage() {
  const params = useSearchParams();

  useEffect(() => {
    const at = params.get('at');
    const next = params.get('next') ?? '/kanban';

    if (!at) {
      window.location.replace('/login');
      return;
    }

    // Sobrescreve qualquer token stale de sessões anteriores neste subdomínio
    sessionStorage.setItem('access_token', at);

    // Limpa o token do URL antes de navegar para não ficar no histórico
    window.location.replace(next);
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060609]">
      <div className="w-6 h-6 border-2 border-white/10 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

export default function AuthHydratePage() {
  return (
    <Suspense>
      <HydratePage />
    </Suspense>
  );
}
