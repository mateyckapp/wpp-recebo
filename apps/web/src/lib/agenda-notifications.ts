import { api } from './api';

export interface NotificationConfig {
  id: string;
  tenantId: string;
  confirmationEnabled: boolean;
  confirmationDelayMinutes: number;
  confirmationTemplate: string;
  reminder2dEnabled: boolean;
  reminder2dTemplate: string;
  reminder1dEnabled: boolean;
  reminder1dTemplate: string;
  reminder2hEnabled: boolean;
  reminder2hTemplate: string;
  reminder1hEnabled: boolean;
  reminder1hTemplate: string;
  updatedAt: string;
}

export const getNotificationConfig = () =>
  api.get<NotificationConfig>('/agenda/notifications/config').then((r) => r.data);

export const upsertNotificationConfig = (data: Partial<NotificationConfig>) =>
  api.put<NotificationConfig>('/agenda/notifications/config', data).then((r) => r.data);

// ── Template texts ready for Meta submission ──────────────────────────────────

export const TEMPLATE_TEXTS = {
  confirmation: {
    name: 'appointment_confirmation',
    body: `Olá {{1}}! 👋\n\nO seu agendamento foi confirmado:\n\n*Serviço:* {{2}}\n*Profissional:* {{3}}\n*Data:* {{4}}\n*Hora:* {{5}}\n\nAté já! 😊`,
    variables: ['Nome do cliente', 'Nome do serviço', 'Nome do profissional', 'Data (ex: segunda, 23 de maio)', 'Hora (ex: 14:30)'],
  },
  reminder2d: {
    name: 'appointment_reminder_2d',
    body: `Olá {{1}}! 👋\n\nLembramos que tem um agendamento *daqui a 2 dias*:\n\n*Serviço:* {{2}}\n*Profissional:* {{3}}\n*Data:* {{4}}\n*Hora:* {{5}}\n\nAté já! 😊`,
    variables: ['Nome do cliente', 'Nome do serviço', 'Nome do profissional', 'Data', 'Hora'],
  },
  reminder1d: {
    name: 'appointment_reminder_1d',
    body: `Olá {{1}}! 👋\n\nLembramos que tem um agendamento *amanhã*:\n\n*Serviço:* {{2}}\n*Profissional:* {{3}}\n*Data:* {{4}}\n*Hora:* {{5}}\n\nAté já! 😊`,
    variables: ['Nome do cliente', 'Nome do serviço', 'Nome do profissional', 'Data', 'Hora'],
  },
  reminder2h: {
    name: 'appointment_reminder_2h',
    body: `Olá {{1}}! 👋\n\nLembramos que tem um agendamento *daqui a 2 horas*:\n\n*Serviço:* {{2}}\n*Profissional:* {{3}}\n*Data:* {{4}}\n*Hora:* {{5}}\n\nAté já! 😊`,
    variables: ['Nome do cliente', 'Nome do serviço', 'Nome do profissional', 'Data', 'Hora'],
  },
  reminder1h: {
    name: 'appointment_reminder_1h',
    body: `Olá {{1}}! 👋\n\nLembramos que tem um agendamento *daqui a 1 hora*:\n\n*Serviço:* {{2}}\n*Profissional:* {{3}}\n*Data:* {{4}}\n*Hora:* {{5}}\n\nAté já! 😊`,
    variables: ['Nome do cliente', 'Nome do serviço', 'Nome do profissional', 'Data', 'Hora'],
  },
} as const;
