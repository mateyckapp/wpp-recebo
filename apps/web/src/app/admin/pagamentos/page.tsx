'use client';

import { useQuery } from '@tanstack/react-query';

const API_URL = '/api/v1';

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  tenant: { name: string; slug: string };
}

interface AdminPaymentStats {
  total: number;
  paid: number;
  pending: number;
  volumeCents: number;
  recent: PaymentRow[];
}

async function fetchStats(): Promise<AdminPaymentStats> {
  const res = await fetch(`${API_URL}/admin/payments`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao carregar');
  return res.json() as Promise<AdminPaymentStats>;
}

function formatAmount(cents: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendente', cls: 'text-amber-400' },
  paid:    { label: 'Pago',    cls: 'text-green-400' },
  failed:  { label: 'Falhado', cls: 'text-red-400' },
  expired: { label: 'Expirado', cls: 'text-gray-500' },
};

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPagamentosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: fetchStats,
    refetchInterval: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Pagamentos</h1>
        <p className="text-sm text-white/40 mt-1">Cobranças processadas através da plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Volume total" value={formatAmount(data.volumeCents)} sub="pagamentos confirmados" />
        <KpiCard label="Transações" value={data.total} sub="total criadas" />
        <KpiCard label="Pagas" value={data.paid} sub={`${data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0}% de conversão`} />
        <KpiCard label="Pendentes" value={data.pending} sub="aguardam pagamento" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white/70 mb-4">Transações recentes</h2>
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left">
                <th className="px-4 py-3 text-xs font-medium text-white/40">Cliente</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">Descrição</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">Valor</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data.recent.map((p) => {
                const s = STATUS[p.status] ?? { label: p.status, cls: 'text-gray-500' };
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{p.tenant.name}</span>
                      <span className="text-white/30 text-xs ml-2">{p.tenant.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-white/60 max-w-48 truncate">{p.description}</td>
                    <td className="px-4 py-3 text-white font-semibold">{formatAmount(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {new Date(p.paidAt ?? p.createdAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                );
              })}
              {data.recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">
                    Sem transações ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
