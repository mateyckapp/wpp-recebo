import { api } from './api';

export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  plan: string;
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappAccessToken: string | null;
  whatsappTokenConfigured: boolean;
}

export interface WhatsappTestResult {
  ok: boolean;
  phoneNumber?: string;
  error?: string;
}

export async function fetchSettings(): Promise<TenantSettings> {
  const { data } = await api.get<TenantSettings>('/settings');
  return data;
}

export async function updateWhatsappSettings(body: {
  whatsappPhoneNumberId?: string;
  whatsappBusinessAccountId?: string;
  whatsappAccessToken?: string;
}): Promise<TenantSettings> {
  const { data } = await api.patch<TenantSettings>('/settings/whatsapp', body);
  return data;
}

export async function testWhatsappConnection(): Promise<WhatsappTestResult> {
  const { data } = await api.post<WhatsappTestResult>('/settings/whatsapp/test');
  return data;
}
