import { api } from './api';

export interface KanbanTag {
  id: string;
  name: string;
  color: string;
}

export interface KanbanContact {
  id: string;
  name: string | null;
  phoneNumber: string;
  avatarUrl: string | null;
}

export interface KanbanLastMessage {
  content: string | null;
  type: string;
  direction: string;
  createdAt: string;
}

export interface KanbanConversation {
  id: string;
  status: string;
  unreadCount: number;
  lastMessageAt: string | null;
  estimatedValue: number | null;
  aiEnabled: boolean;
  contact: KanbanContact;
  assignedUser: { id: string; name: string } | null;
  tags: KanbanTag[];
  lastMessage: KanbanLastMessage | null;
}

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  conversations: KanbanConversation[];
}

export interface KanbanColumnConfig {
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  _count: { conversations: number };
}

export async function fetchBoard(): Promise<KanbanColumn[]> {
  const { data } = await api.get<KanbanColumn[]>('/kanban');
  return data;
}

export async function moveConversation(conversationId: string, columnId: string): Promise<void> {
  await api.patch(`/kanban/conversations/${conversationId}/move`, { columnId });
}

// ── Column management ──────────────────────────────────────────────────────

export const fetchColumns = () =>
  api.get<KanbanColumnConfig[]>('/kanban/columns').then((r) => r.data);

export const createColumn = (data: { name: string; color: string }) =>
  api.post<KanbanColumnConfig>('/kanban/columns', data).then((r) => r.data);

export const updateColumn = (id: string, data: { name?: string; color?: string }) =>
  api.patch<KanbanColumnConfig>(`/kanban/columns/${id}`, data).then((r) => r.data);

export const deleteColumn = (id: string) =>
  api.delete(`/kanban/columns/${id}`);

export const reorderColumns = (orderedIds: string[]) =>
  api.patch<KanbanColumnConfig[]>('/kanban/columns/reorder', { orderedIds }).then((r) => r.data);
