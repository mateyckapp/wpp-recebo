'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminStats, PLAN_LABELS, PLAN_COLORS } from '@/lib/admin';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data;
  const barData = stats.planDistribution.map((p) => ({
    name: PLAN_LABELS[p.plan],
    clientes: p.count,
    receita: p.revenue,
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Visão geral do negócio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="MRR" value={`€${stats.mrr.toLocaleString('pt-PT')}`} sub="receita mensal recorrente" />
        <KpiCard label="ARR" value={`€${(stats.mrr * 12).toLocaleString('pt-PT')}`} sub="receita anual estimada" />
        <KpiCard label="Total de clientes" value={stats.total} sub={`${stats.newThisMonth} novos este mês`} />
        <KpiCard label="Ativos" value={stats.active} sub={`${stats.trial} em trial · ${stats.suspended} suspensos`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: plan distribution */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white/70 mb-6">Distribuição por plano</h2>
          {stats.planDistribution.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Sem dados</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={stats.planDistribution}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {stats.planDistribution.map((entry) => (
                      <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    formatter={(v) => [String(v), 'clientes']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {stats.planDistribution.map((p) => (
                  <div key={p.plan} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLAN_COLORS[p.plan] }} />
                      <span className="text-white/60">{PLAN_LABELS[p.plan]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-medium">{p.count}</span>
                      <span className="text-white/30 ml-1">€{p.revenue}/mês</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar: clientes por plano */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white/70 mb-6">Receita por plano (€/mês)</h2>
          {barData.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  formatter={(v) => [`€${String(v)}`, 'receita/mês']}
                />
                <Bar dataKey="receita" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => {
                    const plan = stats.planDistribution[i]?.plan;
                    return <Cell key={i} fill={plan ? PLAN_COLORS[plan] : '#6B7280'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Ativos', value: stats.active, color: 'text-green-400' },
          { label: 'Trial', value: stats.trial, color: 'text-yellow-400' },
          { label: 'Suspensos', value: stats.suspended, color: 'text-red-400' },
          { label: 'Cancelados', value: stats.cancelled, color: 'text-gray-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
