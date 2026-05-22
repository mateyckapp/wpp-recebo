'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@wpp-recebo/shared';

const schema = z.object({
  name: z.string().min(2, 'Nome demasiado curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  companyName: z.string().min(2, 'Nome demasiado curto'),
  slug: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Só letras minúsculas, números e hífens'),
});

type RegisterForm = z.infer<typeof schema>;

type SubdomainState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'taken'; suggestions: string[] }
  | { status: 'invalid' };

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [subdomainState, setSubdomainState] = useState<SubdomainState>({ status: 'idle' });

  // Bloqueia acesso ao registo em subdomínios — só existe no domínio raiz
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parts = window.location.hostname.split('.');
    if (parts.length > 1) {
      const root = parts.slice(1).join('.');
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.replace(`${window.location.protocol}//${root}${port}/login`);
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const slugValue = watch('slug', '');
  const companyNameValue = watch('companyName', '');

  // Auto-fill slug from company name
  useEffect(() => {
    if (companyNameValue) {
      const suggested = toSlug(companyNameValue);
      setValue('slug', suggested, { shouldValidate: false });
    }
  }, [companyNameValue, setValue]);

  // Real-time subdomain check with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!slugValue || slugValue.length < 2 || !/^[a-z0-9-]+$/.test(slugValue)) {
      setSubdomainState({ status: 'idle' });
      return;
    }

    setSubdomainState({ status: 'checking' });

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get<{ available: boolean; suggestions: string[] }>(
          `/auth/check-subdomain?slug=${slugValue}`,
        );
        if (data.available) {
          setSubdomainState({ status: 'available' });
        } else {
          setSubdomainState({ status: 'taken', suggestions: data.suggestions });
        }
      } catch {
        setSubdomainState({ status: 'idle' });
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slugValue]);

  const onSubmit = async (data: RegisterForm): Promise<void> => {
    if (subdomainState.status === 'taken') {
      setError('slug', { message: 'Subdomínio já em uso' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: res } = await api.post<{
        accessToken: string;
        user: { id: string; email: string; name: string; role: UserRole; tenantId: string; tenantSlug: string };
      }>('/auth/register', data);

      sessionStorage.setItem('access_token', res.accessToken);
      setUser(res.user);

      const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';
      const base = process.env.NODE_ENV === 'development'
        ? `http://${data.slug}.localhost:3000`
        : `https://${data.slug}.${appDomain}`;
      window.location.href = `${base}/api/auth/sync?at=${encodeURIComponent(res.accessToken)}&next=/kanban`;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? 'Erro ao criar conta';
      if (msg.includes('Subdomínio')) {
        setError('slug', { message: msg });
      } else if (msg.includes('Email')) {
        setError('email', { message: 'Este email já está registado' });
      } else {
        setError('root', { message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060609] relative overflow-hidden py-12">
      {/* Ambient orbs */}
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
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-600/30">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Criar conta grátis</h1>
          <p className="mt-1 text-sm text-gray-400">14 dias grátis, sem cartão de crédito</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">O teu nome</label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Ana Silva"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="ana@empresa.pt"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Company name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Nome do negócio</label>
              <input
                type="text"
                placeholder="Empresa Lda"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                {...register('companyName')}
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>}
            </div>

            {/* Subdomain */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Subdomínio</label>
              <div className="flex items-stretch rounded-lg border border-white/10 bg-white/[0.06] overflow-hidden transition focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20">
                <input
                  type="text"
                  placeholder="empresa"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
                  {...register('slug')}
                />
                <span className="flex items-center pr-3 text-xs text-gray-500 select-none">.wpprecebo.pt</span>
              </div>

              {/* Validation feedback */}
              <div className="mt-1.5 min-h-[1.25rem]">
                {errors.slug && (
                  <p className="text-xs text-red-400">{errors.slug.message}</p>
                )}
                {!errors.slug && subdomainState.status === 'checking' && (
                  <p className="text-xs text-gray-500">A verificar disponibilidade...</p>
                )}
                {!errors.slug && subdomainState.status === 'available' && (
                  <p className="flex items-center gap-1 text-xs text-emerald-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Subdomínio disponível
                  </p>
                )}
                {!errors.slug && subdomainState.status === 'taken' && (
                  <div>
                    <p className="flex items-center gap-1 text-xs text-red-400 mb-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Subdomínio já em uso. Sugestões:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subdomainState.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setValue('slug', s, { shouldValidate: true })}
                          className="rounded px-2 py-0.5 text-xs border border-brand-500/40 bg-brand-600/10 text-brand-400 hover:bg-brand-600/20 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errors.root && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || subdomainState.status === 'checking' || subdomainState.status === 'taken'}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-brand-600/25 mt-2"
            >
              {isSubmitting ? 'A criar conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Já tens conta?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Iniciar sessão
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
