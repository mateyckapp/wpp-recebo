'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Toast } from '@/components/toast';
import {
  getServices, createService, deleteService,
  getProfessionals, createProfessional, updateProfessional, upsertSchedule,
  getWorkBreaks, createWorkBreak, deleteWorkBreak,
  getTimeBlocks, createTimeBlock, deleteTimeBlock,
  DAY_NAMES,
} from '@/lib/agenda';
import type { Service, Professional, WorkSchedule, WorkBreak, TimeBlock } from '@/lib/agenda';

/* ── Services section ─────────────────────────────────────────────────────── */

function ServicesSection() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', duration: '30', price: '', description: '' });
  const [adding, setAdding] = useState(false);

  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: getServices });

  const createMutation = useMutation({
    mutationFn: () => createService({ name: form.name, duration: Number(form.duration), price: form.price ? Number(form.price) : undefined, description: form.description || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setAdding(false); setForm({ name: '', duration: '30', price: '', description: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Serviços</h2>
        <button onClick={() => setAdding(!adding)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
          {adding ? 'Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {adding && (
        <div className="mb-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-3">
          <input
            placeholder="Nome do serviço *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duração (min) *</label>
              <input
                type="number"
                min="5"
                step="5"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Preço (€)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>
          <input
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
          />
          <button
            disabled={!form.name || !form.duration || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? 'A guardar…' : 'Guardar serviço'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {services.length === 0 && <p className="text-xs text-gray-600 text-center py-4">Nenhum serviço ainda. Adiciona o primeiro.</p>}
        {services.map((s: Service) => (
          <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-sm text-white">{s.name}</p>
              <p className="text-xs text-gray-500">{s.duration} min{s.price ? ` · €${s.price}` : ''}{s.description ? ` · ${s.description}` : ''}</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(s.id)}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Schedule editor ──────────────────────────────────────────────────────── */

function ScheduleEditor({ professional }: { professional: Professional }) {
  const qc = useQueryClient();
  const [schedule, setSchedule] = useState<WorkSchedule[]>(professional.schedule ?? []);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () => upsertSchedule(professional.id, schedule),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professionals'] });
      setToastMsg(professional.name);
    },
  });

  const toggleDay = (day: number) => {
    const exists = schedule.find((s) => s.dayOfWeek === day);
    if (exists) {
      setSchedule(schedule.filter((s) => s.dayOfWeek !== day));
    } else {
      setSchedule([...schedule, { id: '', dayOfWeek: day, startTime: '09:00', endTime: '18:00' }]);
    }
  };

  const updateTime = (day: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(schedule.map((s) => (s.dayOfWeek === day ? { ...s, [field]: value } : s)));
  };

  return (
    <>
      <div className="mt-3 space-y-2">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const entry = schedule.find((s) => s.dayOfWeek === day);
          return (
            <div key={day} className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => toggleDay(day)}
                className={`w-20 text-xs rounded-full px-2 py-1 border transition-colors ${
                  entry
                    ? 'border-brand-500/40 bg-brand-600/10 text-brand-400'
                    : 'border-white/[0.08] bg-white/[0.02] text-gray-500'
                }`}
              >
                {DAY_NAMES[day]}
              </button>
              {entry && (
                <>
                  <input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) => updateTime(day, 'startTime', e.target.value)}
                    className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-white focus:outline-none"
                  />
                  <span className="text-gray-600 text-xs">até</span>
                  <input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) => updateTime(day, 'endTime', e.target.value)}
                    className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </>
              )}
            </div>
          );
        })}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
        >
          {saveMutation.isPending ? 'A guardar…' : 'Guardar horários'}
        </button>
      </div>

      {toastMsg && (
        <Toast
          title="Horários guardados"
          message={`Os horários de ${toastMsg} foram guardados com sucesso.`}
          onClose={() => setToastMsg(null)}
        />
      )}
    </>
  );
}

/* ── Work breaks section ──────────────────────────────────────────────────── */

function WorkBreaksSection({ professional }: { professional: Professional }) {
  const qc = useQueryClient();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const { data: breaks = [], isLoading } = useQuery({
    queryKey: ['work-breaks', professional.id],
    queryFn: () => getWorkBreaks(professional.id),
  });

  const createMutation = useMutation({
    mutationFn: () => createWorkBreak(professional.id, { startTime, endTime, label: label || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-breaks', professional.id] });
      setToast({
        title: 'Intervalo adicionado',
        message: `O intervalo de ${professional.name} foi adicionado das ${startTime} até às ${endTime}.`,
      });
      setStartTime(''); setEndTime(''); setLabel(''); setAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkBreak(professional.id, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-breaks', professional.id] }),
  });

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-gray-600">
        Intervalos aplicam-se a <span className="text-gray-400">todos os dias de trabalho</span>. Os clientes não conseguem marcar nesse horário.
      </p>

      {/* Existing breaks */}
      {isLoading && <p className="text-xs text-gray-600">A carregar…</p>}

      {!isLoading && breaks.length === 0 && !adding && (
        <p className="text-xs text-gray-700 italic">Sem intervalos definidos.</p>
      )}

      <div className="space-y-1.5">
        {breaks.map((b: WorkBreak) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-purple-300">
                {b.startTime}–{b.endTime}
                {b.label && <span className="text-purple-400/70 ml-1">· {b.label}</span>}
              </span>
            </div>
            <button
              onClick={() => deleteMutation.mutate(b.id)}
              className="text-purple-400/50 hover:text-purple-400 transition-colors ml-2 flex-shrink-0"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding ? (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Das *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Às *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Nome</label>
              <input
                placeholder="Ex: Almoço"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white placeholder-gray-700 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!startTime || !endTime || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'A guardar…' : 'Adicionar intervalo'}
            </button>
            <button onClick={() => setAdding(false)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar intervalo
        </button>
      )}

      {toast && (
        <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

/* ── Time blocks section ──────────────────────────────────────────────────── */

function TimeBlocksSection({ professional }: { professional: Professional }) {
  const qc = useQueryClient();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['time-blocks', professional.id],
    queryFn: () => getTimeBlocks(professional.id),
  });

  const createMutation = useMutation({
    mutationFn: () => createTimeBlock(professional.id, { date, startTime, endTime, reason: reason || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-blocks', professional.id] });
      setDate(''); setStartTime(''); setEndTime(''); setReason(''); setAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (blockId: string) => deleteTimeBlock(professional.id, blockId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-blocks', professional.id] }),
  });

  const formatBlock = (b: TimeBlock) => {
    const d = new Date(b.date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${d} · ${b.startTime}–${b.endTime}${b.reason ? ` (${b.reason})` : ''}`;
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Add block form */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar bloqueio
        </button>
      ) : (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <label className="text-[10px] text-gray-500 block mb-1">Data *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Das *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Às *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Motivo</label>
              <input
                placeholder="Opcional"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs text-white placeholder-gray-700 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!date || !startTime || !endTime || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'A guardar…' : 'Bloquear horário'}
            </button>
            <button onClick={() => setAdding(false)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Existing blocks */}
      {isLoading && <p className="text-xs text-gray-600">A carregar…</p>}
      {!isLoading && blocks.length === 0 && (
        <p className="text-xs text-gray-700 italic">Sem bloqueios definidos.</p>
      )}
      <div className="space-y-1.5">
        {blocks.map((b: TimeBlock) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-xs text-orange-300">{formatBlock(b)}</span>
            </div>
            <button
              onClick={() => deleteMutation.mutate(b.id)}
              className="text-orange-400/50 hover:text-orange-400 transition-colors ml-2 flex-shrink-0"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Professionals section ────────────────────────────────────────────────── */

function ProfessionalsSection() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', specialty: '' });
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, 'schedule' | 'breaks' | 'blocks'>>({});

  const { data: professionals = [] } = useQuery({ queryKey: ['professionals'], queryFn: getProfessionals });

  const createMutation = useMutation({
    mutationFn: () => createProfessional({ name: form.name, specialty: form.specialty || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['professionals'] }); setAdding(false); setForm({ name: '', specialty: '' }); },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => updateProfessional(id, { active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
  });

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Profissionais</h2>
        <button onClick={() => setAdding(!adding)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
          {adding ? 'Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {adding && (
        <div className="mb-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-3">
          <input
            placeholder="Nome *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
          />
          <input
            placeholder="Especialidade (ex: Cabeleireiro, Médico)"
            value={form.specialty}
            onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
          />
          <button
            disabled={!form.name || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? 'A guardar…' : 'Guardar profissional'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {professionals.length === 0 && <p className="text-xs text-gray-600 text-center py-4">Nenhum profissional ainda.</p>}
        {professionals.map((p: Professional) => {
          const isExpanded = expandedId === p.id;
          const tab = activeTab[p.id] ?? 'schedule';
          return (
            <div key={p.id} className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{p.name}</p>
                  {p.specialty && <p className="text-xs text-gray-500">{p.specialty}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    {isExpanded ? 'Fechar' : 'Gerir'}
                  </button>
                  <button
                    onClick={() => deactivateMutation.mutate(p.id)}
                    className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3">
                  {/* Tabs */}
                  <div className="flex gap-1 border-b border-white/[0.06] mb-3">
                    <button
                      onClick={() => setActiveTab((t) => ({ ...t, [p.id]: 'schedule' }))}
                      className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                        tab === 'schedule'
                          ? 'border-brand-500 text-brand-400'
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Horários semanais
                    </button>
                    <button
                      onClick={() => setActiveTab((t) => ({ ...t, [p.id]: 'breaks' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                        tab === 'breaks'
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Intervalos
                    </button>
                    <button
                      onClick={() => setActiveTab((t) => ({ ...t, [p.id]: 'blocks' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                        tab === 'blocks'
                          ? 'border-orange-500 text-orange-400'
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Bloqueios pontuais
                    </button>
                  </div>

                  {tab === 'schedule' && <ScheduleEditor professional={p} />}
                  {tab === 'breaks' && <WorkBreaksSection professional={p} />}
                  {tab === 'blocks' && <TimeBlocksSection professional={p} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AgendaConfigPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-white">Configurar Agenda</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define os serviços e horários disponíveis para marcação via WhatsApp</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/agenda/notificacoes"
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs md:text-sm font-medium text-gray-200 hover:bg-white/[0.08] transition-colors"
          >
            Notificações
          </Link>
          <Link
            href="/agenda"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs md:text-sm font-medium text-gray-200 hover:bg-white/[0.08] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-2xl space-y-6">
        <div className="rounded-xl border border-brand-500/20 bg-brand-600/5 px-4 py-3 text-sm text-brand-300">
          Após configurares os serviços e profissionais, a IA do WhatsApp irá automaticamente oferecer marcações aos clientes durante a conversa.
        </div>

        <ServicesSection />
        <ProfessionalsSection />
      </div>
    </div>
  );
}
