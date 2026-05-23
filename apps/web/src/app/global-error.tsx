'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt">
      <body className="min-h-screen bg-[#060609] text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold mb-2">Algo correu mal</h1>
          <p className="text-gray-400 text-sm mb-6">Ocorreu um erro inesperado. A equipa foi notificada.</p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
