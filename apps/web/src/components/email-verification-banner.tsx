'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export function EmailVerificationBanner(): React.ReactElement | null {
  const user = useAuthStore((s) => s.user);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified) return null;

  const resend = async (): Promise<void> => {
    if (sending || sent) return;
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-sm">
      <svg className="h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span className="text-amber-200/80 flex-1">
        Email não verificado.{' '}
        {sent ? (
          <span className="text-emerald-400">Email de verificação enviado!</span>
        ) : (
          <button
            onClick={resend}
            disabled={sending}
            className="underline underline-offset-2 text-amber-300 hover:text-amber-200 disabled:opacity-60 transition-colors"
          >
            {sending ? 'A enviar...' : 'Reenviar verificação'}
          </button>
        )}
      </span>
    </div>
  );
}
