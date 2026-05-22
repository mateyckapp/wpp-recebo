'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics, type AnalyticsSummary } from '@/lib/analytics';

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Bar chart SVG ─────────────────────────────────────────────────────────────

function BarChart({ data }: { data: AnalyticsSummary['messagesPerDay'] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-600">
        Sem dados nos últimos 30 dias
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.sent, d.received]), 1);
  const W = 600;
  const H = 120;
  const barW = Math.max(4, Math.floor((W - data.length * 2) / (data.length * 2)));
  const gap = Math.floor((W - data.length * 2 * barW) / data.length);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        className="w-full"
        style={{ minWidth: `${Math.max(W, data.length * (barW * 2 + gap))}px` }}
      >
        {data.map((d, i) => {
          const x = i * (barW * 2 + gap);
          const sentH = Math.round((d.sent / maxVal) * H);
          const recvH = Math.round((d.received / maxVal) * H);
          const label = d.day.slice(5); // MM-DD
          return (
            <g key={d.day}>
              {/* Barra sent (verde) */}
              <rect x={x} y={H - sentH} width={barW} height={sentH} fill="#10b981" rx={2} opacity={0.85}>
                <title>{d.day}: {d.sent} enviadas</title>
              </rect>
              {/* Barra received (brand) */}
              <rect x={x + barW + 1} y={H - recvH} width={barW} height={recvH} fill="#7c3aed" rx={2} opacity={0.85}>
                <title>{d.day}: {d.received} recebidas</title>
              </rect>
              {/* Label data */}
              {i % Math.ceil(data.length / 10) === 0 && (
                <text x={x + barW} y={H + 15} textAnchor="middle" fontSize={9} fill="#6b7280">
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 justify-end">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Enviadas
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-brand-500 inline-block" /> Recebidas
        </span>
      </div>
    </div>
  );
}

// ── Appointments badge ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Falta',
  COMPLETED: 'Concluído',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
  NO_SHOW: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  COMPLETED: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RelatoriosPage(): React.ReactElement {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-red-400">Erro ao carregar estatísticas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Estatísticas gerais do workspace</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Conversas" value={data.conversations.total} sub={`${data.conversations.open} abertas`} />
          <StatCard label="Mensagens" value={data.messages.total} sub={`${data.messages.sent} enviadas · ${data.messages.received} recebidas`} />
          <StatCard label="Contactos" value={data.contacts.total} sub={`+${data.contacts.new30d} nos últimos 30 dias`} />
          <StatCard label="Marcações" value={data.appointments.total} sub={`${Object.values(data.appointments.byStatus).reduce((a, b) => a + b, 0)} registadas`} />
        </div>

        {/* Gráfico mensagens por dia */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
          <h2 className="font-semibold text-gray-100 mb-4">Mensagens por dia (últimos 30 dias)</h2>
          <BarChart data={data.messagesPerDay} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top agentes */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
            <h2 className="font-semibold text-gray-100 mb-4">Top agentes (mensagens enviadas)</h2>
            {data.topAgents.length === 0 ? (
              <p className="text-sm text-gray-500">Sem dados</p>
            ) : (
              <div className="space-y-3">
                {data.topAgents.map((agent, i) => {
                  const max = data.topAgents[0]?.count ?? 1;
                  const pct = Math.round((agent.count / max) * 100);
                  return (
                    <div key={agent.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-4">{i + 1}.</span>
                          <span className="text-sm text-gray-200">{agent.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-300 tabular-nums">{agent.count}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Marcações por estado */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
            <h2 className="font-semibold text-gray-100 mb-4">Marcações por estado</h2>
            {Object.keys(data.appointments.byStatus).length === 0 ? (
              <p className="text-sm text-gray-500">Sem marcações registadas</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.appointments.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLOR[status] ?? 'bg-white/[0.05] text-gray-400 border-white/[0.08]'}`}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    <span className="text-sm font-semibold text-gray-300 tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
