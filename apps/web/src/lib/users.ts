import { api } from './api';

export interface TeamMember {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'AGENT';
  isActive: boolean;
  lastSeen: string | null;
  createdAt: string;
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data } = await api.get<TeamMember[]>('/users');
  return data;
}

export async function createTeamMember(body: {
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  password: string;
}): Promise<TeamMember> {
  const { data } = await api.post<TeamMember>('/users', body);
  return data;
}

export async function updateTeamMember(
  id: string,
  body: { name?: string; role?: 'ADMIN' | 'AGENT'; isActive?: boolean },
): Promise<TeamMember> {
  const { data } = await api.patch<TeamMember>(`/users/${id}`, body);
  return data;
}

export async function removeTeamMember(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function updateProfile(body: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ id: string; name: string; email: string }> {
  const { data } = await api.patch<{ id: string; name: string; email: string }>('/auth/profile', body);
  return data;
}
