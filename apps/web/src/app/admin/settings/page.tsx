'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminConfig, upsertAdminConfig } from '@/lib/admin';

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  description: string;
  type?: string;
}

const STRIPE_FIELDS: SettingField[] = [
  { key: 'stripe_price_start', label: 'Start — Stripe Price ID', placeholder: 'price_...', description: 'ID do preço no Stripe para o plano Start' },
  { key: 'stripe_price_pro', label: 'Pro — Stripe Price ID', placeholder: 'price_...', description: 'ID do preço no Stripe para o plano Pro' },
  { key: 'stripe_price_enterprise', label: 'Enterprise — Stripe Price ID', placeholder: 'price_...', description: 'ID do preço no Stripe para o plano Enterprise' },
  { key: 'stripe_price_agenda_pro', label: 'Agenda Pro — Stripe Price ID', placeholder: 'price_...', description: 'ID do preço no Stripe para o plano Agenda Pro' },
];

const PRICE_FIELDS: SettingField[] = [
  { key: 'price_start', label: 'Preço Start (€/mês)', placeholder: '0', description: 'Usado para cálculo de MRR no dashboard' },
  { key: 'price_pro', label: 'Preço Pro (€/mês)', placeholder: '29', description: 'Usado para cálculo de MRR no dashboard' },
  { key: 'price_enterprise', label: 'Preço Enterprise (€/mês)', placeholder: '99', description: 'Usado para cálculo de MRR no dashboard' },
  { key: 'price_agenda_pro', label: 'Preço Agenda Pro (€/mês)', placeholder: '49', description: 'Usado para cálculo de MRR no dashboard' },
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

function SettingsSection({
  title,
  description,
  fields,
  values,
  onChange,
  onSave,
  isPending,
  savedKey,
}: {
  title: string;
  description: string;
  fields: SettingField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: (key: string) => void;
  isPending: boolean;
  savedKey: string | null;
}) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs text-white/40 mt-1">{description}</p>
      </div>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-white/50 mb-1.5">{f.label}</label>
            <p className="text-xs text-white/30 mb-2">{f.description}</p>
            <div className="flex gap-2">
              <input
                type={f.type ?? 'text'}
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 font-mono"
              />
              <button
                onClick={() => onSave(f.key)}
                disabled={isPending}
                className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${
                  savedKey === f.key
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                } disabled:opacity-50`}
              >
                {savedKey === f.key ? '✓' : 'Guardar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const { data: config } = useQuery({
    queryKey: ['admin-config'],
    queryFn: getAdminConfig,
  });

  useEffect(() => {
    if (config) setValues((prev) => ({ ...prev, ...config }));
  }, [config]);

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => upsertAdminConfig(key, value),
    onSuccess: (_, { key }) => {
      void qc.invalidateQueries({ queryKey: ['admin-config'] });
      void qc.invalidateQueries({ queryKey: ['admin-stats'] });
      void qc.invalidateQueries({ queryKey: ['admin-billing'] });
      setSavedKey(key);
      setToast('Configuração guardada');
      setTimeout(() => setSavedKey(null), 2000);
    },
  });

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(key: string) {
    mutation.mutate({ key, value: values[key] ?? '' });
  }

  return (
    <div className="p-8 space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div>
        <h1 className="text-xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-white/40 mt-1">Stripe, preços e outras configurações do sistema</p>
      </div>

      <SettingsSection
        title="Stripe — Price IDs"
        description="IDs dos preços no Stripe para cada plano. Usados na página de faturação dos clientes."
        fields={STRIPE_FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        isPending={mutation.isPending}
        savedKey={savedKey}
      />

      <SettingsSection
        title="Preços de referência (€/mês)"
        description="Valores exibidos no dashboard para cálculo de MRR. Devem corresponder aos preços reais cobrados."
        fields={PRICE_FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        isPending={mutation.isPending}
        savedKey={savedKey}
      />

      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Senha de administrador</h2>
          <p className="text-xs text-white/40 mt-1">
            A senha é definida via variável de ambiente <code className="text-brand-400 font-mono">ADMIN_SECRET</code> nos ficheiros .env da API e da Web. Reinicia ambos os servidores após alterar.
          </p>
        </div>
        <div className="bg-white/3 rounded-xl p-4 text-xs font-mono space-y-1">
          <div className="text-white/40"># apps/api/.env</div>
          <div className="text-brand-300">ADMIN_SECRET="<span className="text-white/60">nova-senha-segura</span>"</div>
          <div className="text-white/40 mt-2"># apps/web/.env.local</div>
          <div className="text-brand-300">ADMIN_SECRET="<span className="text-white/60">nova-senha-segura</span>"</div>
        </div>
      </div>
    </div>
  );
}
