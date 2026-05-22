'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As passwords não coincidem',
    path: ['confirm'],
  });

type ResetForm = z.infer<typeof schema>;

function ResetPasswordForm(): React.ReactElement {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ResetForm): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setDone(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError('root', {
        message: axiosErr?.response?.data?.message ?? 'Token inválido ou expirado. Solicita um novo link.',
      });
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060609]">
        <div className="text-center space-y-3 px-4">
          <p className="text-red-400 text-sm">Link de recuperação inválido.</p>
          <Link href="/forgot-password" className="text-brand-400 hover:text-brand-300 text-sm">
            Solicitar novo link
          </Link>
        </div>
      </main>
    );
  }

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Nova password</h1>
          <p className="mt-1 text-sm text-gray-400">
            {done ? 'Password actualizada' : 'Define a tua nova password'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm">
          {done ? (
            <div className="text-center space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-300">Password actualizada com sucesso.</p>
              <Link
                href="/login"
                className="inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25"
              >
                Iniciar sessão
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Nova password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                  {...register('password')}
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Confirmar password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repetir password"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                  {...register('confirm')}
                />
                {errors.confirm && <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>}
              </div>

              {errors.root && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {errors.root.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-brand-600/25"
              >
                {isSubmitting ? 'A guardar...' : 'Guardar nova password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
