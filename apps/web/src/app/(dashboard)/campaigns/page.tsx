'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCampaigns,
  createCampaign,
  sendCampaign,
  cancelCampaign,
  deleteCampaign,
  type Campaign,
  type CampaignStatus,
} from '@/lib/campaigns';
import { fetchGroups } from '@/lib/contacts';

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: 'Rascunho',
  SENDING: 'A enviar...',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  FAILED: 'Falhada',
};

const STATUS_CLASS: Record<CampaignStatus, string> = {
  DRAFT: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  SENDING: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  FAILED: 'bg-red-500/15 text-red-400 border-red-500/20',
};

function ProgressBar({ sent, failed, total }: { sent: number; failed: number; total: number }) {
  if (total === 0) return null;
  const sentPct = Math.round((sent / total) * 100);
  const failedPct = Math.round((failed / total) * 100);
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
        <span>{sent} enviadas · {failed} falhadas · {total - sent - failed} pendentes</span>
        <span>{sentPct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${sentPct}%` }} />
        <div className="h-full bg-red-500 transition-all" style={{ width: `${failedPct}%` }} />
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: () => sendCampaign(campaign.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelCampaign(campaign.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCampaign(campaign.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const isSending = campaign.status === 'SENDING';

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/[0.12] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-100 text-sm truncate">{campaign.name}</h3>
            <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CLASS[campaign.status]}`}>
              {STATUS_LABEL[campaign.status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: campaign.group.color }} />
            <span className="text-xs text-gray-500">{campaign.group.name} · {campaign.totalCount} contactos</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {campaign.status === 'DRAFT' && (
            <button
              onClick={() => { if (confirm(`Enviar campanha "${campaign.name}" para ${campaign.totalCount} contactos?`)) sendMutation.mutate(); }}
              disabled={sendMutation.isPending}
              className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              Enviar
            </button>
          )}
          {isSending && (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="text-xs px-3 py-1.5 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          {(campaign.status === 'DRAFT' || campaign.status === 'CANCELLED' || campaign.status === 'COMPLETED' || campaign.status === 'FAILED') && (
            <button
              onClick={() => { if (confirm(`Eliminar campanha "${campaign.name}"?`)) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className="text-xs px-2 py-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
        {campaign.message}
      </p>

      {(isSending || campaign.status === 'COMPLETED') && (
        <ProgressBar sent={campaign.sentCount} failed={campaign.failedCount} total={campaign.totalCount} />
      )}

      <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-600">
        <span>Criada {new Date(campaign.createdAt).toLocaleDateString('pt-PT')}</span>
        {campaign.completedAt && (
          <span>· Concluída {new Date(campaign.completedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>
    </div>
  );
}

function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', message: '', groupId: '' });
  const [error, setError] = useState('');

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups });

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Erro ao criar campanha');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.groupId) { setError('Selecciona um grupo'); return; }
    createMutation.mutate(form);
  };

  const selectedGroup = groups.find((g) => g.id === form.groupId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d14] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-100">Nova campanha</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Nome da campanha</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              maxLength={100}
              placeholder="Ex: Promoção de Verão"
              className="w-full text-sm bg-white/[0.06] border border-white/[0.1] text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Grupo de destinatários</label>
            {groups.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                Ainda não tens grupos. Cria grupos na página de Contactos primeiro.
              </p>
            ) : (
              <select
                value={form.groupId}
                onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
                className="w-full text-sm border border-white/[0.1] text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                style={{ backgroundColor: '#13131f' }}
              >
                <option value="" style={{ backgroundColor: '#13131f', color: '#9ca3af' }}>Seleccionar grupo...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id} style={{ backgroundColor: '#13131f', color: '#e5e7eb' }}>
                    {g.name} ({g.contactCount} contactos)
                  </option>
                ))}
              </select>
            )}
            {selectedGroup && (
              <p className="text-xs text-gray-500 mt-1">
                A mensagem será enviada para <strong className="text-gray-300">{selectedGroup.contactCount}</strong> contactos com 1.2s de intervalo entre cada envio.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Mensagem</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
              maxLength={4096}
              rows={5}
              placeholder="Escreve a mensagem que será enviada a todos os contactos do grupo..."
              className="w-full text-sm bg-white/[0.06] border border-white/[0.1] text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
            <p className="text-[11px] text-gray-600 mt-1">{form.message.length}/4096 caracteres</p>
          </div>

          <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-amber-400/80">
              O WhatsApp só permite enviar mensagens a contactos que já te enviaram uma mensagem nas últimas 24h. Mensagens para outros contactos serão recusadas pela API.
            </p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 text-sm border border-white/[0.1] text-gray-400 rounded-xl py-2.5 hover:bg-white/[0.04] transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || groups.length === 0}
              className="flex-1 text-sm bg-brand-600 text-white rounded-xl py-2.5 hover:bg-brand-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'A criar...' : 'Criar campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CampaignsPage(): React.ReactElement {
  const [showCreate, setShowCreate] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    refetchInterval: (query) => {
      const hasSending = query.state.data?.some((c) => c.status === 'SENDING');
      return hasSending ? 2_000 : 15_000;
    },
  });

  const sending = campaigns.filter((c) => c.status === 'SENDING');
  const drafts = campaigns.filter((c) => c.status === 'DRAFT');
  const done = campaigns.filter((c) => c.status !== 'SENDING' && c.status !== 'DRAFT');

  return (
    <div className="overflow-y-auto flex-1">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-100">Campanhas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Envio de mensagens em massa para grupos de contactos</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors"
          >
            + Nova campanha
          </button>
        </div>

        {isLoading && <p className="text-sm text-gray-500 text-center py-12">A carregar...</p>}

        {!isLoading && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
            </div>
            <h2 className="text-base font-medium text-gray-300 mb-1">Ainda sem campanhas</h2>
            <p className="text-sm text-gray-500 max-w-sm">Cria a tua primeira campanha e envia mensagens para um grupo de contactos.</p>
          </div>
        )}

        <div className="space-y-6">
          {sending.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">A enviar agora</p>
              <div className="space-y-3">
                {sending.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}

          {drafts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rascunhos</p>
              <div className="space-y-3">
                {drafts.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Histórico</p>
              <div className="space-y-3">
                {done.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
