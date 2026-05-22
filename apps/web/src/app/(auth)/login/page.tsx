'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm): Promise<void> => {
    try {
      const { tenantSlug, accessToken } = await login(data.email, data.password);
      const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';
      const base = process.env.NODE_ENV === 'development'
        ? `http://${tenantSlug}.localhost:3000`
        : `https://${tenantSlug}.${appDomain}`;
      // /api/auth/sync define o cookie refresh_token para o subdomínio correcto
      window.location.href = `${base}/api/auth/sync?at=${encodeURIComponent(accessToken)}&next=/kanban`;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (axiosErr?.response?.status === 401) {
        setError('root', { message: 'Email ou password incorretos' });
      } else if (axiosErr?.message?.includes('Network Error') || axiosErr?.message?.includes('CORS')) {
        setError('root', { message: `Erro de ligação à API. Verifica se o servidor está a correr.` });
      } else {
        setError('root', { message: axiosErr?.response?.data?.message ?? axiosErr?.message ?? 'Erro desconhecido' });
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060609] relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/[0.06] rounded-full blur-[100px]" />
      </div>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-sm px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-600/30">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wpp-Recebo</h1>
          <p className="mt-1 text-sm text-gray-400">Acede ao painel do teu negócio</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@empresa.pt"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Esqueceste a password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-brand-600/25"
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Ainda não tens conta?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
