import { api } from './api';

export interface MessageTemplate {
  id: string;
  name: string;
  shortcut: string;
  content: string;
  createdAt: string;
}

export async function fetchTemplates(): Promise<MessageTemplate[]> {
  const { data } = await api.get<MessageTemplate[]>('/templates');
  return data;
}

export async function createTemplate(
  payload: Pick<MessageTemplate, 'name' | 'shortcut' | 'content'>,
): Promise<MessageTemplate> {
  const { data } = await api.post<MessageTemplate>('/templates', payload);
  return data;
}

export async function updateTemplate(
  id: string,
  payload: Partial<Pick<MessageTemplate, 'name' | 'shortcut' | 'content'>>,
): Promise<MessageTemplate> {
  const { data } = await api.patch<MessageTemplate>(`/templates/${id}`, payload);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}

export async function scheduleMessage(
  conversationId: string,
  content: string,
  scheduledFor: string,
): Promise<void> {
  await api.post('/scheduled-messages', { conversationId, content, scheduledFor });
}
