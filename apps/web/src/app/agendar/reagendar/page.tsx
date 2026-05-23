'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '/api/v1';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AppointmentInfo {
  status: string;
  scheduledAt: string;
  service: { name: string; duration: number };
  professional: { name: string };
  tenant: { name: string; slug: string };
}

interface Slot {
  time: string;
  professionalId: string;
  professionalName: string;
  dateTime: string;
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MONTH_NAMES = ['Janeiro','Fevereiro','MarÃ§o','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','SÃ¡b'];

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}
function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}min` : `${h}h`;
}
function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// â”€â”€ Mini calendÃ¡rio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Calendar({ selected, onSelect }: { selected: string | null; onSelect: (d: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg">â€¹</button>
        <span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg">â€º</button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-3 pb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-2">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = new Date(viewYear, viewMonth, day) < today;
          const isSelected = dateStr === selected;
          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => onSelect(dateStr)}
              className={`mx-auto mb-1 w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors font-medium
                ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-gray-900 text-white' : !isPast ? 'hover:bg-gray-100 text-gray-700' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// â”€â”€ PÃ¡gina principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReschedulePage() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [info, setInfo] = useState<AppointmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Passo: 'date' | 'slot' | 'confirm' | 'done'
  const [step, setStep] = useState<'date' | 'slot' | 'confirm' | 'done'>('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Carrega agendamento pelo token
  useEffect(() => {
    if (!token) { setError('Link invÃ¡lido.'); setLoading(false); return; }
    fetch(`${API}/public/agenda/appointment?token=${token}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data: AppointmentInfo) => {
        if (data.status === 'CANCELLED') {
          setError('Este agendamento jÃ¡ foi cancelado e nÃ£o pode ser reagendado.');
        }
        setInfo(data);
        setLoading(false);
      })
      .catch(() => { setError('Agendamento nÃ£o encontrado ou link expirado.'); setLoading(false); });
  }, [token]);

  // Carrega horÃ¡rios quando a data Ã© selecionada
  const loadSlots = useCallback(async (date: string) => {
    if (!info) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const url = `${API}/public/agenda/slots?slug=${info.tenant.slug}&date=${date}&serviceId=`;
      // Precisamos do serviceId â€” vamos buscar via appointment info que tem service.name
      // Como nÃ£o temos o serviceId directo, usamos o endpoint de slots sem filtro de profissional
      // O backend devolve todos os slots disponÃ­veis para todos os profissionais
      const res = await fetch(`${API}/public/agenda/slots?slug=${info.tenant.slug}&date=${date}&serviceId=_&_raw=1`);
      // Fallback: busca slots genÃ©ricos â€” o endpoint real precisa do serviceId
      // Usamos um trick: buscamos os profissionais e os serviÃ§os para obter o serviceId
      const profRes = await fetch(`${API}/public/agenda/professionals?slug=${info.tenant.slug}`);
      const svcRes = await fetch(`${API}/public/agenda/services?slug=${info.tenant.slug}`);

      if (!profRes.ok || !svcRes.ok) throw new Error();

      const services = await svcRes.json() as Array<{ id: string; name: string }>;
      const svc = services.find((s) => s.name === info.service.name);
      if (!svc) throw new Error('ServiÃ§o nÃ£o encontrado');

      const slotsRes = await fetch(`${API}/public/agenda/slots?slug=${info.tenant.slug}&date=${date}&serviceId=${svc.id}`);
      if (!slotsRes.ok) throw new Error();
      const data = await slotsRes.json() as Slot[];
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [info]);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setStep('slot');
    void loadSlots(date);
  }

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/public/agenda/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          scheduledAt: selectedSlot.dateTime,
          professionalId: selectedSlot.professionalId,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? 'Erro ao reagendar');
      }
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao reagendar. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm mb-3">
            <span className="text-2xl">ðŸ—“ï¸</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Reagendar</h1>
          {info && <p className="text-sm text-gray-500 mt-1">{info.tenant.name}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* ConteÃºdo */}
        {!loading && !error && info && (
          <div className="space-y-4">

            {/* Agendamento atual */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agendamento atual</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'ServiÃ§o', value: info.service.name },
                  { label: 'Profissional', value: info.professional.name },
                  { label: 'Data', value: formatDateLong(info.scheduledAt) },
                  { label: 'Hora', value: formatTime(info.scheduledAt) },
                  { label: 'DuraÃ§Ã£o', value: formatDuration(info.service.duration) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-4">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-medium text-gray-800 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PASSO: Escolher data */}
            {step === 'date' && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 px-1">Escolhe a nova data:</p>
                <Calendar selected={selectedDate} onSelect={handleDateSelect} />
              </div>
            )}

            {/* PASSO: Escolher horÃ¡rio */}
            {step === 'slot' && selectedDate && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Escolhe o novo horÃ¡rio</p>
                  </div>
                  <button
                    onClick={() => { setStep('date'); setSelectedSlot(null); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    â† Mudar data
                  </button>
                </div>

                {loadingSlots && (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                )}

                {!loadingSlots && slots.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-500">Sem horÃ¡rios disponÃ­veis neste dia.</p>
                    <button
                      onClick={() => setStep('date')}
                      className="mt-3 text-sm text-gray-600 underline hover:text-gray-800 transition-colors"
                    >
                      Escolher outra data
                    </button>
                  </div>
                )}

                {!loadingSlots && slots.length > 0 && (
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.dateTime === slot.dateTime && selectedSlot?.professionalId === slot.professionalId;
                      return (
                        <button
                          key={`${slot.dateTime}-${slot.professionalId}`}
                          onClick={() => { setSelectedSlot(slot); setStep('confirm'); }}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                            isSelected
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PASSO: Confirmar */}
            {step === 'confirm' && selectedSlot && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Novo agendamento</p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'ServiÃ§o', value: info.service.name },
                      { label: 'Profissional', value: selectedSlot.professionalName },
                      { label: 'Data', value: new Date(selectedSlot.dateTime).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: 'Hora', value: selectedSlot.time },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-gray-400">{row.label}</span>
                        <span className="font-medium text-gray-800 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p className="px-5 pt-3 text-xs text-red-500">{error}</p>}

                <div className="p-5 space-y-2">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'A reagendar...' : 'Confirmar reagendamento'}
                  </button>
                  <button
                    onClick={() => { setStep('slot'); setSelectedSlot(null); setError(''); }}
                    className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    â† Escolher outro horÃ¡rio
                  </button>
                </div>
              </div>
            )}

            {/* PASSO: ConcluÃ­do */}
            {step === 'done' && selectedSlot && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto text-2xl">
                  âœ“
                </div>
                <p className="font-semibold text-gray-900">Reagendado com sucesso!</p>
                <p className="text-sm text-gray-500">
                  O teu agendamento foi marcado para{' '}
                  <strong className="text-gray-700">
                    {new Date(selectedSlot.dateTime).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </strong>{' '}
                  Ã s <strong className="text-gray-700">{selectedSlot.time}</strong>.
                </p>
                <p className="text-xs text-gray-400">ReceberÃ¡s uma confirmaÃ§Ã£o em breve.</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function ReagendarPage() {
  return (
    <Suspense>
      <ReschedulePage />
    </Suspense>
  );
}
