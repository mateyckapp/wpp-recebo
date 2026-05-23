'use client';

import { useEffect, useState } from 'react';

const APP_DOMAIN = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.com';

interface SessionUser {
  name: string;
  slug: string;
}

function readSessionCookie(): SessionUser | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie.split('; ').find((c) => c.startsWith('wpp_session='));
  if (!entry) return null;
  try {
    const raw = entry.split('=').slice(1).join('=');
    return JSON.parse(decodeURIComponent(raw)) as SessionUser;
  } catch {
    return null;
  }
}

function buildDashboardUrl(slug: string): string {
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return `http://${slug}.localhost:3000/kanban`;
  }
  return `https://${slug}.${APP_DOMAIN}/kanban`;
}

export function LandingNavSession(): React.ReactElement {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSessionCookie());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="h-9 w-36 rounded-lg bg-white/[0.05] animate-pulse" />;
  }

  if (session?.slug) {
    const firstName = session.name.split(' ')[0] ?? session.name;
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-400">Olá, {firstName}</span>
        <a
          href={buildDashboardUrl(session.slug)}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25 flex items-center gap-1.5"
        >
          Ir para o painel →
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
