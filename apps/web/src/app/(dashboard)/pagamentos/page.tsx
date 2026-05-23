'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  token: string;
  paidAt: string | null;
  createdAt: string;
  conversationId: string | null;
}

interface PlanLimitsResponse { plan: string; limits: { paymentsEnabled: boolean } }

async function fetchPayments(): Promise<Payment[]> {
  const { data } = await api.get<{ data: Payment[] }>('/payments');
  return data.data;
}

async function fetchPlanLimits(): Promise<PlanLimitsResponse> {
  const { data } = await api.get<PlanLimitsResponse>('/billing/limits');
  return data;
}

function formatAmount(cents: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendente', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  paid:    { label: 'Pago',     cls: 'bg-green-500/15 text-green-400 border-green-500/20' },
  failed:  { label: 'Falhado', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  expired: { label: 'Expirado', cls: 'bg-white/[0.06] text-gray-500 border-white/[0.1]' },
};

const inputCls = 'w-full text-sm border border-white/[0.1] bg-white/[0.06] text-gray-100 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition';

function UpgradeGate() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
      <div className="h-14 w-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-5">
        <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Cobranças via WhatsApp</h2>
      <p className="text-sm text-gray-400 max-w-sm mb-6">
        Cria links de pagamento e envia diretamente nas conversas. Disponível no plano PRO e superior.
      </p>
      <Link href="/invoices" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors">
        Ver planos
      </Link>
    </div>
  );
}

export default function PagamentosPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [form, setForm] = useState({ amountStr: '', description: '' });

  const { data: planData } = useQuery({ queryKey: ['plan-limits'], queryFn: fetchPlanLimits, staleTime: 5 * 60_000 });
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    enabled: planData?.limits.paymentsEnabled,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount = Math.round(parseFloat(form.amountStr.replace(',', '.')) * 100);
      const { data } = await api.post<{ data: Payment & { url: string } }>('/payments', {
        amount,
        description: form.description,
      });
      return data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      setShowCreate(false);
      setForm({ amountStr: '', description: '' });
      navigator.clipboard.writeText((data as Payment & { url: string }).url);
      setCopiedId(data.id);
      setTimeout(() => setCopiedId(''), 3000);
    },
  });

  const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.com';

  const copyLink = (token: string, id: string) => {
    navigator.clipboard.writeText(`https://${appDomain}/pagar/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  if (planData && !planData.limits.paymentsEnabled) return <UpgradeGate />;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Cobranças</h1>
          <p className="text-sm text-gray-500 mt-0.5">Links de pagamento enviados pelo WhatsApp</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova cobrança
        </button>
      </div>

      {/* KPIs */}
      {payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total recebido', value: formatAmount(totalPaid), color: 'text-green-400' },
            { label: 'Pagamentos', value: payments.filter(p => p.status === 'paid').length, color: 'text-white' },
            { label: 'Pendentes', value: payments.filter(p => p.status === 'pending').length, color: 'text-amber-400' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-brand-500/20 bg-brand-600/5 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Nova cobrança</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Valor (€)</label>
              <input
                value={form.amountStr}
                onChange={(e) => setForm(f => ({ ...f, amountStr: e.target.value }))}
                placeholder="ex: 25.00"
                className={inputCls}
                type="text"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Descrição</label>
              <input
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="ex: Corte de cabelo"
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border border-white/[0.1] text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.amountStr || !form.description || createMutation.isPending}
              className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {createMutation.isPending ? 'A criar…' : 'Criar e copiar link'}
            </button>
          </div>
          {createMutation.isError && <p className="text-xs text-red-400">Erro ao criar cobrança. Verifica o valor.</p>}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-600">A carregar…</div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
          <div className="h-12 w-12 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-gray-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-300 mb-1">Sem cobranças</p>
          <p className="text-xs text-gray-600">Cria a tua primeira cobrança e envia o link pelo WhatsApp.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {payments.map((p) => {
            const badge = STATUS_BADGE[p.status] ?? { label: p.status, cls: 'bg-white/[0.06] text-gray-500 border-white/[0.1]' };
            return (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.01]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">{formatAmount(p.amount)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{p.description}</p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    {p.paidAt
                      ? `Pago em ${new Date(p.paidAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}`
                      : `Criado em ${new Date(p.createdAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}`}
                  </p>
                </div>
                {p.status === 'pending' && (
                  <button
                    onClick={() => copyLink(p.token, p.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
                      copiedId === p.id
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {copiedId === p.id ? (
                      <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copiado</>
                    ) : (
                      <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> Copiar link</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
