'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminConfig, upsertAdminConfig } from '@/lib/admin';

interface PixelField {
  key: string;
  label: string;
  placeholder: string;
  description: string;
  docsUrl: string;
}

const PIXEL_FIELDS: PixelField[] = [
  {
    key: 'fb_pixel_id',
    label: 'Facebook / Meta Pixel',
    placeholder: 'Ex: 1234567890123456',
    description: 'ID do pixel do Meta Ads. Ativa eventos PageView, Lead e Purchase automaticamente.',
    docsUrl: 'https://www.facebook.com/business/help/952192354843755',
  },
  {
    key: 'ga_id',
    label: 'Google Analytics 4 (GA4)',
    placeholder: 'Ex: G-XXXXXXXXXX',
    description: 'Measurement ID do Google Analytics 4. Ativa rastreio de pageviews e conversões.',
    docsUrl: 'https://support.google.com/analytics/answer/9539598',
  },
  {
    key: 'ga_ads_id',
    label: 'Google Ads (Conversion ID)',
    placeholder: 'Ex: AW-XXXXXXXXXX',
    description: 'ID de conversão do Google Ads para rastrear leads e compras.',
    docsUrl: 'https://support.google.com/google-ads/answer/6095821',
  },
  {
    key: 'tiktok_pixel_id',
    label: 'TikTok Pixel',
    placeholder: 'Ex: CXXXXXXXXXXXXXXX',
    description: 'ID do pixel do TikTok Ads. Ativa eventos ViewContent, CompleteRegistration e Purchase.',
    docsUrl: 'https://ads.tiktok.com/help/article?aid=10000407',
  },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-green-500/20 border border-green-500/30 text-green-300 text-sm px-4 py-3 rounded-xl shadow-xl">
      {message}
    </div>
  );
}

export default function AdminPixelsPage() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: getAdminConfig,
  });

  useEffect(() => {
    if (config) {
      setValues((prev) => ({ ...prev, ...config }));
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => upsertAdminConfig(key, value),
    onSuccess: (_, { key }) => {
      void qc.invalidateQueries({ queryKey: ['admin-config'] });
      const field = PIXEL_FIELDS.find((f) => f.key === key);
      setToast(`${field?.label ?? key} guardado com sucesso`);
    },
  });

  function handleSave(key: string) {
    mutation.mutate({ key, value: values[key] ?? '' });
  }

  return (
    <div className="p-8 space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div>
        <h1 className="text-xl font-semibold text-white">Pixels & Ads</h1>
        <p className="text-sm text-white/40 mt-1">
          Configura os pixels de publicidade injetados em todas as páginas do produto, incluindo landing pages.
        </p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
        Os pixels são injetados no layout raiz — afetam <strong>todas as páginas</strong> do produto. As alterações ficam ativas em até 1 hora (cache do servidor).
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {PIXEL_FIELDS.map((field) => (
            <div key={field.key} className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">{field.label}</h3>
                  <p className="text-xs text-white/40 mt-1">{field.description}</p>
                </div>
                <a
                  href={field.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-300 whitespace-nowrap"
                >
                  Documentação →
                </a>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={values[field.key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 font-mono"
                />
                <button
                  onClick={() => handleSave(field.key)}
                  disabled={mutation.isPending}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm rounded-xl transition-colors font-medium"
                >
                  Guardar
                </button>
              </div>
              {values[field.key] && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <span>●</span>
                  <span>Pixel ativo</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white">Eventos configurados automaticamente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { event: 'PageView', desc: 'Todas as páginas', pages: 'Global' },
            { event: 'Lead / CompleteRegistration', desc: 'Página de registo', pages: '/register' },
            { event: 'Purchase', desc: 'Sucesso de pagamento', pages: '/billing?success' },
          ].map((e) => (
            <div key={e.event} className="bg-white/3 rounded-xl p-3 border border-white/5">
              <div className="font-mono text-brand-400 font-medium">{e.event}</div>
              <div className="text-white/50 mt-1">{e.desc}</div>
              <div className="text-white/25 mt-0.5 font-mono">{e.pages}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
