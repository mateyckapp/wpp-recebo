'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  getAppointments,
  getMonthAppointments,
  createAppointment,
  updateAppointmentStatus,
  getServices,
  getAvailableSlots,
  searchContacts,
  createContact,
  STATUS_LABEL,
  STATUS_COLOR,
} from '@/lib/agenda';
import type { Appointment, AppointmentStatus, Service, AvailableSlot } from '@/lib/agenda';
import { Toast } from '@/components/toast';

// ── Helpers ────────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toYearMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDayHeader(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Maps status → dot color class
const STATUS_DOT: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-400',
  CONFIRMED: 'bg-green-400',
  COMPLETED: 'bg-brand-400',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-gray-500',
};

function Calendar({
  selectedDate,
  onSelectDate,
  monthAppointments,
}: {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  monthAppointments: Appointment[];
}) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate + 'T12:00:00'));
  const today = todayISO();

  // Sync viewDate when selectedDate changes to a different month
  useEffect(() => {
    const sel = new Date(selectedDate + 'T12:00:00');
    if (sel.getMonth() !== viewDate.getMonth() || sel.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(sel);
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build appointment map: "YYYY-MM-DD" → Set of statuses
  const dayStatusMap: Record<string, Set<AppointmentStatus>> = {};
  for (const appt of monthAppointments) {
    const key = new Date(appt.scheduledAt).toISOString().slice(0, 10);
    if (!dayStatusMap[key]) dayStatusMap[key] = new Set();
    dayStatusMap[key]!.add(appt.status);
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-600 pb-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = iso === today;
          const isSelected = iso === selectedDate;
          const statuses = dayStatusMap[iso];
          const hasAppts = !!statuses && statuses.size > 0;

          // Pick dominant dot colors (max 3)
          const dotColors = statuses
            ? ([...statuses].slice(0, 3).map((s) => STATUS_DOT[s]))
            : [];

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={`relative flex flex-col items-center rounded-lg py-1.5 transition-colors ${
                isSelected
                  ? 'bg-brand-600 text-white'
                  : isToday
                    ? 'border border-brand-500/40 text-brand-300 hover:bg-brand-600/10'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
              }`}
            >
              <span className="text-xs font-medium leading-none">{day}</span>
              {/* Dots */}
              <div className="mt-1 flex gap-0.5 h-1.5 items-center">
                {hasAppts && dotColors.map((cls, i) => (
                  <span
                    key={i}
                    className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white/70' : cls}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
        {([['PENDING', 'Pendente'], ['CONFIRMED', 'Confirmado'], ['COMPLETED', 'Concluído']] as const).map(([s, label]) => (
          <div key={s} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
            <span className="text-[10px] text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── New Appointment Modal ──────────────────────────────────────────────────────

interface ContactOption { id: string; name: string | null; phoneNumber: string; }

function NewAppointmentModal({
  initialDate,
  onClose,
  onSuccess,
  onToast,
}: {
  initialDate: string;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (title: string, message: string) => void;
}) {
  const [step, setStep] = useState<'contact' | 'service' | 'slot' | 'confirm'>('contact');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(initialDate);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Create contact sub-form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');

  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: getServices });
  const { data: slots = [], isFetching: slotsLoading } = useQuery({
    queryKey: ['slots', date, selectedService?.id],
    queryFn: () => getAvailableSlots(date, selectedService!.id),
    enabled: !!selectedService && step === 'slot',
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAppointment({
        contactId: selectedContact!.id,
        serviceId: selectedService!.id,
        professionalId: selectedSlot!.professionalId,
        scheduledAt: selectedSlot!.dateTime,
        notes: notes || undefined,
      }),
    onSuccess: (appt) => {
      onSuccess();
      onClose();
      onToast(
        'Marcação criada',
        `${appt.contact.name ?? appt.contact.phoneNumber} — ${appt.service.name} às ${new Date(appt.scheduledAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}.`,
      );
    },
  });

  const createContactMutation = useMutation({
    mutationFn: () => createContact({ phoneNumber: newPhone.trim(), name: newName.trim() || undefined }),
    onSuccess: (contact) => {
      setSelectedContact(contact);
      setShowCreateForm(false);
      setStep('service');
      onToast('Contacto criado', `${contact.name ?? contact.phoneNumber} foi adicionado com sucesso.`);
    },
    onError: () => setCreateError('Número já existe ou inválido. Verifique e tente novamente.'),
  });

  // Debounced contact search
  useEffect(() => {
    if (!contactSearch.trim()) { setContacts([]); return; }
    if (searchRef.current) clearTimeout(searchRef.current);
    setSearchLoading(true);
    searchRef.current = setTimeout(async () => {
      try {
        const results = await searchContacts(contactSearch);
        setContacts(results);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [contactSearch]);

  // Group slots by professional
  const slotsByProf: Record<string, { name: string; slots: AvailableSlot[] }> = {};
  for (const slot of slots) {
    if (!slotsByProf[slot.professionalId]) {
      slotsByProf[slot.professionalId] = { name: slot.professionalName, slots: [] };
    }
    slotsByProf[slot.professionalId]!.slots.push(slot);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.10] bg-[#0d0d14] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">Nova marcação</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 'contact' && 'Passo 1 — Contacto'}
              {step === 'service' && 'Passo 2 — Serviço'}
              {step === 'slot' && 'Passo 3 — Data e horário'}
              {step === 'confirm' && 'Passo 4 — Confirmar'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex">
          {(['contact', 'service', 'slot', 'confirm'] as const).map((s, i) => {
            const steps = ['contact', 'service', 'slot', 'confirm'];
            const current = steps.indexOf(step);
            const idx = steps.indexOf(s);
            return (
              <div
                key={s}
                className={`h-0.5 flex-1 transition-colors ${idx <= current ? 'bg-brand-500' : 'bg-white/[0.06]'}`}
              />
            );
          })}
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* ── Step 1: Contact ── */}
          {step === 'contact' && (
            <div className="space-y-3">
              {!showCreateForm ? (
                <>
                  <div className="relative">
                    <input
                      autoFocus
                      placeholder="Pesquisar por nome ou telefone…"
                      value={contactSearch}
                      onChange={(e) => { setContactSearch(e.target.value); setShowCreateForm(false); }}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 pr-8"
                    />
                    {searchLoading && (
                      <div className="absolute right-2.5 top-2.5 h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                    )}
                  </div>

                  {contacts.length > 0 && (
                    <div className="space-y-1">
                      {contacts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedContact(c); setStep('service'); }}
                          className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-sm font-semibold text-brand-400">
                            {(c.name ?? c.phoneNumber).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white">{c.name ?? '—'}</p>
                            <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results — offer to create */}
                  {contactSearch.length > 0 && !searchLoading && contacts.length === 0 && (
                    <div className="rounded-lg border border-dashed border-white/[0.10] bg-white/[0.01] px-4 py-4 text-center space-y-2">
                      <p className="text-xs text-gray-500">Nenhum contacto encontrado.</p>
                      <button
                        onClick={() => {
                          setShowCreateForm(true);
                          // Pre-fill phone if search looks like a number
                          if (/^[\d+\s()-]+$/.test(contactSearch)) setNewPhone(contactSearch);
                          else setNewName(contactSearch);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600/15 border border-brand-500/30 px-3 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-600/25 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Criar novo contacto
                      </button>
                    </div>
                  )}

                  {/* Always visible create button when no search */}
                  {contactSearch.length === 0 && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.10] py-2.5 text-xs text-gray-500 hover:text-gray-300 hover:border-white/[0.20] transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Criar novo contacto
                    </button>
                  )}
                </>
              ) : (
                /* Create contact form */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => { setShowCreateForm(false); setCreateError(''); }}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs font-medium text-gray-400">Novo contacto</span>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Telefone (com indicativo) *</label>
                    <input
                      autoFocus
                      placeholder="Ex: +351 912 345 678"
                      value={newPhone}
                      onChange={(e) => { setNewPhone(e.target.value); setCreateError(''); }}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Nome (opcional)</label>
                    <input
                      placeholder="Nome do cliente"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>

                  {createError && (
                    <p className="text-xs text-red-400">{createError}</p>
                  )}

                  <button
                    disabled={!newPhone.trim() || createContactMutation.isPending}
                    onClick={() => createContactMutation.mutate()}
                    className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
                  >
                    {createContactMutation.isPending ? 'A criar…' : 'Criar e continuar →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Service ── */}
          {step === 'service' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">
                Contacto: <span className="text-gray-300">{selectedContact?.name ?? selectedContact?.phoneNumber}</span>
              </p>
              {services.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">Nenhum serviço disponível.</p>
              )}
              {services.map((s: Service) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep('slot'); }}
                  className="w-full text-left flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 hover:border-brand-500/30 hover:bg-brand-600/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.duration} min{s.price ? ` · €${s.price}` : ''}</p>
                  </div>
                  <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 3: Slot ── */}
          {step === 'slot' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Data:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
                />
              </div>

              {slotsLoading && (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                </div>
              )}

              {!slotsLoading && Object.keys(slotsByProf).length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">Sem horários disponíveis para este dia.</p>
              )}

              {!slotsLoading && Object.entries(slotsByProf).map(([profId, { name, slots: profSlots }]) => (
                <div key={profId}>
                  <p className="text-xs font-medium text-gray-400 mb-2">{name}</p>
                  <div className="flex flex-wrap gap-2">
                    {profSlots.map((slot) => (
                      <button
                        key={slot.dateTime}
                        onClick={() => { setSelectedSlot(slot); setStep('confirm'); }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedSlot?.dateTime === slot.dateTime
                            ? 'border-brand-500 bg-brand-600 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-gray-300 hover:border-brand-500/40 hover:bg-brand-600/10'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
                <Row label="Contacto" value={selectedContact?.name ?? selectedContact?.phoneNumber ?? '—'} />
                <Row label="Serviço" value={selectedService?.name ?? '—'} />
                <Row label="Profissional" value={selectedSlot?.professionalName ?? '—'} />
                <Row
                  label="Data e hora"
                  value={selectedSlot
                    ? new Date(selectedSlot.dateTime).toLocaleString('pt-PT', {
                        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                      })
                    : '—'}
                />
                {selectedService?.price && <Row label="Preço" value={`€${selectedService.price}`} />}
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais…"
                  rows={2}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] gap-3">
          {step !== 'contact' ? (
            <button
              onClick={() => {
                if (step === 'service') setStep('contact');
                else if (step === 'slot') setStep('service');
                else if (step === 'confirm') setStep('slot');
              }}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Voltar
            </button>
          ) : (
            <div />
          )}

          {step === 'confirm' && (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'A guardar…' : 'Confirmar marcação'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-200 text-right">{value}</span>
    </div>
  );
}

// ── Appointment card ───────────────────────────────────────────────────────────

function AppointmentCard({
  appt,
  onStatusChange,
}: {
  appt: Appointment;
  onStatusChange: (id: string, s: AppointmentStatus) => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">
              {appt.contact.name ?? appt.contact.phoneNumber}
            </span>
            <StatusBadge status={appt.status} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {appt.service.name} · {appt.professional.name} · {appt.service.duration} min
            {appt.service.price ? ` · €${appt.service.price}` : ''}
          </p>
          <p className="text-xs font-medium text-brand-400 mt-0.5">{formatTime(appt.scheduledAt)}</p>
          {appt.notes && <p className="text-xs text-gray-500 mt-1 italic">{appt.notes}</p>}
        </div>
      </div>

      {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
        <div className="flex items-center gap-2 flex-wrap">
          {appt.status === 'PENDING' && (
            <>
              <button
                onClick={() => onStatusChange(appt.id, 'CONFIRMED')}
                className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => onStatusChange(appt.id, 'CANCELLED')}
                className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
          {appt.status === 'CONFIRMED' && (
            <>
              <button
                onClick={() => onStatusChange(appt.id, 'COMPLETED')}
                className="rounded-lg bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-500/20 transition-colors"
              >
                Concluir
              </button>
              <button
                onClick={() => onStatusChange(appt.id, 'NO_SHOW')}
                className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/[0.08] transition-colors"
              >
                Faltou
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const qc = useQueryClient();

  const yearMonth = toYearMonth(new Date(selectedDate + 'T12:00:00'));

  const { data: monthAppointments = [] } = useQuery({
    queryKey: ['appointments-month', yearMonth],
    queryFn: () => getMonthAppointments(yearMonth),
    staleTime: 30_000,
  });

  const { data: dayAppointments = [], isLoading } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () => getAppointments({ date: selectedDate }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointments-month'] });
    },
  });

  const grouped = {
    PENDING: dayAppointments.filter((a) => a.status === 'PENDING'),
    CONFIRMED: dayAppointments.filter((a) => a.status === 'CONFIRMED'),
    other: dayAppointments.filter((a) => !['PENDING', 'CONFIRMED'].includes(a.status)),
  };

  const handleNewAppt = () => setShowModal(true);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-5 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-white">Agenda</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de marcações e horários</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewAppt}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova marcação
          </button>
          <Link
            href="/agenda/notificacoes"
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs md:text-sm font-medium text-gray-200 hover:bg-white/[0.08] transition-colors"
          >
            Notificações
          </Link>
          <Link
            href="/agenda/configurar"
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs md:text-sm font-medium text-gray-200 hover:bg-white/[0.08] transition-colors"
          >
            Configurar
          </Link>
        </div>
      </div>

      {/* Content: two-column on desktop, single column on mobile */}
      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
        {/* Left: Calendar */}
        <div className="md:w-72 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06] md:overflow-y-auto p-4">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            monthAppointments={monthAppointments}
          />

          {/* Mini stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-3 text-center">
              <p className="text-2xl font-bold text-white">{monthAppointments.filter((a) => !['CANCELLED'].includes(a.status)).length}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">marcações este mês</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{monthAppointments.filter((a) => a.status === 'CONFIRMED').length}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">confirmadas</p>
            </div>
          </div>
        </div>

        {/* Right: Day view */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Day header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white capitalize">{formatDayHeader(selectedDate)}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {dayAppointments.length === 0
                  ? 'Sem marcações'
                  : `${dayAppointments.length} marcaç${dayAppointments.length === 1 ? 'ão' : 'ões'}`}
              </p>
            </div>
            <button
              onClick={handleNewAppt}
              className="flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-600/10 px-3 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-600/20 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Marcar neste dia
            </button>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl border border-white/[0.08] bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && dayAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.01] py-16 gap-3">
              <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <div className="text-center">
                <p className="text-sm text-gray-500">Sem marcações para este dia</p>
                <p className="text-xs text-gray-600 mt-0.5">Clica em "Marcar neste dia" para adicionar.</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {grouped.PENDING.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400 mb-2">
                  Pendentes ({grouped.PENDING.length})
                </h3>
                <div className="space-y-2">
                  {grouped.PENDING.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      onStatusChange={(id, s) => statusMutation.mutate({ id, status: s })}
                    />
                  ))}
                </div>
              </div>
            )}

            {grouped.CONFIRMED.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-green-400 mb-2">
                  Confirmados ({grouped.CONFIRMED.length})
                </h3>
                <div className="space-y-2">
                  {grouped.CONFIRMED.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      onStatusChange={(id, s) => statusMutation.mutate({ id, status: s })}
                    />
                  ))}
                </div>
              </div>
            )}

            {grouped.other.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Outros ({grouped.other.length})
                </h3>
                <div className="space-y-2">
                  {grouped.other.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appt={a}
                      onStatusChange={(id, s) => statusMutation.mutate({ id, status: s })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <NewAppointmentModal
          initialDate={selectedDate}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['appointments'] });
            qc.invalidateQueries({ queryKey: ['appointments-month'] });
          }}
          onToast={(title, message) => setToast({ title, message })}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
