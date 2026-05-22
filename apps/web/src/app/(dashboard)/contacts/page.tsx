'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts,
  fetchContact,
  updateContact,
  fetchGroups,
  createGroup,
  deleteGroup,
  addContactToGroup,
  removeContactFromGroup,
  type Contact,
  type ContactGroup,
} from '@/lib/contacts';
import { api } from '@/lib/api';

function initials(name: string | null, phone: string): string {
  if (name) return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return phone.slice(-2);
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(d: string | null): string {
  if (!d) return '—';
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

const GROUP_COLORS = ['#6B7280','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6'];

// ─── Painel de grupos (sidebar esquerdo) ─────────────────────────────────────

function GroupsPanel({
  groups,
  selectedGroupId,
  onSelect,
}: {
  groups: ContactGroup[];
  selectedGroupId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(GROUP_COLORS[0]!);

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      setName('');
      setColor(GROUP_COLORS[0]!);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      if (selectedGroupId === id) onSelect(null);
    },
  });

  return (
    <div className="flex flex-col h-full border-r border-white/[0.06] w-48 flex-shrink-0">
      <div className="px-3 pt-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Grupos</span>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-gray-500 hover:text-brand-400 transition-colors"
            title="Novo grupo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {showForm && (
          <div className="mt-2 space-y-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do grupo"
              maxLength={60}
              className="w-full text-xs bg-white/[0.06] border border-white/[0.1] text-gray-200 placeholder-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
            />
            <div className="flex gap-1 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/40' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowForm(false)} className="flex-1 text-xs text-gray-500 hover:text-gray-300 py-1">
                Cancelar
              </button>
              <button
                onClick={() => { if (name.trim()) createMutation.mutate({ name: name.trim(), color }); }}
                disabled={!name.trim() || createMutation.isPending}
                className="flex-1 text-xs bg-brand-600 text-white rounded-lg py-1 hover:bg-brand-500 disabled:opacity-50 transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
            !selectedGroupId ? 'text-brand-400 bg-brand-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
          }`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span className="truncate text-xs font-medium">Todos</span>
        </button>

        {groups.map((g) => (
          <div key={g.id} className="group flex items-center gap-1 px-1">
            <button
              onClick={() => onSelect(g.id)}
              className={`flex-1 flex items-center gap-2 px-2 py-2 text-xs rounded-lg transition-colors min-w-0 ${
                selectedGroupId === g.id
                  ? 'text-gray-100 bg-white/[0.08]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
              <span className="truncate font-medium">{g.name}</span>
              <span className="ml-auto text-gray-600 flex-shrink-0">{g.contactCount}</span>
            </button>
            <button
              onClick={() => { if (confirm(`Eliminar grupo "${g.name}"?`)) deleteMutation.mutate(g.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Painel de detalhe ────────────────────────────────────────────────────────

function ContactDetail({ contactId, groups, onClose }: { contactId: string; groups: ContactGroup[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', notes: '' });

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchContact(contactId),
  });

  useEffect(() => {
    if (contact && !editing) {
      setForm({ name: contact.name ?? '', email: contact.email ?? '', notes: contact.notes ?? '' });
    }
  }, [contact, editing]);

  const saveMutation = useMutation({
    mutationFn: () => updateContact(contactId, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      void queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setEditing(false);
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) => addContactToGroup(groupId, contactId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      void queryClient.invalidateQueries({ queryKey: ['contacts'] });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) => removeContactFromGroup(groupId, contactId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      void queryClient.invalidateQueries({ queryKey: ['contacts'] });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><span className="text-sm text-gray-500">A carregar...</span></div>;
  }
  if (!contact) return null;

  const name = contact.name ?? contact.phoneNumber;
  const contactGroupIds = new Set(contact.groups?.map((g) => g.id) ?? []);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1 -ml-1">✕</button>
        <span className="font-semibold text-gray-200 text-sm flex-1">Detalhes do contacto</span>
        {!editing && (
          <button
            onClick={() => { setForm({ name: contact.name ?? '', email: contact.email ?? '', notes: contact.notes ?? '' }); setEditing(true); }}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors px-3 py-1.5 rounded-lg border border-brand-500/30 hover:bg-brand-600/10"
          >
            Editar
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-xl font-semibold flex-shrink-0">
            {initials(contact.name, contact.phoneNumber)}
          </div>
          <div>
            <p className="font-semibold text-gray-100 text-base">{name}</p>
            <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do contacto" className="w-full text-sm bg-white/[0.06] border border-white/[0.1] text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.pt" className="w-full text-sm bg-white/[0.06] border border-white/[0.1] text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Notas</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={4} placeholder="Informação adicional..." className="w-full text-sm bg-white/[0.06] border border-white/[0.1] text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditing(false)} className="flex-1 text-sm border border-white/[0.1] text-gray-400 rounded-xl py-2 hover:bg-white/[0.04] transition-colors">Cancelar</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1 text-sm bg-brand-600 text-white rounded-xl py-2 hover:bg-brand-500 disabled:opacity-50 transition-colors">
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow label="Telefone" value={contact.phoneNumber} />
            <InfoRow label="Email" value={contact.email ?? '—'} />
            <InfoRow label="Última interacção" value={formatDate(contact.lastInteraction)} />
            <InfoRow label="Membro desde" value={formatDate(contact.createdAt)} />
            {contact.notes && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Notas</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Grupos */}
        {!editing && groups.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Grupos</p>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const isMember = contactGroupIds.has(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => isMember ? removeGroupMutation.mutate(g.id) : addGroupMutation.mutate(g.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                      isMember
                        ? 'border-transparent text-white'
                        : 'border-white/[0.1] text-gray-500 hover:border-white/[0.2] hover:text-gray-300'
                    }`}
                    style={isMember ? { backgroundColor: g.color + '33', borderColor: g.color + '66', color: g.color } : {}}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                    {g.name}
                    {isMember && <span className="ml-0.5 opacity-70">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversas recentes */}
        {!editing && contact.conversations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Conversas recentes · {contact._count.conversations}
            </p>
            <div className="space-y-1.5">
              {contact.conversations.map((conv) => (
                <div key={conv.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  {conv.kanbanColumn && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: conv.kanbanColumn.color }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300">{conv.kanbanColumn?.name ?? 'Sem coluna'}</p>
                    <p className="text-[11px] text-gray-600">{formatTime(conv.lastMessageAt)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    conv.status === 'OPEN' ? 'bg-emerald-500/15 text-emerald-400' : conv.status === 'CLOSED' ? 'bg-gray-500/15 text-gray-400' : 'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {conv.status === 'OPEN' ? 'Aberta' : conv.status === 'CLOSED' ? 'Fechada' : 'Arquivada'}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-300 text-right">{value}</span>
    </div>
  );
}

// ─── Linha da lista ────────────────────────────────────────────────────────────

function ContactRow({ contact, selected, onClick }: { contact: Contact; selected: boolean; onClick: () => void }) {
  const name = contact.name ?? contact.phoneNumber;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-white/[0.04] ${
        selected ? 'bg-brand-600/15 border-l-2 border-l-brand-500' : 'hover:bg-white/[0.04] border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-sm font-semibold">
        {initials(contact.name, contact.phoneNumber)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${selected ? 'text-brand-300' : 'text-gray-200'}`}>{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-gray-500 truncate">{contact.phoneNumber}</p>
          {contact.groups?.slice(0, 2).map((g) => (
            <span key={g.id} className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} title={g.name} />
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <span className="text-xs text-gray-600">{contact._count.conversations}</span>
        <svg className="w-3 h-3 text-gray-700 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    </button>
  );
}

// ─── Importação CSV ───────────────────────────────────────────────────────────

function parseCsv(text: string): Array<{ phoneNumber: string; name?: string; email?: string }> {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];

  const headers = lines[0]!.split(/[,;]/).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const phoneIdx = headers.findIndex((h) => ['phone', 'phonenumber', 'telefone', 'telemovel', 'numero'].includes(h));
  const nameIdx = headers.findIndex((h) => ['name', 'nome'].includes(h));
  const emailIdx = headers.findIndex((h) => ['email', 'mail', 'correio'].includes(h));

  if (phoneIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cells = line.split(/[,;]/).map((c) => c.trim().replace(/['"]/g, ''));
    return {
      phoneNumber: cells[phoneIdx] ?? '',
      ...(nameIdx >= 0 && cells[nameIdx] ? { name: cells[nameIdx] } : {}),
      ...(emailIdx >= 0 && cells[emailIdx] ? { email: cells[emailIdx] } : {}),
    };
  }).filter((r) => r.phoneNumber.length >= 7);
}

function CsvImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Array<{ phoneNumber: string; name?: string; email?: string }>>([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      if (!parsed.length) {
        setError('Não foi possível ler o ficheiro. Verifica se tem uma coluna "phone" ou "nome".');
      } else {
        setRows(parsed);
        setError('');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ created: number; skipped: number }>('/contacts/import', { rows });
      setResult(data);
      onSuccess();
    } catch {
      setError('Erro ao importar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d14] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-100">Importar contactos via CSV</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">✕</button>
        </div>

        {!result ? (
          <>
            <p className="text-xs text-gray-500">
              O ficheiro CSV deve ter pelo menos uma coluna chamada <code className="text-brand-400">phone</code> (ou <code className="text-brand-400">telefone</code>).
              Colunas opcionais: <code className="text-brand-400">name</code>, <code className="text-brand-400">email</code>.
            </p>

            <div
              className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-brand-500/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              <p className="text-sm text-gray-400">Clica para seleccionar o ficheiro CSV</p>
              {rows.length > 0 && (
                <p className="text-xs text-emerald-400 mt-2">{rows.length} contactos detectados</p>
              )}
            </div>

            {rows.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="grid grid-cols-3 px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
                  <span className="text-[10px] font-medium text-gray-500 uppercase">Telefone</span>
                  <span className="text-[10px] font-medium text-gray-500 uppercase">Nome</span>
                  <span className="text-[10px] font-medium text-gray-500 uppercase">Email</span>
                </div>
                {rows.slice(0, 5).map((r, i) => (
                  <div key={i} className="grid grid-cols-3 px-3 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-gray-300 font-mono truncate">{r.phoneNumber}</span>
                    <span className="text-xs text-gray-400 truncate">{r.name ?? '—'}</span>
                    <span className="text-xs text-gray-400 truncate">{r.email ?? '—'}</span>
                  </div>
                ))}
                {rows.length > 5 && (
                  <div className="px-3 py-2 text-center">
                    <span className="text-xs text-gray-600">+{rows.length - 5} mais…</span>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-2 justify-end pt-1">
              <button onClick={onClose} className="text-sm px-4 py-2 border border-white/[0.1] text-gray-400 rounded-xl hover:bg-white/[0.04] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!rows.length || loading}
                className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'A importar...' : `Importar ${rows.length} contactos`}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <p className="font-semibold text-gray-100">Importação concluída</p>
            <p className="text-sm text-gray-400">
              <strong className="text-emerald-400">{result.created}</strong> criados ·{' '}
              <strong className="text-gray-500">{result.skipped}</strong> ignorados (já existentes ou inválidos)
            </p>
            <button onClick={onClose} className="text-sm px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ContactsPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const { data: groupsData = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search, selectedGroupId],
    queryFn: () => fetchContacts({ search: search || undefined, groupId: selectedGroupId ?? undefined }),
    refetchInterval: 30_000,
  });

  const contacts = data?.items ?? [];

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Painel de grupos */}
      <GroupsPanel
        groups={groupsData}
        selectedGroupId={selectedGroupId}
        onSelect={(id) => { setSelectedGroupId(id); setSelectedId(null); }}
      />

      {/* Lista de contactos */}
      <div className={`flex flex-col border-r border-white/[0.06] ${selectedId ? 'hidden md:flex md:w-72' : 'flex-1 md:w-72 md:flex-none'}`}>
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-100">Contactos</h1>
            <div className="flex items-center gap-2">
              {data && <span className="text-xs text-gray-500">{data.total} total</span>}
              <button
                onClick={() => setShowImport(true)}
                className="text-xs px-2.5 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-500/20 rounded-lg hover:bg-brand-600/30 transition-colors"
              >
                Importar CSV
              </button>
            </div>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/[0.05] border border-white/[0.08] rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && <div className="flex items-center justify-center py-12"><span className="text-sm text-gray-500">A carregar...</span></div>}

          {!isLoading && contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-sm text-gray-500">
                {search ? 'Sem resultados' : selectedGroupId ? 'Nenhum contacto neste grupo' : 'Ainda não há contactos'}
              </p>
              {search && <button onClick={() => setSearch('')} className="mt-2 text-xs text-brand-400 hover:text-brand-300">Limpar pesquisa</button>}
            </div>
          )}

          {contacts.map((c) => (
            <ContactRow key={c.id} contact={c} selected={selectedId === c.id} onClick={() => setSelectedId(c.id)} />
          ))}
        </div>
      </div>

      {/* Modal importação CSV */}
      {showImport && (
        <CsvImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['contacts'] })}
        />
      )}

      {/* Painel de detalhe */}
      {selectedId ? (
        <div className="flex-1 min-w-0">
          <ContactDetail contactId={selectedId} groups={groupsData} onClose={() => setSelectedId(null)} />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Seleciona um contacto</p>
          </div>
        </div>
      )}
    </div>
  );
}
