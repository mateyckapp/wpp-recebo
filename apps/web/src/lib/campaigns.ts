import { api } from './api';

export type CampaignStatus = 'DRAFT' | 'SENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface Campaign {
  id: string;
  name: string;
  message: string;
  groupId: string;
  group: { id: string; name: string; color: string };
  status: CampaignStatus;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<Campaign[]>('/campaigns');
  return data;
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  const { data } = await api.get<Campaign>(`/campaigns/${id}`);
  return data;
}

export async function createCampaign(body: {
  name: string;
  message: string;
  groupId: string;
}): Promise<Campaign> {
  const { data } = await api.post<Campaign>('/campaigns', body);
  return data;
}

export async function sendCampaign(id: string): Promise<{ started: boolean; total: number }> {
  const { data } = await api.post(`/campaigns/${id}/send`);
  return data;
}

export async function cancelCampaign(id: string): Promise<void> {
  await api.post(`/campaigns/${id}/cancel`);
}

export async function deleteCampaign(id: string): Promise<void> {
  await api.delete(`/campaigns/${id}`);
}
