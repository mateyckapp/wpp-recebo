'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  preview: string;
  environment: 'live' | 'test';
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  description: string | null;
  active: boolean;
  lastDeliveredAt: string | null;
  failureCount: number;
  createdAt: string;
}

interface PlanLimitsResponse {
  plan: string;
  limits: Record<string, boolean>;
}

const ALL_EVENTS = [
  'message.received',
  'message.sent',
  'conversation.created',
  'conversation.assigned',
  'conversation.resolved',
  'contact.created',
  'contact.updated',
  'appointment.created',
  'appointment.cancelled',
  'appointment.reminded',
];

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchApiKeys(): Promise<ApiKey[]> {
  const { data } = await api.get<{ data: ApiKey[] }>('/api-keys');
  return data.data;
}

async function fetchWebhooks(): Promise<Webhook[]> {
  const { data } = await api.get<{ data: Webhook[] }>('/webhooks');
  return data.data;
}

async function fetchPlanLimits(): Promise<PlanLimitsResponse> {
  const { data } = await api.get<PlanLimitsResponse>('/billing/limits');
  return data;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full text-sm border border-white/[0.1] bg-white/[0.06] text-gray-100 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition';

function Badge({ color, children }: { color: 'green' | 'red' | 'amber' | 'gray'; children: React.ReactNode }) {
  const cls = {
    green: 'bg-green-500/15 text-green-400 border-green-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    gray: 'bg-white/[0.06] text-gray-400 border-white/[0.1]',
  }[color];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {children}
    </span>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-gray-600 mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
      <p className="text-xs text-gray-600 max-w-xs">{desc}</p>
    </div>
  );
}

// ─── Enterprise Gate ──────────────────────────────────────────────────────────

function EnterpriseGate() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
      <div className="h-14 w-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-5">
        <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Acesso Enterprise</h2>
      <p className="text-sm text-gray-400 max-w-sm mb-6">
        As API Keys e os Webhooks de saída estão disponíveis no plano Enterprise.
        Integra o Wpp Recebo com os teus sistemas internos via REST API.
      </p>
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
      >
        Ver planos
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

function ApiKeysTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [form, setForm] = useState({ name: '', environment: 'live' });

  const { data: keys = [], isLoading } = useQuery({ queryKey: ['api-keys'], queryFn: fetchApiKeys });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: ApiKey & { key: string } }>('/api-keys', form);
      return data.data;
    },
    onSuccess: (data) => {
      setNewKey(data.key);
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setForm({ name: '', environment: 'live' });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api-keys/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">API Keys</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Autentica pedidos à API com o header <code className="text-brand-400">X-API-Key: wpr_live_xxx</code>
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setNewKey(''); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova chave
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="rounded-xl border border-brand-500/20 bg-brand-600/5 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Criar nova API Key</h3>
          {newKey ? (
            <div className="space-y-3">
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Copia esta chave agora — não a voltarás a ver.
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-[#0d0d1a] px-4 py-3">
                <code className="flex-1 text-sm text-brand-300 font-mono break-all">{newKey}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(newKey)}
                  className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                  title="Copiar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => { setShowCreate(false); setNewKey(''); }}
                className="w-full py-2 rounded-lg border border-white/[0.1] text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nome da chave</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="ex.: Integração ERP, Automação Zapier"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Ambiente</label>
                <div className="flex gap-2">
                  {(['live', 'test'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setForm((f) => ({ ...f, environment: env }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.environment === env
                          ? 'border-brand-500/40 bg-brand-600/15 text-brand-400'
                          : 'border-white/[0.1] text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                      }`}
                    >
                      {env === 'live' ? 'Live' : 'Test'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg border border-white/[0.1] text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!form.name.trim() || createMutation.isPending}
                  className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {createMutation.isPending ? 'A criar…' : 'Criar chave'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active keys */}
      {isLoading ? (
        <div className="text-center py-8 text-sm text-gray-600">A carregar…</div>
      ) : activeKeys.length === 0 ? (
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>}
          title="Sem API Keys"
          desc="Cria a tua primeira chave para aceder à API do Wpp Recebo."
        />
      ) : (
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {activeKeys.map((key) => (
            <div key={key.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.01]">
              <div className="h-8 w-8 rounded-lg bg-brand-600/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-200 truncate">{key.name}</span>
                  <Badge color={key.environment === 'live' ? 'green' : 'amber'}>
                    {key.environment}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <code className="font-mono text-gray-500">{key.preview}</code>
                  {key.lastUsedAt ? (
                    <span>Usado {new Date(key.lastUsedAt).toLocaleDateString('pt-PT')}</span>
                  ) : (
                    <span>Nunca usado</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Revogar a chave "${key.name}"? Esta ação não pode ser desfeita.`)) {
                    revokeMutation.mutate(key.id);
                  }
                }}
                disabled={revokeMutation.isPending}
                className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                Revogar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400 transition-colors select-none">
            {revokedKeys.length} chave{revokedKeys.length > 1 ? 's' : ''} revogada{revokedKeys.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-2 rounded-xl border border-white/[0.04] divide-y divide-white/[0.03] overflow-hidden opacity-50">
            {revokedKeys.map((key) => (
              <div key={key.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-500 line-through truncate">{key.name}</span>
                  <div className="text-xs text-gray-700">
                    Revogada em {key.revokedAt ? new Date(key.revokedAt).toLocaleDateString('pt-PT') : '—'}
                  </div>
                </div>
                <Badge color="red">revogada</Badge>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Docs link */}
      <p className="text-xs text-gray-600">
        Consulta a{' '}
        <Link href="/docs/autenticacao" className="text-brand-400 hover:underline">
          documentação de autenticação
        </Link>{' '}
        para exemplos de uso.
      </p>
    </div>
  );
}

// ─── Webhooks Tab ─────────────────────────────────────────────────────────────

function WebhooksTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ url: '', description: '', secret: '', events: ['*'] as string[] });

  const { data: webhooks = [], isLoading } = useQuery({ queryKey: ['webhooks'], queryFn: fetchWebhooks });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/webhooks', {
        url: form.url,
        description: form.description || undefined,
        secret: form.secret || undefined,
        events: form.events,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      setShowCreate(false);
      setForm({ url: '', description: '', secret: '', events: ['*'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/webhooks/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/webhooks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const toggleEvent = (event: string) => {
    if (event === '*') {
      setForm((f) => ({ ...f, events: ['*'] }));
      return;
    }
    setForm((f) => {
      const withoutAll = f.events.filter((e) => e !== '*');
      const has = withoutAll.includes(event);
      const next = has ? withoutAll.filter((e) => e !== event) : [...withoutAll, event];
      return { ...f, events: next.length === 0 ? ['*'] : next };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Webhooks de Saída</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Recebe notificações HTTP em tempo real quando ocorrem eventos na plataforma.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo webhook
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-brand-500/20 bg-brand-600/5 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Adicionar webhook</h3>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">URL do endpoint <span className="text-red-400">*</span></label>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://api.exemplo.com/webhook/wpp"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Descrição (opcional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="ex.: Sincronizar com CRM"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Secret (opcional)
              <span className="ml-1 text-gray-600">— usado para assinar o payload (HMAC-SHA256)</span>
            </label>
            <input
              value={form.secret}
              onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
              placeholder="Deixa em branco para não assinar"
              className={inputCls}
              type="password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Eventos a receber</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => toggleEvent('*')}
                className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  form.events.includes('*')
                    ? 'border-brand-500/40 bg-brand-600/15 text-brand-400'
                    : 'border-white/[0.08] text-gray-500 hover:border-white/[0.15] hover:text-gray-300'
                }`}
              >
                Todos os eventos (*)
              </button>
              {ALL_EVENTS.map((ev) => (
                <button
                  key={ev}
                  onClick={() => toggleEvent(ev)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                    form.events.includes(ev) && !form.events.includes('*')
                      ? 'border-brand-500/40 bg-brand-600/15 text-brand-400'
                      : 'border-white/[0.08] text-gray-500 hover:border-white/[0.15] hover:text-gray-300'
                  }`}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 rounded-lg border border-white/[0.1] text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.url.trim() || createMutation.isPending}
              className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {createMutation.isPending ? 'A guardar…' : 'Adicionar'}
            </button>
          </div>
          {createMutation.isError && (
            <p className="text-xs text-red-400">Erro ao criar webhook. Verifica a URL.</p>
          )}
        </div>
      )}

      {/* Webhook list */}
      {isLoading ? (
        <div className="text-center py-8 text-sm text-gray-600">A carregar…</div>
      ) : webhooks.length === 0 ? (
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>}
          title="Sem webhooks configurados"
          desc="Adiciona um endpoint para receber notificações em tempo real dos eventos da plataforma."
        />
      ) : (
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {webhooks.map((wh) => (
            <div key={wh.id} className="px-4 py-4 hover:bg-white/[0.01]">
              <div className="flex items-start gap-3">
                {/* Toggle */}
                <button
                  onClick={() => toggleMutation.mutate({ id: wh.id, active: !wh.active })}
                  disabled={toggleMutation.isPending}
                  className={`relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    wh.active ? 'bg-brand-600' : 'bg-white/[0.1]'
                  }`}
                  title={wh.active ? 'Desativar' : 'Ativar'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      wh.active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono text-gray-200 truncate">{wh.url}</code>
                    {!wh.active && <Badge color="gray">inativo</Badge>}
                    {wh.failureCount > 0 && <Badge color="red">{wh.failureCount} falha{wh.failureCount > 1 ? 's' : ''}</Badge>}
                  </div>
                  {wh.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{wh.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      {wh.events.includes('*') ? (
                        <Badge color="gray">todos os eventos</Badge>
                      ) : (
                        wh.events.slice(0, 3).map((ev) => (
                          <span key={ev} className="text-xs font-mono text-gray-600 bg-white/[0.03] border border-white/[0.06] rounded px-1.5 py-0.5">
                            {ev}
                          </span>
                        ))
                      )}
                      {!wh.events.includes('*') && wh.events.length > 3 && (
                        <span className="text-xs text-gray-600">+{wh.events.length - 3}</span>
                      )}
                    </div>
                    {wh.lastDeliveredAt && (
                      <span className="text-xs text-gray-600">
                        Última entrega {new Date(wh.lastDeliveredAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Remover este webhook? Esta ação não pode ser desfeita.')) {
                      deleteMutation.mutate(wh.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-gray-600 hover:text-red-400 disabled:opacity-50 transition-colors flex-shrink-0 mt-0.5"
                  title="Remover"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Docs link */}
      <p className="text-xs text-gray-600">
        Consulta a{' '}
        <Link href="/docs/webhooks" className="text-brand-400 hover:underline">
          documentação de webhooks
        </Link>{' '}
        para verificação de assinatura e exemplos de payload.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'api-keys' | 'webhooks';

export default function DeveloperPage() {
  const [tab, setTab] = useState<Tab>('api-keys');

  const { data: planData, isLoading } = useQuery({
    queryKey: ['plan-limits'],
    queryFn: fetchPlanLimits,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-600">
        A carregar…
      </div>
    );
  }

  const isEnterprise = planData?.plan === 'ENTERPRISE';

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Developer</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          API Keys e Webhooks para integração com sistemas externos.
        </p>
      </div>

      {!isEnterprise ? (
        <EnterpriseGate />
      ) : (
        <div className="flex flex-col gap-6 flex-1">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/[0.06]">
            {([
              { id: 'api-keys' as Tab, label: 'API Keys' },
              { id: 'webhooks' as Tab, label: 'Webhooks' },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === t.id
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1">
            {tab === 'api-keys' ? <ApiKeysTab /> : <WebhooksTab />}
          </div>
        </div>
      )}
    </div>
  );
}
