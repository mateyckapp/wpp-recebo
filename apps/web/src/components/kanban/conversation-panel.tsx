'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, sendMessage, markConversationRead, type Message } from '@/lib/messages';
import { fetchTemplates, scheduleMessage, type MessageTemplate } from '@/lib/templates';
import { getSocket } from '@/lib/socket';

interface ConversationPanelProps {
  conversationId: string;
  onClose: () => void;
}

function MessageBubble({ message }: { message: Message }) {
  const isOutbound = message.direction === 'OUTBOUND';
  const time = new Date(message.createdAt).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusIcon: Record<string, string> = {
    SENT: '✓',
    DELIVERED: '✓✓',
    READ: '✓✓',
    FAILED: '✗',
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isOutbound
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-white/[0.08] text-gray-200 rounded-bl-sm border border-white/[0.06]'
        }`}
      >
        {message.content ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <p className="italic text-sm opacity-70">[{message.type.toLowerCase()}]</p>
        )}
        <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOutbound ? 'text-white/70' : 'text-gray-400'}`}>
          <span className="text-[10px]">{time}</span>
          {isOutbound && (
            <span className={`text-[10px] ${message.status === 'READ' ? 'text-blue-300' : ''}`}>
              {statusIcon[message.status] ?? '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplatePicker({
  templates,
  onSelect,
  onClose,
}: {
  templates: MessageTemplate[];
  onSelect: (content: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortcut.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#0d0d14] rounded-xl border border-white/[0.1] shadow-xl z-10 overflow-hidden">
      <div className="p-2 border-b border-white/[0.06]">
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar template..."
          className="w-full text-sm px-2 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">Sem resultados</p>
        )}
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => { onSelect(t.content); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-400 bg-brand-600/15 border border-brand-500/20 px-1.5 py-0.5 rounded">
                /{t.shortcut}
              </span>
              <span className="text-sm font-medium text-gray-300 truncate">{t.name}</span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{t.content}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScheduleModal({
  text,
  conversationId,
  onClose,
}: {
  text: string;
  conversationId: string;
  onClose: () => void;
}) {
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 1);
  const minStr = minDate.toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledFor) return;
    setLoading(true);
    setError('');
    try {
      await scheduleMessage(conversationId, text, new Date(scheduledFor).toISOString());
      onClose();
    } catch {
      setError('Erro ao agendar mensagem. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d14] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <h3 className="font-semibold text-gray-100 mb-1">Agendar mensagem</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 bg-white/[0.04] rounded-lg px-3 py-2">
          {text}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Data e hora de envio
            </label>
            <input
              type="datetime-local"
              min={minStr}
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              required
              className="w-full text-sm bg-white/[0.06] border border-white/[0.1] text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm border border-white/[0.1] text-gray-400 rounded-xl py-2 hover:bg-white/[0.04] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !scheduledFor}
              className="flex-1 text-sm bg-brand-600 text-white rounded-xl py-2 hover:bg-brand-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'A agendar...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ConversationPanel({ conversationId, onClose }: ConversationPanelProps) {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const socket = getSocket();
    const handleNewMessage = (payload: { conversationId: string; message: Message }) => {
      if (payload.conversationId !== conversationId) return;
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: typeof data) =>
          old
            ? { ...old, items: [...old.items.filter((m) => m.id !== payload.message.id), payload.message] }
            : { items: [payload.message], nextCursor: null, hasMore: false },
      );
    };
    socket.on('new_message', handleNewMessage);
    return () => { socket.off('new_message', handleNewMessage); };
  }, [conversationId, queryClient, data]);

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    staleTime: 60_000,
  });

  const sendMutation = useMutation({
    mutationFn: (t: string) => sendMessage(conversationId, t),
    onSuccess: (newMsg) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: typeof data) =>
          old
            ? { ...old, items: [...old.items.filter((m) => m.id !== newMsg.id), newMsg] }
            : { items: [newMsg], nextCursor: null, hasMore: false },
      );
      void queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
    },
  });

  useEffect(() => {
    void markConversationRead(conversationId);
    void queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
  }, [conversationId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.items]);

  // seletor de template com "/" no início do texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (val === '/') setShowTemplates(true);
    else if (!val.startsWith('/')) setShowTemplates(false);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText('');
    setShowTemplates(false);
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') setShowTemplates(false);
  };

  const messages: Message[] = data?.items ?? [];

  return (
    <div className="flex flex-col h-full bg-[#060609]">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 -ml-1"
          aria-label="Fechar"
        >
          ✕
        </button>
        <span className="font-semibold text-gray-200 text-sm">Conversa</span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading && (
          <div className="text-center text-gray-500 text-sm mt-8">A carregar...</div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">Sem mensagens</div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/[0.06]">
        {/* Barra de acções */}
        <div className="flex items-center gap-2 px-4 pt-2">
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="text-xs text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
            title="Templates (ou escreva /)"
          >
            <span>⚡</span> Templates
          </button>
        </div>

        {sendMutation.isError && (
          <p className="px-4 pb-1 text-xs text-red-400">
            Erro ao enviar mensagem. Verifica os logs da API.
          </p>
        )}

        {/* Campo de texto */}
        <div className="relative flex items-end gap-2 px-4 pb-3 pt-1">
          {showTemplates && templates.length > 0 && (
            <TemplatePicker
              templates={templates}
              onSelect={(content) => { setText(content); setShowTemplates(false); }}
              onClose={() => setShowTemplates(false)}
            />
          )}

          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem... (/ para templates)"
            rows={1}
            className={`flex-1 resize-none rounded-xl bg-white/[0.06] border text-gray-200 placeholder-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 max-h-32 overflow-y-auto ${
              sendMutation.isError ? 'border-red-500/60' : 'border-white/[0.08]'
            }`}
            style={{ lineHeight: '1.4' }}
          />

          {/* Botão agendar */}
          <button
            onClick={() => { if (text.trim()) setShowSchedule(true); }}
            disabled={!text.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-full border border-white/[0.1] text-gray-500 flex items-center justify-center disabled:opacity-30 hover:border-brand-500/40 hover:text-brand-400 transition-colors"
            title="Agendar mensagem"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>

          {/* Botão enviar */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-emerald-500 transition-colors"
            aria-label="Enviar"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de agendamento */}
      {showSchedule && (
        <ScheduleModal
          text={text}
          conversationId={conversationId}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}
