'use client';

import { Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  fetchBilling, createCheckoutSession, createPortalSession,
  fetchStripeConnectStatus, createStripeConnectOnboardLink, disconnectStripeConnect,
} from '@/lib/billing';
import type { PlanName, StripeConnectStatus } from '@/lib/billing';

const PLANS: Array<{
  key: PlanName;
  name: string;
  price: string;
  originalPrice: string;
  description: string;
  features: string[];
  highlight?: boolean;
}> = [
  {
    key: 'START',
    name: 'Start',
    price: '€49/mês',
    originalPrice: '€89/mês',
    description: 'Para negócios que estão a começar com o WhatsApp.',
    features: ['1 número WhatsApp', 'Até 3 utilizadores', 'Kanban + CRM básico', 'Templates de resposta', 'Suporte por email'],
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '€99/mês',
    originalPrice: '€179/mês',
    description: 'Para equipas em crescimento com mais volume.',
    highlight: true,
    features: [
      '1 número WhatsApp',
      'Utilizadores ilimitados',
      'Assistente de IA 24/7',
      'Mensagens agendadas',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    price: '€199/mês',
    originalPrice: '€349/mês',
    description: 'Para grandes operações com necessidades avançadas.',
    features: [
      'Vários números WhatsApp',
      'Utilizadores ilimitados',
      'IA personalizada',
      'API & Webhooks',
      'Integração personalizada',
      'Gestor de conta dedicado',
    ],
  },
  {
    key: 'AGENDA_PRO',
    name: 'Agenda Pro',
    price: '€129/mês',
    originalPrice: '€229/mês',
    description: 'Para clínicas, salões, barbearias e consultórios.',
    features: [
      'Tudo do plano Pro',
      'Agendamento via WhatsApp com IA',
      'Gestão de serviços e profissionais',
      'Horários configuráveis por profissional',
      'Confirmação automática de marcações',
      'Histórico de marcações por cliente',
      'Painel de agenda visual',
    ],
  },
];

const PLAN_LABELS: Record<PlanName, string> = {
  START: 'Start',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
  AGENDA_PRO: 'Agenda Pro',
};

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StripeConnectCard({ connectResult }: { connectResult: string | null }): React.ReactElement {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const { data: status } = useQuery<StripeConnectStatus>({
    queryKey: ['stripe-connect-status'],
    queryFn: fetchStripeConnectStatus,
    refetchOnWindowFocus: true,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectStripeConnect,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['stripe-connect-status'] }),
  });

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      const { url } = await createStripeConnectOnboardLink();
      window.location.href = url;
    } catch {
      setError('Erro ao iniciar ligação Stripe. Verifica se o Stripe Connect está activado na tua conta.');
      setConnecting(false);
    }
  };

  const isOnboarded = status?.connected && status?.onboarded;
  const isPending = status?.connected && !status?.onboarded;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Receber Pagamentos via WhatsApp</h2>
          <p className="text-xs text-gray-500 mt-0.5">Liga a tua conta Stripe para receber pagamentos directamente dos clientes</p>
        </div>
        {isOnboarded ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ligado
          </span>
        ) : isPending ? (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            A aguardar
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            Não ligado
          </span>
        )}
      </div>

      {connectResult === 'success' && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          Conta Stripe ligada com sucesso! Podes agora criar pedidos de pagamento no WhatsApp.
        </div>
      )}
      {connectResult === 'refresh' && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
          O link de configuração expirou. Clica em "Continuar configuração" para gerar um novo.
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {isOnboarded && (
        <div className="flex items-center justify-between py-1.5 border-t border-white/[0.06] text-xs">
          <span className="text-gray-500">ID da conta</span>
          <span className="font-mono text-gray-400">{status.accountId}</span>
        </div>
      )}

      <div className="flex gap-2">
        {!isOnboarded && (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="text-sm px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-50 transition-colors"
          >
            {connecting ? 'A redirecionar...' : isPending ? 'Continuar configuração' : 'Ligar conta Stripe'}
          </button>
        )}
        {status?.connected && (
          <button
            onClick={() => {
              if (confirm('Tens a certeza que queres desligar a conta Stripe?')) {
                disconnectMutation.mutate();
              }
            }}
            disabled={disconnectMutation.isPending}
            className="text-sm px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            Desligar conta
          </button>
        )}
      </div>
    </div>
  );
}

function InvoicesContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';
  const isCancelled = searchParams.get('cancelled') === '1';
  const connectResult = searchParams.get('stripe_connect');

  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: fetchBilling,
  });

  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) => createCheckoutSession(priceId),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: createPortalSession,
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  const currentPlan = billing?.plan ?? 'START';

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 py-6 border-b border-white/[0.06]">
        <h1 className="text-xl font-semibold text-white">Plano & Faturação</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gere o teu plano e método de pagamento</p>
      </div>

      <div className="px-8 py-6 space-y-8">
        {isSuccess && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Subscrição ativada com sucesso! O teu plano foi atualizado.
          </div>
        )}
        {isCancelled && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
            O processo de subscrição foi cancelado. Podes tentar novamente quando quiseres.
          </div>
        )}
        {/* Current plan summary */}
        {!isLoading && billing && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plano atual</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{PLAN_LABELS[currentPlan] ?? currentPlan}</span>
                {billing.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                    Ativo
                  </span>
                )}
                {billing.status === 'CANCELLED' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                    Cancelado
                  </span>
                )}
                {billing.status === 'SUSPENDED' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                    Suspenso
                  </span>
                )}
              </div>
              {billing.currentPeriodEnd && (
                <p className="text-sm text-gray-500 mt-1">
                  {billing.cancelAtPeriodEnd
                    ? `Cancela em ${formatDate(billing.currentPeriodEnd)}`
                    : `Renova em ${formatDate(billing.currentPeriodEnd)}`}
                </p>
              )}
            </div>
            {billing.hasSubscription && (
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                className="flex-shrink-0 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/[0.08] transition-colors disabled:opacity-50"
              >
                {portalMutation.isPending ? 'A redirecionar…' : 'Gerir faturação'}
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="h-24 rounded-xl border border-white/[0.08] bg-white/[0.02] animate-pulse" />
        )}

        {/* Stripe Connect */}
        <StripeConnectCard connectResult={connectResult} />

        {/* Plan cards */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-4">Planos disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const priceId = billing?.prices?.[plan.key];
              const isCurrent = currentPlan === plan.key;
              const planOrder: PlanName[] = ['START', 'PRO', 'ENTERPRISE', 'AGENDA_PRO'];
              const isHigher = planOrder.indexOf(plan.key) > planOrder.indexOf(currentPlan);

              const isAgendaPro = plan.key === 'AGENDA_PRO';

              return (
                <div
                  key={plan.key}
                  className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-colors ${
                    isAgendaPro
                      ? 'border-emerald-500/40 bg-emerald-600/5'
                      : plan.highlight
                        ? 'border-brand-500/40 bg-brand-600/5'
                        : 'border-white/[0.08] bg-white/[0.02]'
                  } ${isCurrent ? 'ring-1 ring-brand-500/30' : ''}`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white">
                      Popular
                    </span>
                  )}
                  {isAgendaPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white whitespace-nowrap">
                      Para clínicas & salões
                    </span>
                  )}

                  {/* Badge oferta lançamento */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
                      🎉 Oferta de lançamento
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-base font-semibold ${isAgendaPro ? 'text-emerald-300' : 'text-white'}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-white">{plan.price}</p>
                      <p className="text-sm text-gray-600 line-through">{plan.originalPrice}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={isCurrent || checkoutMutation.isPending || !priceId}
                    onClick={() => {
                      if (priceId && !isCurrent) {
                        checkoutMutation.mutate(priceId);
                      }
                    }}
                    className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-white/[0.06] text-gray-500 cursor-default'
                        : isAgendaPro
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50'
                          : plan.highlight
                            ? 'bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50'
                            : 'border border-white/[0.12] bg-white/[0.04] text-gray-200 hover:bg-white/[0.08] disabled:opacity-50'
                    }`}
                  >
                    {isCurrent
                      ? 'Plano atual'
                      : checkoutMutation.isPending
                        ? 'A redirecionar…'
                        : isHigher
                          ? 'Fazer upgrade'
                          : 'Escolher plano'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-600 text-center">
          Todos os preços incluem IVA. Podes cancelar a qualquer momento através do portal de faturação.
        </p>
      </div>
    </div>
  );
}

export default function InvoicesPage(): React.ReactElement {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}
