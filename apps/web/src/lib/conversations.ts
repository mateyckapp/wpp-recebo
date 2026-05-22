import { api } from './api';
import type { KanbanConversation } from './kanban';

export type Conversation = KanbanConversation & {
  status: string;
  kanbanColumn: { id: string; name: string; color: string } | null;
};

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchConversations(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ConversationListResponse> {
  const { data } = await api.get<ConversationListResponse>('/conversations', { params });
  return data;
}
