import type { Plan, TenantStatus, UserRole, ConversationStatus, MessageDirection, MessageType, MessageStatus } from './enums';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
  status: TenantStatus;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

export interface Contact {
  id: string;
  tenantId: string;
  phoneNumber: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
  notes?: string;
  lastInteraction?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  assignedUserId?: string;
  kanbanColumnId: string;
  status: ConversationStatus;
  estimatedValue?: number;
  aiEnabled: boolean;
  unreadCount: number;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  whatsappId?: string;
  direction: MessageDirection;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  transcription?: string;
  sentByUserId?: string;
  sentByAI: boolean;
  status: MessageStatus;
  createdAt: Date;
}

export interface KanbanColumn {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
}

export interface Tag {
  id: string;
  tenantId: string;
  name: string;
  color: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
