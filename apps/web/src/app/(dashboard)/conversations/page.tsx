'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConversations, type Conversation } from '@/lib/conversations';
import { ConversationPanel } from '@/components/kanban/conversation-panel';
import { getSocket } from '@/lib/socket';

const STATUSES = [
  { value: 'OPEN', label: 'Abertas' },
  { value: 'CLOSED', label: 'Fechadas' },
  { value: 'ARCHIVED', label: 'Arquivadas' },
];

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isToday) return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

function lastMessagePreview(conv: Conversation): string {
  const msg = conv.lastMessage;
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
  if (name) return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return phone.slice(-2);
}

function ConversationRow({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const name = conv.contact.name ?? conv.contact.phoneNumber;
  const preview = lastMessagePreview(conv);
  const isInbound = conv.lastMessage?.direction === 'INBOUND';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left border-b border-white/[0.04] ${
        selected
          ? 'bg-brand-600/15 border-l-2 border-l-brand-500'
          : 'hover:bg-white/[0.04] border-l-2 border-l-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
        {initials(conv.contact.name, conv.contact.phoneNumber)}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm font-medium truncate ${selected ? 'text-brand-300' : 'text-gray-200'}`}>
            {name}
          </span>
          <span className="text-[11px] text-gray-500 flex-shrink-0">
            {formatTime(conv.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 truncate flex-1">
            {isInbound ? '' : <span className="text-gray-600">Tu: </span>}
            {preview}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
        {conv.kanbanColumn && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: conv.kanbanColumn.color }}
            />
            <span className="text-[10px] text-gray-600">{conv.kanbanColumn.name}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function ConversationsPage(): React.ReactElement {
  const [status, setStatus] = useState('OPEN');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', status, search],
    queryFn: () => fetchConversations({ status, search: search || undefined }),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    socket.on('conversation_updated', refresh);
    return () => { socket.off('conversation_updated', refresh); };
  }, [queryClient]);

  const conversations = data?.items ?? [];

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Painel esquerdo — lista */}
      <div className={`flex flex-col border-r border-white/[0.06] ${selectedId ? 'hidden md:flex md:w-80 lg:w-96' : 'w-full md:w-80 lg:w-96'}`}>
        {/* Cabeçalho */}
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.06] flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-100 mb-3">Conversas</h1>

          {/* Pesquisa */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por nome ou número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/[0.05] border border-white/[0.08] rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition"
            />
          </div>

          {/* Filtros de estado */}
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                  status === s.value
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-gray-500">A carregar...</span>
            </div>
          )}

          {!isLoading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Sem conversas {status === 'OPEN' ? 'abertas' : status === 'CLOSED' ? 'fechadas' : 'arquivadas'}</p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-xs text-brand-400 hover:text-brand-300">
                  Limpar pesquisa
                </button>
              )}
            </div>
          )}

          {conversations.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              selected={selectedId === conv.id}
              onClick={() => setSelectedId(conv.id)}
            />
          ))}
        </div>

        {data && data.total > 0 && (
          <div className="px-4 py-2 border-t border-white/[0.04] flex-shrink-0">
            <p className="text-xs text-gray-600 text-center">{data.total} conversa{data.total !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Painel direito — conversa selecionada */}
      {selectedId ? (
        <div className="flex-1 min-w-0">
          <ConversationPanel
            conversationId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Seleciona uma conversa</p>
          </div>
        </div>
      )}
    </div>
  );
}
