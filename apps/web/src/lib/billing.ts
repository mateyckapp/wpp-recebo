import { api } from './api';

export type PlanName = 'START' | 'PRO' | 'ENTERPRISE' | 'AGENDA_PRO';

export interface BillingInfo {
  plan: PlanName;
  status: string;
  hasSubscription: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  prices: {
    START: string;
    PRO: string;
    ENTERPRISE: string;
    AGENDA_PRO: string;
  };
}

export async function fetchBilling(): Promise<BillingInfo> {
  const { data } = await api.get<BillingInfo>('/billing');
  return data;
}

export async function createCheckoutSession(priceId: string): Promise<{ url: string }> {
  const appUrl = window.location.origin;
  const { data } = await api.post<{ url: string }>(
    '/billing/checkout',
    { priceId },
    { headers: { 'x-app-url': appUrl } },
  );
  return data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const appUrl = window.location.origin;
  const { data } = await api.post<{ url: string }>(
    '/billing/portal',
    {},
    { headers: { 'x-app-url': appUrl } },
  );
  return data;
}

export interface StripeConnectStatus {
  connected: boolean;
  onboarded: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export async function fetchStripeConnectStatus(): Promise<StripeConnectStatus> {
  const { data } = await api.get<StripeConnectStatus>('/billing/stripe-connect/status');
  return data;
}

export async function createStripeConnectOnboardLink(): Promise<{ url: string }> {
  const appUrl = window.location.origin;
  const { data } = await api.post<{ url: string }>(
    '/billing/stripe-connect/onboard',
    {},
    { headers: { 'x-app-url': appUrl } },
  );
  return data;
}

export async function disconnectStripeConnect(): Promise<void> {
  await api.delete('/billing/stripe-connect');
}
