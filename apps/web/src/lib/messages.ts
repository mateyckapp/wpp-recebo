import { api } from './api';

export interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  sentByAI: boolean;
  createdAt: string;
  sentByUser: { id: string; name: string } | null;
}

export interface MessagesPage {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function fetchMessages(
  conversationId: string,
  cursor?: string,
): Promise<MessagesPage> {
  const { data } = await api.get<MessagesPage>(
    `/conversations/${conversationId}/messages`,
    { params: cursor ? { cursor } : {} },
  );
  return data;
}

export async function sendMessage(conversationId: string, text: string): Promise<Message> {
  const { data } = await api.post<Message>(
    `/conversations/${conversationId}/messages`,
    { text },
  );
  return data;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await api.patch(`/conversations/${conversationId}/read`);
}
