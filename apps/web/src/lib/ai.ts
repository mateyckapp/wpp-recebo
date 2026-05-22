import { api } from './api';

export interface AiConfig {
  id?: string;
  tenantId?: string;
  isEnabled: boolean;
  businessContext: string | null;
  fallbackToHuman: boolean;
}

export async function fetchAiConfig(): Promise<AiConfig> {
  const { data } = await api.get<AiConfig>('/ai/config');
  return data;
}

export async function updateAiConfig(config: Partial<AiConfig>): Promise<AiConfig> {
  const { data } = await api.put<AiConfig>('/ai/config', config);
  return data;
}
