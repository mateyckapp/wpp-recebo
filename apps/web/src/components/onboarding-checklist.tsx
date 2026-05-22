'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchOnboardingStatus, countCompleted, TOTAL_STEPS } from '@/lib/onboarding';
import type { OnboardingStatus } from '@/lib/onboarding';

interface Step {
  key: keyof OnboardingStatus;
  label: string;
  description: string;
  href: string;
  cta: string;
}

const STEPS: Step[] = [
  {
    key: 'accountCreated',
    label: 'Cria a tua conta',
    description: 'Estás registado e pronto a usar a plataforma.',
    href: '',
    cta: '',
  },
  {
    key: 'whatsappConfigured',
    label: 'Liga o WhatsApp',
    description: 'Configura as credenciais do WhatsApp Business API.',
    href: '/settings',
    cta: 'Ir para Definições',
  },
  {
    key: 'teamMemberInvited',
    label: 'Convida um agente',
    description: 'Adiciona um membro da equipa para gerir conversas.',
    href: '/settings',
    cta: 'Gerir Equipa',
  },
  {
    key: 'messageSent',
    label: 'Envia a primeira mensagem',
    description: 'Responde a uma conversa no painel para começar.',
    href: '/conversations',
    cta: 'Ver Conversas',
  },
];

interface Props {
  onClose: () => void;
  onDismiss: () => void;
}

function StepItem({ step, done, router, onClose }: { step: Step; done: boolean; router: ReturnType<typeof useRouter>; onClose: () => void }) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg transition-colors ${done ? 'opacity-60' : 'hover:bg-white/[0.03]'}`}>
      <div className="flex-shrink-0 mt-0.5">
        {done ? (
          <div className="h-5 w-5 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center">
            <svg className="h-3 w-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-white/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
          {step.label}
        </p>
        {!done && (
          <>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
            {step.href && (
              <button
                onClick={() => { router.push(step.href); onClose(); }}
                className="mt-2 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                {step.cta} →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function OnboardingChecklist({ onClose, onDismiss }: Props) {
  const router = useRouter();
  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingStatus,
    staleTime: 30_000,
  });

  const completed = status ? countCompleted(status) : 0;
  const progress = Math.round((completed / TOTAL_STEPS) * 100);
  const allDone = completed === TOTAL_STEPS;

  return (
    <div className="absolute left-full bottom-16 ml-3 w-72 z-50 rounded-xl border border-white/[0.08] bg-[#0f0f1a] shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div>
          <p className="text-sm font-semibold text-white">
            {allDone ? 'Configuração completa!' : 'Primeiros passos'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {completed}/{TOTAL_STEPS} passos concluídos
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-2 space-y-0.5">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-gray-600">A carregar...</div>
        ) : (
          STEPS.map((step) => (
            <StepItem
              key={step.key}
              step={step}
              done={status?.[step.key] ?? false}
              router={router}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {allDone && (
        <div className="px-4 pb-4 pt-1 flex flex-col items-center gap-2">
          <p className="text-xs text-center text-gray-500">
            Tudo pronto! A plataforma está configurada e operacional.
          </p>
          <button
            onClick={onDismiss}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            Fechar e não mostrar novamente
          </button>
        </div>
      )}
    </div>
  );
}
