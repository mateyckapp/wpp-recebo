'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage(): React.ReactElement {
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ForgotForm): Promise<void> => {
    try {
      const { data: res } = await api.post<{ message: string; resetUrl?: string }>(
        '/auth/forgot-password',
        { email: data.email },
      );
      setSent(true);
      if (res.resetUrl) setDevResetUrl(res.resetUrl);
    } catch {
      // Always show the success state to prevent email enumeration
      setSent(true);
    }
  };

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar password</h1>
          <p className="mt-1 text-sm text-gray-400">
            {sent ? 'Verifica o teu email' : 'Envia-te um link de recuperação'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Se o email existir na nossa plataforma, receberás um link de recuperação em breve.
                </p>
              </div>

              {/* Dev helper — shows the reset link directly in development */}
              {devResetUrl && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-left">
                  <p className="text-xs font-medium text-yellow-400 mb-1">Ambiente de desenvolvimento</p>
                  <a
                    href={devResetUrl}
                    className="text-xs text-yellow-300 break-all hover:underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}

              <Link
                href="/login"
                className="inline-block text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                ← Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nome@empresa.pt"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-brand-600/25"
              >
                {isSubmitting ? 'A enviar...' : 'Enviar link de recuperação'}
              </button>

              <p className="text-center text-xs text-gray-500 pt-1">
                <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                  ← Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
