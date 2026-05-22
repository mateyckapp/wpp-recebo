import { api } from './api';

export interface AnalyticsSummary {
  conversations: { total: number; open: number; closed: number };
  messages: { total: number; sent: number; received: number };
  contacts: { total: number; new30d: number };
  appointments: { total: number; byStatus: Record<string, number> };
  messagesPerDay: Array<{ day: string; sent: number; received: number }>;
  topAgents: Array<{ name: string; count: number }>;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>('/analytics');
  return data;
}
