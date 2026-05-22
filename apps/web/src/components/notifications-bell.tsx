'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationsStore, unreadCount, type AppNotification } from '@/stores/notifications.store';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const TYPE_ICON: Record<AppNotification['type'], string> = {
  message: '💬',
  appointment: '📅',
  system: '🔔',
};

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const count = unreadCount(notifications);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors"
        title="Notificações"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full bottom-0 ml-2 w-80 z-50 rounded-xl border border-white/[0.08] bg-[#0f0f1a] shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-semibold text-gray-200">Notificações</span>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">Sem notificações</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.href) { router.push(n.href); setOpen(false); }
                    else markRead(n.id);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.04] ${!n.read ? 'bg-brand-600/5' : ''}`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${n.read ? 'text-gray-400' : 'text-gray-200'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">{timeAgo(n.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                  </div>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
