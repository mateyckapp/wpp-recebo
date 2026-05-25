'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type MessageTemplate,
} from '@/lib/templates';
import { fetchAiConfig, updateAiConfig } from '@/lib/ai';
import {
  fetchTeam,
  createTeamMember,
  updateTeamMember,
  removeTeamMember,
  type TeamMember,
} from '@/lib/users';
import {
  fetchSettings,
  updateWhatsappSettings,
  testWhatsappConnection,
} from '@/lib/settings';
import { updateProfile } from '@/lib/users';
import { fetchBranding, updateBranding } from '@/lib/branding';
import {
  fetchStripeConnectStatus,
  createStripeConnectOnboardLink,
  disconnectStripeConnect,
  type StripeConnectStatus,
} from '@/lib/billing';
import { useAuthStore } from '@/stores/auth.store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const inputCls =
  'w-full text-sm border border-white/[0.1] bg-white/[0.06] text-gray-100 placeholder-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition';

function FieldTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center ml-1.5">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-white/20 text-gray-500 text-[10px] font-bold cursor-help group-hover:border-brand-500/50 group-hover:text-brand-400 transition-colors">
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-lg border border-white/[0.1] bg-[#13131f] px-3 py-2.5 text-xs text-gray-300 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-normal">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white/[0.1]" />
      </span>
    </span>
  );
}

const FIELD_HINTS = {
  phoneNumberId:
    'Encontras este ID no Meta Developer Portal → A tua app → WhatsApp → Configuração da API. Aparece abaixo do número de telefone registado, com o label "Phone number ID".',
  businessAccountId:
    'Encontras este ID no Meta Developer Portal → A tua app → WhatsApp → Configuração da API. Aparece no topo da página com o label "WhatsApp Business Account ID".',
  accessToken:
    'Gera um token temporário no Meta Developer Portal → A tua app → WhatsApp → Configuração da API → botão "Generate token". Para produção, cria um token permanente via Utilizador do Sistema no Meta Business Suite.',
};

function TemplateForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: MessageTemplate;
  onSave: (data: Pick<MessageTemplate, 'name' | 'shortcut' | 'content'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [shortcut, setShortcut] = useState(initial?.shortcut ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({ name, shortcut, content });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao guardar template';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="Ex: Boas-vindas"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Atalho</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/</span>
            <input
              value={shortcut}
              onChange={(e) =>
                setShortcut(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
              }
              required
              maxLength={30}
              placeholder="boas-vindas"
              className={`${inputCls} pl-6`}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Conteúdo</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={4096}
          rows={3}
          placeholder="Olá! Obrigado por nos contactar..."
          className={`${inputCls} resize-none`}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 border border-white/[0.1] text-gray-400 rounded-xl hover:bg-white/[0.04] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'A guardar...' : initial ? 'Actualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

function WhatsappSettingsSection(): React.ReactElement {
  const queryClient = useQueryClient();
  const { user: me } = useAuthStore();
  const canEdit = me?.role === 'OWNER' || me?.role === 'ADMIN';

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const [form, setForm] = useState({
    whatsappPhoneNumberId: '',
    whatsappBusinessAccountId: '',
    whatsappAccessToken: '',
  });
  const [editing, setEditing] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; phoneNumber?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const updateMutation = useMutation({
    mutationFn: updateWhatsappSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEditing(false);
      setTestResult(null);
    },
  });

  const handleEdit = () => {
    setForm({
      whatsappPhoneNumberId: settings?.whatsappPhoneNumberId ?? '',
      whatsappBusinessAccountId: settings?.whatsappBusinessAccountId ?? '',
      whatsappAccessToken: '',
    });
    setEditing(true);
    setTestResult(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (form.whatsappPhoneNumberId) payload.whatsappPhoneNumberId = form.whatsappPhoneNumberId;
    if (form.whatsappBusinessAccountId) payload.whatsappBusinessAccountId = form.whatsappBusinessAccountId;
    if (form.whatsappAccessToken) payload.whatsappAccessToken = form.whatsappAccessToken;
    updateMutation.mutate(payload);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testWhatsappConnection();
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = settings?.whatsappPhoneNumberId && settings?.whatsappTokenConfigured;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-gray-100">WhatsApp Business</h2>
          <p className="text-sm text-gray-500 mt-0.5">Credenciais da API oficial da Meta</p>
          <Link
            href="/settings/whatsapp-guide"
            className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors mt-1"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Como obter estas credenciais?
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Configurado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Não configurado
            </span>
          )}
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">A carregar...</p>}

      {!isLoading && !editing && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
              <span className="flex items-center text-xs text-gray-500">
                Phone Number ID
                <FieldTooltip text={FIELD_HINTS.phoneNumberId} />
              </span>
              <span className="text-xs text-gray-300 font-mono">
                {settings?.whatsappPhoneNumberId ?? <span className="text-gray-600 italic">não definido</span>}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
              <span className="flex items-center text-xs text-gray-500">
                Business Account ID
                <FieldTooltip text={FIELD_HINTS.businessAccountId} />
              </span>
              <span className="text-xs text-gray-300 font-mono">
                {settings?.whatsappBusinessAccountId ?? <span className="text-gray-600 italic">não definido</span>}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center text-xs text-gray-500">
                Access Token
                <FieldTooltip text={FIELD_HINTS.accessToken} />
              </span>
              <span className="text-xs text-gray-300 font-mono">
                {settings?.whatsappTokenConfigured
                  ? settings.whatsappAccessToken
                  : <span className="text-gray-600 italic">não definido</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isConfigured && (
              <button
                onClick={handleTest}
                disabled={testing}
                className="text-sm px-4 py-2 border border-white/[0.1] text-gray-300 rounded-xl hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
              >
                {testing ? 'A testar...' : 'Testar ligação'}
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleEdit}
                className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors"
              >
                {isConfigured ? 'Editar credenciais' : 'Configurar'}
              </button>
            )}
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${
              testResult.ok
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {testResult.ok ? (
                <>
                  <span>✓</span>
                  <span>Ligação OK — número: <strong>{testResult.phoneNumber}</strong></span>
                </>
              ) : (
                <>
                  <span>✗</span>
                  <span>{testResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="flex items-center text-xs font-medium text-gray-400 mb-1">
              Phone Number ID
              <FieldTooltip text={FIELD_HINTS.phoneNumberId} />
            </label>
            <input
              value={form.whatsappPhoneNumberId}
              onChange={(e) => setForm((f) => ({ ...f, whatsappPhoneNumberId: e.target.value }))}
              placeholder="Ex: 1109080812294064"
              className={inputCls}
            />
          </div>
          <div>
            <label className="flex items-center text-xs font-medium text-gray-400 mb-1">
              Business Account ID
              <FieldTooltip text={FIELD_HINTS.businessAccountId} />
            </label>
            <input
              value={form.whatsappBusinessAccountId}
              onChange={(e) => setForm((f) => ({ ...f, whatsappBusinessAccountId: e.target.value }))}
              placeholder="Ex: 1685824006177308"
              className={inputCls}
            />
          </div>
          <div>
            <label className="flex items-center text-xs font-medium text-gray-400 mb-1">
              Access Token
              <FieldTooltip text={FIELD_HINTS.accessToken} />
              <span className="ml-2 text-gray-600 font-normal">(deixa em branco para manter o actual)</span>
            </label>
            <input
              value={form.whatsappAccessToken}
              onChange={(e) => setForm((f) => ({ ...f, whatsappAccessToken: e.target.value }))}
              placeholder="EAAck..."
              className={inputCls}
            />
          </div>
          {updateMutation.isError && (
            <p className="text-xs text-red-400">Erro ao guardar. Tenta novamente.</p>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm px-4 py-2 border border-white/[0.1] text-gray-400 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = { OWNER: 'Dono', ADMIN: 'Admin', AGENT: 'Agente' };

function TeamSection(): React.ReactElement {
  const queryClient = useQueryClient();
  const { user: me } = useAuthStore();
  const isOwnerOrAdmin = me?.role === 'OWNER' || me?.role === 'ADMIN';
  const isOwner = me?.role === 'OWNER';

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'AGENT' as 'ADMIN' | 'AGENT', password: '' });
  const [formError, setFormError] = useState('');
  const [createdPassword, setCreatedPassword] = useState('');

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeam,
  });

  const createMutation = useMutation({
    mutationFn: createTeamMember,
    onSuccess: (member) => {
      void queryClient.invalidateQueries({ queryKey: ['team'] });
      setCreatedPassword(form.password);
      setForm({ name: '', email: '', role: 'AGENT', password: '' });
      setShowForm(false);
      setFormError('');
      alert(`Utilizador "${member.name}" criado.\nEmail: ${member.email}\nPalavra-passe temporária: ${createdPassword || form.password}\n\nPartilha estas credenciais com o agente.`);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e?.response?.data?.message ?? 'Erro ao criar utilizador');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; role?: 'ADMIN' | 'AGENT'; isActive?: boolean }) =>
      updateTeamMember(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team'] });
      setEditingMember(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    createMutation.mutate(form);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-100">Equipa</h2>
          <p className="text-sm text-gray-500 mt-0.5">Utilizadores com acesso ao painel</p>
        </div>
        {isOwnerOrAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors"
          >
            + Adicionar
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-3">
          <p className="text-sm font-medium text-gray-300">Novo utilizador</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="Ana Silva"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                placeholder="ana@empresa.pt"
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Função</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'ADMIN' | 'AGENT' }))}
                className={inputCls}
                style={{ backgroundColor: '#13131f' }}
              >
                <option value="AGENT" style={{ backgroundColor: '#13131f', color: '#e5e7eb' }}>Agente</option>
                {isOwner && <option value="ADMIN" style={{ backgroundColor: '#13131f', color: '#e5e7eb' }}>Admin</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Palavra-passe temporária</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                placeholder="mínimo 8 caracteres"
                className={inputCls}
              />
            </div>
          </div>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className="text-sm px-4 py-2 border border-white/[0.1] text-gray-400 rounded-xl hover:bg-white/[0.04] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={createMutation.isPending} className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors">
              {createMutation.isPending ? 'A criar...' : 'Criar utilizador'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-gray-500 text-center py-4">A carregar...</p>}

      <div className="space-y-2">
        {team.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-colors">
            <div className="w-9 h-9 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-200 truncate">{member.name}</p>
                {member.id === me?.id && (
                  <span className="text-[10px] text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded">tu</span>
                )}
                {!member.isActive && (
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">inactivo</span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {editingMember?.id === member.id ? (
                <select
                  value={editingMember.role === 'OWNER' ? 'OWNER' : editingMember.role}
                  onChange={(e) =>
                    updateMutation.mutate({ id: member.id, role: e.target.value as 'ADMIN' | 'AGENT' })
                  }
                  className="text-xs bg-white/[0.06] border border-white/[0.1] text-gray-300 rounded-lg px-2 py-1"
                >
                  <option value="AGENT">Agente</option>
                  {isOwner && <option value="ADMIN">Admin</option>}
                </select>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  member.role === 'OWNER'
                    ? 'bg-brand-600/15 text-brand-400 border-brand-500/20'
                    : member.role === 'ADMIN'
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                    : 'bg-white/[0.05] text-gray-400 border-white/[0.08]'
                }`}>
                  {ROLE_LABELS[member.role]}
                </span>
              )}

              {isOwnerOrAdmin && member.id !== me?.id && member.role !== 'OWNER' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingMember(editingMember?.id === member.id ? null : member)}
                    className="text-xs text-gray-500 hover:text-brand-400 px-2 py-1 rounded-lg hover:bg-brand-600/10 transition-colors"
                  >
                    {editingMember?.id === member.id ? 'Fechar' : 'Editar'}
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: member.id, isActive: !member.isActive })}
                    className="text-xs text-gray-500 hover:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors"
                  >
                    {member.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => {
                        if (confirm(`Remover "${member.name}" permanentemente?`)) {
                          removeMutation.mutate(member.id);
                        }
                      }}
                      className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSection(): React.ReactElement {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) return;

    if ((currentPassword || newPassword) && newPassword.length < 8) {
      setError('A nova password deve ter pelo menos 8 caracteres');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name !== user?.name ? name : undefined,
        ...(currentPassword && newPassword ? { currentPassword, newPassword } : {}),
      });
      setUser({ ...user!, name: updated.name });
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Perfil actualizado com sucesso');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Erro ao guardar. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-100">O meu perfil</h2>
        <p className="text-sm text-gray-500 mt-0.5">Nome e palavra-passe da tua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar initials */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600/25 text-brand-300 flex items-center justify-center text-xl font-bold flex-shrink-0 border border-brand-500/20">
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="O teu nome"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
          <input
            value={user?.email ?? ''}
            disabled
            className={`${inputCls} opacity-40 cursor-not-allowed`}
          />
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-xs font-medium text-gray-400 mb-3">Alterar palavra-passe <span className="text-gray-600 font-normal">(opcional)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Palavra-passe actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nova palavra-passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="mínimo 8 caracteres"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-emerald-400">{success}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'A guardar...' : 'Guardar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}

function BrandingSection(): React.ReactElement {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['branding'], queryFn: fetchBranding });

  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      setLogoUrl(data.logoUrl ?? '');
      setPrimaryColor(data.primaryColor ?? '#7c3aed');
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateBranding({
        logoUrl: logoUrl.trim() || null,
        primaryColor,
      });
      void queryClient.invalidateQueries({ queryKey: ['branding'] });
      setSuccess(true);
    } catch {
      setError('Erro ao guardar. Verifica o URL da logo.');
    } finally {
      setSaving(false);
    }
  };

  const PRESET_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#db2777', '#0891b2', '#374151'];

  if (isLoading) return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6"><p className="text-sm text-gray-500">A carregar...</p></div>;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-100">Personalização da página pública</h2>
        <p className="text-sm text-gray-500 mt-0.5">Logo e cor que aparecem na página de agendamento dos teus clientes</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
            style={{ backgroundColor: primaryColor }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              data?.name?.charAt(0).toUpperCase() ?? 'W'
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">{data?.name}</p>
            <p className="text-xs text-gray-500">Pré-visualização da marca</p>
          </div>
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">URL da logo <span className="text-gray-600 font-normal">(opcional)</span></label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://empresa.pt/logo.png"
            className={inputCls}
          />
          <p className="text-xs text-gray-600 mt-1">Usa um link directo para uma imagem (PNG, SVG). O ideal é 64×64px ou maior.</p>
        </div>

        {/* Cor primária */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Cor primária</label>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPrimaryColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${primaryColor === c ? 'ring-2 ring-offset-2 ring-white/40 ring-offset-[#0d0d14] scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-white/[0.1] bg-transparent"
              title="Cor personalizada"
            />
            <span className="text-xs font-mono text-gray-400">{primaryColor}</span>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-emerald-400">Guardado com sucesso</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors">
            {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AiSettingsSection(): React.ReactElement {
  const queryClient = useQueryClient();

  const { data: aiConfig, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-config'],
    queryFn: fetchAiConfig,
  });

  const [businessContext, setBusinessContext] = useState('');
  const [toggleError, setToggleError] = useState('');

  useEffect(() => {
    if (aiConfig?.businessContext) {
      setBusinessContext(aiConfig.businessContext);
    }
  }, [aiConfig?.businessContext]);

  const toggleMutation = useMutation({
    mutationFn: (isEnabled: boolean) => updateAiConfig({ isEnabled }),
    onSuccess: () => {
      setToggleError('');
      void queryClient.invalidateQueries({ queryKey: ['ai-config'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setToggleError(e?.response?.data?.message ?? e?.message ?? 'Erro ao actualizar');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => updateAiConfig({ businessContext }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['ai-config'] }),
  });

  if (aiLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
        <p className="text-sm text-gray-500">A carregar configuração de IA...</p>
      </div>
    );
  }

  const isEnabled = aiConfig?.isEnabled ?? false;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-gray-100">Assistente de IA</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Responde automaticamente a mensagens com Claude Haiku
          </p>
        </div>
        <button
          onClick={() => toggleMutation.mutate(!isEnabled)}
          disabled={toggleMutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isEnabled ? 'bg-brand-600' : 'bg-white/[0.1]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {toggleError && <p className="text-xs text-red-400">{toggleError}</p>}

      {isEnabled && (
        <>
          <div className="border-t border-white/[0.06] pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Contexto do negócio
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Descreve o teu negócio, produtos, horários e instruções para o assistente seguir.
            </p>
            <textarea
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              rows={6}
              placeholder={`Ex: Somos uma clínica dentária em Viseu, aberta de segunda a sexta das 9h às 18h.\n\nServiços: consultas, limpezas, ortodontia.\n\nSempre que alguém pedir marcação, pede o nome completo e número de telefone.`}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Modelo: Claude Haiku — respostas rápidas e económicas
            </p>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors"
            >
              {saveMutation.isPending ? 'A guardar...' : saveMutation.isSuccess ? 'Guardado!' : 'Guardar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StripeConnectSection(): React.ReactElement {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const connectResult = searchParams.get('stripe_connect');

  const { data: status, isLoading } = useQuery<StripeConnectStatus>({
    queryKey: ['stripe-connect-status'],
    queryFn: fetchStripeConnectStatus,
    refetchOnWindowFocus: true,
  });

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const disconnectMutation = useMutation({
    mutationFn: disconnectStripeConnect,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['stripe-connect-status'] }),
    onError: () => setError('Erro ao desligar conta Stripe'),
  });

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      const { url } = await createStripeConnectOnboardLink();
      window.location.href = url;
    } catch {
      setError('Erro ao iniciar ligação Stripe');
      setConnecting(false);
    }
  };

  const isFullyOnboarded = status?.connected && status?.onboarded;
  const isPartiallyConnected = status?.connected && !status?.onboarded;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-gray-100">Receber Pagamentos</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Liga a tua conta Stripe para receber pagamentos directamente dos teus clientes
          </p>
        </div>
        <div>
          {isLoading ? null : isFullyOnboarded ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Conta ligada
            </span>
          ) : isPartiallyConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              A aguardar verificação
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              Não configurado
            </span>
          )}
        </div>
      </div>

      {connectResult === 'success' && (
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span>✓</span>
          <span>Conta Stripe ligada com sucesso! Podes agora criar pedidos de pagamento.</span>
        </div>
      )}

      {connectResult === 'refresh' && (
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <span>⚠</span>
          <span>O link de configuração expirou. Clica em "Continuar configuração" para gerar um novo.</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {isFullyOnboarded && (
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                <span className="text-xs text-gray-500">ID da conta</span>
                <span className="text-xs text-gray-300 font-mono">{status.accountId}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-gray-500">Pagamentos activos</span>
                <span className="text-xs text-emerald-400">Sim</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {!isFullyOnboarded && (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-colors"
              >
                {connecting
                  ? 'A redirecionar...'
                  : isPartiallyConnected
                  ? 'Continuar configuração'
                  : 'Ligar conta Stripe'}
              </button>
            )}
            {status?.connected && (
              <button
                onClick={() => {
                  if (confirm('Tens a certeza que queres desligar a conta Stripe? Os pedidos de pagamento existentes não serão afectados.')) {
                    disconnectMutation.mutate();
                  }
                }}
                disabled={disconnectMutation.isPending}
                className="text-sm px-4 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 disabled:opacity-50 transition-colors"
              >
                {disconnectMutation.isPending ? 'A desligar...' : 'Desligar conta'}
              </button>
            )}
          </div>

          {!status?.connected && (
            <p className="text-xs text-gray-600">
              Serás redirectionado para o Stripe para criar ou ligar a tua conta. O processo demora menos de 5 minutos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Partial<Pick<MessageTemplate, 'name' | 'shortcut' | 'content'>>) =>
      updateTemplate(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  return (
    <div className="overflow-y-auto flex-1">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileSection />
        <BrandingSection />
        <Suspense>
          <StripeConnectSection />
        </Suspense>
        <WhatsappSettingsSection />
        <TeamSection />
        <AiSettingsSection />

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-100">Templates de mensagem</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Resposta rápida com{' '}
                <span className="font-mono text-xs bg-white/[0.06] text-gray-400 px-1.5 py-0.5 rounded">/atalho</span>{' '}
                no chat
              </p>
            </div>
            {!showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="text-sm px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors"
              >
                + Novo
              </button>
            )}
          </div>

          {showCreate && (
            <div className="mb-4 p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
              <p className="text-sm font-medium text-gray-300 mb-3">Novo template</p>
              <TemplateForm
                onSave={async (data) => {
                  await createMutation.mutateAsync(data);
                }}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          )}

          {isLoading && (
            <p className="text-sm text-gray-500 text-center py-6">A carregar...</p>
          )}

          {!isLoading && templates.length === 0 && !showCreate && (
            <p className="text-sm text-gray-500 text-center py-6">
              Ainda não tens templates. Cria o primeiro!
            </p>
          )}

          <div className="space-y-2">
            {templates.map((t) =>
              editingId === t.id ? (
                <div key={t.id} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                  <TemplateForm
                    initial={t}
                    onSave={async (data) => {
                      await updateMutation.mutateAsync({ id: t.id, ...data });
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div
                  key={t.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-mono text-xs bg-brand-600/15 text-brand-400 border border-brand-500/20 px-2 py-1 rounded mt-0.5 flex-shrink-0">
                    /{t.shortcut}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200">{t.name}</p>
                    <p className="text-xs text-gray-500 truncate">{t.content}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(t.id)}
                      className="text-xs text-gray-500 hover:text-brand-400 px-2 py-1 rounded-lg hover:bg-brand-600/10 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminar template "${t.name}"?`)) {
                          deleteMutation.mutate(t.id);
                        }
                      }}
                      className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
