import { api } from './api';

export interface OnboardingStatus {
  accountCreated: boolean;
  whatsappConfigured: boolean;
  messageSent: boolean;
  templateCreated: boolean;
  teamMemberInvited: boolean;
}

export interface OnboardingStep {
  key: keyof OnboardingStatus;
  label: string;
  description: string;
  href: string | null;
  actionLabel: string | null;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: 'accountCreated',
    label: 'Conta criada',
    description: 'Bem-vindo ao WppRecebo!',
    href: null,
    actionLabel: null,
  },
  {
    key: 'whatsappConfigured',
    label: 'Conectar WhatsApp',
    description: 'Liga a tua conta do WhatsApp Business para começar a receber mensagens.',
    href: '/settings',
    actionLabel: 'Ir para Configurações →',
  },
  {
    key: 'messageSent',
    label: 'Enviar primeira mensagem',
    description: 'Responde a uma conversa e vê o fluxo em ação.',
    href: '/conversations',
    actionLabel: 'Ver Conversas →',
  },
  {
    key: 'templateCreated',
    label: 'Criar template de resposta rápida',
    description: 'Cria atalhos de texto para responder mais depressa.',
    href: '/settings',
    actionLabel: 'Criar Template →',
  },
  {
    key: 'teamMemberInvited',
    label: 'Convidar membro da equipa',
    description: 'Adiciona alguém da tua equipa para colaborar.',
    href: '/settings',
    actionLabel: 'Convidar →',
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export function countCompleted(status: OnboardingStatus): number {
  return Object.values(status).filter(Boolean).length;
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatus> {
  const { data } = await api.get<OnboardingStatus>('/settings/onboarding');
  return data;
}
