'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminTenants, updateAdminTenant, PLAN_LABELS, STATUS_LABELS, STATUS_COLORS, type Plan, type TenantStatus } from '@/lib/admin';

const PLANS: Plan[] = ['START', 'PRO', 'ENTERPRISE', 'AGENDA_PRO'];
const STATUSES: TenantStatus[] = ['ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminTenantsPage() {
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<Plan>('START');
  const [editStatus, setEditStatus] = useState<TenantStatus>('ACTIVE');
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-tenants', search],
    queryFn: () => getAdminTenants(search || undefined),
  });

  const mutation = useMutation({
    mutationFn: ({ id, plan, status }: { id: string; plan: Plan; status: TenantStatus }) =>
      updateAdminTenant(id, { plan, status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      void qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setEditId(null);
    },
  });

  function openEdit(tenant: { id: string; plan: Plan; status: TenantStatus }) {
    setEditId(tenant.id);
    setEditPlan(tenant.plan);
    setEditStatus(tenant.status);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Clientes</h1>
          <p className="text-sm text-white/40 mt-1">{data.length} workspace{data.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar nome ou slug..."
            className="w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-500/50"
          />
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">Nenhum cliente encontrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-medium">Workspace</th>
                <th className="text-left px-5 py-3.5 font-medium">Plano</th>
                <th className="text-left px-5 py-3.5 font-medium">Estado</th>
                <th className="text-left px-5 py-3.5 font-medium">Utilizadores</th>
                <th className="text-left px-5 py-3.5 font-medium">Criado em</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-xs text-white/30 font-mono mt-0.5">{t.slug}</div>
                  </td>
                  <td className="px-5 py-4">
                    {editId === t.id ? (
                      <select
                        value={editPlan}
                        onChange={(e) => setEditPlan(e.target.value as Plan)}
                        className="bg-[#1e1e2e] border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p} className="bg-[#1e1e2e] text-white">{PLAN_LABELS[p]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-white/70">{PLAN_LABELS[t.plan]}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editId === t.id ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as TenantStatus)}
                        className="bg-[#1e1e2e] border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[#1e1e2e] text-white">{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-white/50">{t._count.users}</td>
                  <td className="px-5 py-4 text-white/40">{formatDate(t.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    {editId === t.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => mutation.mutate({ id: t.id, plan: editPlan, status: editStatus })}
                          disabled={mutation.isPending}
                          className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openEdit(t)}
                        className="px-3 py-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
