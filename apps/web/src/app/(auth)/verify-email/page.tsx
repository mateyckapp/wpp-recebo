'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type State = 'loading' | 'success' | 'error';

const APP_DOMAIN = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.com';

function buildDashboardUrl(tenantSlug: string): string {
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return `http://${tenantSlug}.localhost:3000/kanban`;
  }
  return `https://${tenantSlug}.${APP_DOMAIN}/kanban`;
}

function VerifyEmailContent(): React.ReactElement {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>('loading');
  const [dashboardUrl, setDashboardUrl] = useState('/kanban');
  const [errorMsg, setErrorMsg] = useState('');
  const [onSubdomain, setOnSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parts = window.location.hostname.split('.');
      const isSubdomain = parts.length > 2 || (parts.length === 2 && parts[1] === 'localhost');
      setOnSubdomain(isSubdomain);
    }

    if (!token) {
      setState('error');
      setErrorMsg('Link de verificação inválido ou em falta.');
      return;
    }
    api
      .get<{ tenantSlug: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(({ data }) => {
        if (data.tenantSlug) {
          setDashboardUrl(buildDashboardUrl(data.tenantSlug));
        }
        setState('success');
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setErrorMsg(axiosErr?.response?.data?.message ?? 'Link inválido ou expirado.');
        setState('error');
      });
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060609] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/[0.06] rounded-full blur-[100px]" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-600/30">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verificação de email</h1>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm text-center">
          {state === 'loading' && (
            <div className="space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/10">
                <svg className="h-6 w-6 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">A verificar o teu email...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Email verificado!</p>
                <p className="mt-1 text-sm text-gray-400">A tua conta está agora confirmada.</p>
              </div>
              <button
                onClick={() => {
                  if (onSubdomain) {
                    router.push('/kanban');
                  } else {
                    window.location.href = dashboardUrl;
                  }
                }}
                className="inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
              >
                Ir para o dashboard
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Link inválido</p>
                <p className="mt-1 text-sm text-gray-400">{errorMsg}</p>
              </div>
              <Link
                href="/login"
                className="inline-block rounded-lg border border-white/10 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/[0.09] transition-all"
              >
                Ir para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage(): React.ReactElement {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
