'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationConfig, upsertNotificationConfig, TEMPLATE_TEXTS } from '@/lib/agenda-notifications';
import type { NotificationConfig } from '@/lib/agenda-notifications';
import { Toast } from '@/components/toast';

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${value ? 'bg-brand-500' : 'bg-white/10'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

// ── Notification card ─────────────────────────────────────────────────────────

function NotifCard({
  icon,
  title,
  hint,
  enabled,
  onToggle,
  templateName,
  onTemplate,
  children,
}: {
  icon: string;
  title: string;
  hint: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  templateName: string;
  onTemplate: (v: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-5 space-y-4 transition-colors ${enabled ? 'border-white/[0.10] bg-white/[0.03]' : 'border-white/[0.05] bg-white/[0.01] opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg leading-none select-none">{icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-white/40 mt-0.5">{hint}</p>
          </div>
        </div>
        <Toggle value={enabled} onChange={onToggle} />
      </div>

      {children}

      <div>
        <label className="block text-xs font-medium text-white/40 mb-1.5">
          Nome do template Meta
        </label>
        <input
          value={templateName}
          onChange={(e) => onTemplate(e.target.value)}
          disabled={!enabled}
          placeholder="ex: appointment_confirmation"
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 disabled:opacity-40"
        />
      </div>
    </div>
  );
}

// ── Template text box ─────────────────────────────────────────────────────────

function TemplateBox({ label, text, variables }: { label: string; text: string; variables: string[] }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{label}</p>
      <div className="relative rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
        <pre className="text-xs text-white/70 whitespace-pre-wrap font-sans leading-relaxed pr-14">{text}</pre>
        <button
          onClick={copy}
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded border border-white/10 text-white/30 hover:text-white hover:border-white/25 transition-colors"
        >
          {copied ? '✓' : 'Copiar'}
        </button>
      </div>
      <p className="text-[11px] text-white/30">
        Variáveis: {variables.map((v, i) => `{{${i + 1}}} = ${v}`).join(' · ')}
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const DELAY_OPTIONS = [1, 2, 5, 10, 15, 30] as const;

export default function NotificacoesPage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState<Partial<NotificationConfig>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['notification-config'],
    queryFn: getNotificationConfig,
  });

  const merged = { ...data, ...form } as NotificationConfig;

  function set<K extends keyof NotificationConfig>(key: K, value: NotificationConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const saveMut = useMutation({
    mutationFn: () => upsertNotificationConfig(form),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notification-config'] });
      setForm({});
      setToast({ message: 'Configurações guardadas', variant: 'success' });
    },
    onError: () => setToast({ message: 'Erro ao guardar', variant: 'error' }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast title={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Notificacoes WhatsApp</h1>
            <p className="text-sm text-white/40 mt-1">
              Mensagens automaticas enviadas ao cliente apos agendamento.
            </p>
          </div>
          <Link href="/agenda/configurar" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Configurar
          </Link>
        </div>

        {/* Notification cards */}
        <div className="space-y-3">

          {/* Confirmation */}
          <NotifCard
            icon="&#x2709;"
            title="Confirmacao de agendamento"
            hint="Enviada alguns minutos apos o agendamento ser criado"
            enabled={merged.confirmationEnabled}
            onToggle={(v) => set('confirmationEnabled', v)}
            templateName={merged.confirmationTemplate ?? ''}
            onTemplate={(v) => set('confirmationTemplate', v)}
          >
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">
                Enviar quanto tempo apos o agendamento?
              </label>
              <div className="flex flex-wrap gap-2">
                {DELAY_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => set('confirmationDelayMinutes', min)}
                    disabled={!merged.confirmationEnabled}
                    className={`px-3 py-1 rounded-lg text-xs border transition-colors disabled:opacity-40 ${
                      merged.confirmationDelayMinutes === min
                        ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                        : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          </NotifCard>

          {/* Reminder 2d */}
          <NotifCard
            icon="&#x1F514;"
            title="Lembrete — 2 dias antes"
            hint="So enviado se o agendamento for >= 48h a frente"
            enabled={merged.reminder2dEnabled}
            onToggle={(v) => set('reminder2dEnabled', v)}
            templateName={merged.reminder2dTemplate ?? ''}
            onTemplate={(v) => set('reminder2dTemplate', v)}
          />

          {/* Reminder 1d */}
          <NotifCard
            icon="&#x1F514;"
            title="Lembrete — 1 dia antes"
            hint="So enviado se o agendamento for >= 24h a frente"
            enabled={merged.reminder1dEnabled}
            onToggle={(v) => set('reminder1dEnabled', v)}
            templateName={merged.reminder1dTemplate ?? ''}
            onTemplate={(v) => set('reminder1dTemplate', v)}
          />

          {/* Reminder 2h */}
          <NotifCard
            icon="&#x1F514;"
            title="Lembrete — 2 horas antes"
            hint="Enviado se o agendamento for >= 2h a frente"
            enabled={merged.reminder2hEnabled}
            onToggle={(v) => set('reminder2hEnabled', v)}
            templateName={merged.reminder2hTemplate ?? ''}
            onTemplate={(v) => set('reminder2hTemplate', v)}
          />

          {/* Reminder 1h — for same-day bookings */}
          <NotifCard
            icon="&#x1F514;"
            title="Lembrete — 1 hora antes"
            hint="Util para quem marca no proprio dia. Enviado se >= 1h a frente"
            enabled={merged.reminder1hEnabled}
            onToggle={(v) => set('reminder1hEnabled', v)}
            templateName={merged.reminder1hTemplate ?? ''}
            onTemplate={(v) => set('reminder1hTemplate', v)}
          />
        </div>

        {/* Save */}
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending || Object.keys(form).length === 0}
          className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-sm font-medium text-white transition-colors"
        >
          {saveMut.isPending ? 'A guardar...' : 'Guardar configuracoes'}
        </button>

        {/* Templates for Meta */}
        <div className="rounded-xl border border-white/[0.07] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <span>Textos dos templates para submeter ao Meta</span>
            <span className="text-white/30 text-xs">{showTemplates ? 'Fechar' : 'Expandir'}</span>
          </button>

          {showTemplates && (
            <div className="border-t border-white/[0.07] p-5 space-y-6">
              <p className="text-xs text-white/40">
                Copia estes textos e cria os templates no{' '}
                <span className="text-white/60">Meta Business Manager &rarr; WhatsApp &rarr; Templates de mensagem</span>.
                Categoria recomendada: <strong className="text-white/60">Utilidade</strong>.
              </p>

              <TemplateBox
                label="Confirmacao de agendamento"
                text={TEMPLATE_TEXTS.confirmation.body}
                variables={[...TEMPLATE_TEXTS.confirmation.variables]}
              />
              <TemplateBox
                label="Lembrete 2 dias antes"
                text={TEMPLATE_TEXTS.reminder2d.body}
                variables={[...TEMPLATE_TEXTS.reminder2d.variables]}
              />
              <TemplateBox
                label="Lembrete 1 dia antes"
                text={TEMPLATE_TEXTS.reminder1d.body}
                variables={[...TEMPLATE_TEXTS.reminder1d.variables]}
              />
              <TemplateBox
                label="Lembrete 2 horas antes"
                text={TEMPLATE_TEXTS.reminder2h.body}
                variables={[...TEMPLATE_TEXTS.reminder2h.variables]}
              />
              <TemplateBox
                label="Lembrete 1 hora antes"
                text={TEMPLATE_TEXTS.reminder1h.body}
                variables={[...TEMPLATE_TEXTS.reminder1h.variables]}
              />
            </div>
          )}
        </div>

        <p className="text-xs text-white/20 text-center">
          Dentro da janela de 24h do cliente, e enviada mensagem de texto livre.
          Fora da janela, e usado o template aprovado pelo Meta.
        </p>
      </div>
    </>
  );
}
