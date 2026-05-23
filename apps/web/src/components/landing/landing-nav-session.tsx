'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';
const APP_DOMAIN = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.com';

interface SessionUser {
  name: string;
  tenantSlug: string;
}

function buildDashboardUrl(slug: string): string {
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return `http://${slug}.localhost:3000/kanban`;
  }
  return `https://${slug}.${APP_DOMAIN}/kanban`;
}

export function LandingNavSession(): React.ReactElement {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession(): Promise<void> {
      try {
        // Tenta renovar o access token via refresh cookie (httpOnly)
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (!refreshRes.ok) { setChecked(true); return; }

        const { accessToken } = (await refreshRes.json()) as { accessToken: string };

        // Busca dados do utilizador
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        });
        if (!meRes.ok) { setChecked(true); return; }

        const data = (await meRes.json()) as { name: string; tenantSlug: string };
        if (!cancelled) setUser({ name: data.name, tenantSlug: data.tenantSlug });
      } catch {
        // sem sessão — não faz nada
      } finally {
        if (!cancelled) setChecked(true);
      }
    }

    void checkSession();
    return () => { cancelled = true; };
  }, []);

  // Ainda a verificar — não renderiza nada para evitar flash
  if (!checked) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:block h-4 w-16 rounded bg-white/[0.05] animate-pulse" />
        <div className="h-8 w-28 rounded-lg bg-white/[0.05] animate-pulse" />
      </div>
    );
  }

  if (user) {
    const dashUrl = buildDashboardUrl(user.tenantSlug);
    const firstName = user.name.split(' ')[0] ?? user.name;
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-400">
          Olá, {firstName}
        </span>
        <a
          href={dashUrl}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25 flex items-center gap-1.5"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Ir para o painel
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <a href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">
        Entrar
      </a>
      <a
        href="/register"
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
      >
        Começar grátis
      </a>
    </div>
  );
}
