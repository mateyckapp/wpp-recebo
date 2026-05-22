'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminBilling, PLAN_LABELS, PLAN_COLORS } from '@/lib/admin';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
}

export default function AdminBillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-billing'],
    queryFn: getAdminBilling,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const billing = data;
  const projectionData = billing.projection.map((p) => ({
    ...p,
    label: formatMonth(p.month),
  }));

  const breakdownData = billing.planBreakdown.map((p) => ({
    name: PLAN_LABELS[p.plan],
    plan: p.plan,
    clientes: p.count,
    monthly: p.monthly,
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Faturação</h1>
        <p className="text-sm text-white/40 mt-1">Receita e projeção de caixa</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'MRR atual', value: `€${billing.mrr.toLocaleString('pt-PT')}`, sub: 'receita mensal recorrente' },
          { label: 'ARR estimado', value: `€${billing.arr.toLocaleString('pt-PT')}`, sub: 'projeção anual' },
          { label: 'Próximos 12 meses', value: `€${(billing.mrr * 12).toLocaleString('pt-PT')}`, sub: 'assumindo MRR constante' },
        ].map((k) => (
          <div key={k.label} className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-1">{k.label}</p>
            <p className="text-2xl font-semibold text-white">{k.value}</p>
            <p className="text-xs text-white/30 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Cashflow projection */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-white/70 mb-6">Projeção de caixa — próximos 12 meses</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              formatter={(v) => [`€${Number(v).toLocaleString('pt-PT')}`, 'receita']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#cashGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-white/25 mt-3 text-center">Projeção conservadora com MRR atual sem crescimento ou churn</p>
      </div>

      {/* Plan breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white/70 mb-6">Receita por plano</h2>
          {breakdownData.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={breakdownData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  formatter={(v) => [`€${Number(v)}/mês`, 'receita']}
                />
                <Bar dataKey="monthly" radius={[4, 4, 0, 0]}>
                  {breakdownData.map((entry, i) => (
                    <Cell key={i} fill={PLAN_COLORS[entry.plan]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white/70 mb-4">Detalhe por plano</h2>
          <div className="space-y-3">
            {billing.planBreakdown.map((p) => (
              <div key={p.plan} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLAN_COLORS[p.plan] }} />
                  <div>
                    <div className="text-sm text-white font-medium">{PLAN_LABELS[p.plan]}</div>
                    <div className="text-xs text-white/35">{p.count} cliente{p.count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white font-medium">€{p.monthly.toLocaleString('pt-PT')}/mês</div>
                  <div className="text-xs text-white/35">€{p.annual.toLocaleString('pt-PT')}/ano</div>
                </div>
              </div>
            ))}
            {billing.planBreakdown.length === 0 && (
              <p className="text-sm text-white/30 text-center py-4">Sem clientes ativos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
