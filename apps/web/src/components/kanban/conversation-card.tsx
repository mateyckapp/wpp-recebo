'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanConversation } from '@/lib/kanban';

interface ConversationCardProps {
  conversation: KanbanConversation;
  onClick: () => void;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

function lastMessagePreview(conversation: KanbanConversation): string {
  const msg = conversation.lastMessage;
  if (!msg) return 'Sem mensagens';
  if (msg.content) return msg.content;
  const labels: Record<string, string> = {
    IMAGE: '📷 Imagem',
    AUDIO: '🎵 Áudio',
    VIDEO: '🎬 Vídeo',
    DOCUMENT: '📄 Documento',
    LOCATION: '📍 Localização',
  };
  return labels[msg.type] ?? '📎 Ficheiro';
}

function initials(name: string | null, phone: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  return phone.slice(-2);
}

export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: conversation.id,
    data: { type: 'conversation', conversation },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const contactName = conversation.contact.name ?? conversation.contact.phoneNumber;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white/[0.05] rounded-lg border border-white/[0.08] p-3 cursor-pointer hover:border-brand-500/40 hover:bg-white/[0.07] transition-all select-none"
    >
      {/* Header: avatar + nome + hora */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-xs font-semibold">
          {initials(conversation.contact.name, conversation.contact.phoneNumber)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium text-gray-200 truncate">{contactName}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {lastMessagePreview(conversation)}
          </p>
        </div>
      </div>

      {/* Footer: tags + unread badge */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex flex-wrap gap-1">
          {conversation.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        {conversation.unreadCount > 0 && (
          <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
