import { api } from './api';

export interface ContactGroup {
  id: string;
  name: string;
  color: string;
  contactCount: number;
  createdAt: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  notes: string | null;
  avatarUrl: string | null;
  lastInteraction: string | null;
  createdAt: string;
  _count: { conversations: number };
  groups: { id: string; name: string; color: string }[];
}

export interface ContactDetail extends Contact {
  conversations: {
    id: string;
    status: string;
    unreadCount: number;
    lastMessageAt: string | null;
    kanbanColumn: { name: string; color: string } | null;
  }[];
  groups: { id: string; name: string; color: string }[];
}

export interface ContactListResponse {
  items: Contact[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchContacts(params: {
  search?: string;
  groupId?: string;
  page?: number;
  limit?: number;
}): Promise<ContactListResponse> {
  const { data } = await api.get<ContactListResponse>('/contacts', { params });
  return data;
}

export async function fetchGroups(): Promise<ContactGroup[]> {
  const { data } = await api.get<ContactGroup[]>('/contacts/groups/list');
  return data;
}

export async function createGroup(body: { name: string; color?: string }): Promise<ContactGroup> {
  const { data } = await api.post<ContactGroup>('/contacts/groups', body);
  return data;
}

export async function deleteGroup(id: string): Promise<void> {
  await api.delete(`/contacts/groups/${id}`);
}

export async function addContactToGroup(groupId: string, contactId: string): Promise<void> {
  await api.post(`/contacts/groups/${groupId}/members/${contactId}`);
}

export async function removeContactFromGroup(groupId: string, contactId: string): Promise<void> {
  await api.delete(`/contacts/groups/${groupId}/members/${contactId}`);
}

export async function fetchContact(id: string): Promise<ContactDetail> {
  const { data } = await api.get<ContactDetail>(`/contacts/${id}`);
  return data;
}

export async function updateContact(
  id: string,
  body: { name?: string; email?: string; notes?: string },
): Promise<Contact> {
  const { data } = await api.patch<Contact>(`/contacts/${id}`, body);
  return data;
}
