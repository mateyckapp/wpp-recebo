'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = (level: 'all' | 'essential') => {
    localStorage.setItem(STORAGE_KEY, level);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto md:mx-0 md:max-w-xl rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/95 backdrop-blur-sm shadow-2xl p-5">
        <p className="text-sm text-gray-300 leading-relaxed mb-4">
          Utilizamos cookies essenciais para o funcionamento da plataforma. Com o teu consentimento,
          podemos também usar cookies analíticos para melhorar o serviço.{' '}
          <Link href="/cookies" className="text-brand-400 hover:underline">
            Política de Cookies
          </Link>
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => accept('all')}
            className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
          >
            Aceitar todos
          </button>
          <button
            onClick={() => accept('essential')}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-colors"
          >
            Apenas essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
