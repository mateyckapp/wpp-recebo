import { api } from './api';

export interface Branding {
  logoUrl: string | null;
  primaryColor: string;
  name: string;
}

export async function fetchBranding(): Promise<Branding> {
  const { data } = await api.get<Branding>('/settings/branding');
  return data;
}

export async function updateBranding(body: { logoUrl?: string | null; primaryColor?: string }): Promise<Branding> {
  const { data } = await api.patch<Branding>('/settings/branding', body);
  return data;
}
