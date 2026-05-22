import axios from 'axios';

const adminApi = axios.create({ baseURL: '/api/admin' });

export type Plan = 'START' | 'PRO' | 'ENTERPRISE' | 'AGENDA_PRO';
export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  status: TenantStatus;
  createdAt: string;
  mrr: number;
  whatsappPhoneNumberId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  _count: { users: number; appointments: number; messages: number };
}

export interface AdminStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  cancelled: number;
  mrr: number;
  newThisMonth: number;
  newLast30Days: number;
  planDistribution: { plan: Plan; count: number; revenue: number }[];
  totalMessages: number;
  messagesToday: number;
  totalAppointments: number;
  appointmentsThisWeek: number;
  activeWhatsapp: number;
}

export interface BillingOverview {
  mrr: number;
  arr: number;
  projection: { month: string; revenue: number }[];
  planBreakdown: { plan: Plan; count: number; monthly: number; annual: number }[];
}

export const getAdminStats = () => adminApi.get<AdminStats>('/stats').then((r) => r.data);

export const getAdminTenants = (search?: string) =>
  adminApi.get<AdminTenant[]>('/tenants', { params: search ? { search } : {} }).then((r) => r.data);

export const updateAdminTenant = (id: string, data: { plan?: Plan; status?: TenantStatus }) =>
  adminApi.patch<AdminTenant>(`/tenants/${id}`, data).then((r) => r.data);

export const getAdminBilling = () => adminApi.get<BillingOverview>('/billing').then((r) => r.data);

export const getAdminConfig = () => adminApi.get<Record<string, string>>('/config').then((r) => r.data);

export const upsertAdminConfig = (key: string, value: string) =>
  adminApi.post('/config', { key, value }).then((r) => r.data);

export const adminLogin = (password: string) =>
  axios.post('/api/admin/login', { password }).then((r) => r.data);

export const adminLogout = () => axios.post('/api/admin/logout').then((r) => r.data);

export const PLAN_LABELS: Record<Plan, string> = {
  START: 'Start',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
  AGENDA_PRO: 'Agenda Pro',
};

export const PLAN_COLORS: Record<Plan, string> = {
  START: '#6B7280',
  PRO: '#3B82F6',
  ENTERPRISE: '#8B5CF6',
  AGENDA_PRO: '#10B981',
};

export const STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: 'Ativo',
  TRIAL: 'Trial',
  SUSPENDED: 'Suspenso',
  CANCELLED: 'Cancelado',
};

export const STATUS_COLORS: Record<TenantStatus, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10 border-green-400/20',
  TRIAL: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  SUSPENDED: 'text-red-400 bg-red-400/10 border-red-400/20',
  CANCELLED: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};
