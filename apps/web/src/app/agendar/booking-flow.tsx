'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TenantInfo, PublicService, TenantBranding } from './page';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Professional { id: string; name: string; specialty: string | null }
interface Slot { time: string; professionalId: string; professionalName: string; dateTime: string }
interface BookingResult {
  id: string;
  cancelToken: string | null;
  scheduledAt: string;
  service: { name: string; duration: number };
  professional: { name: string };
  clientName: string | null;
  clientPhone: string;
}

type Step = 'service' | 'professional' | 'date' | 'time' | 'contact' | 'done';

const STEPS: Step[] = ['service', 'professional', 'date', 'time', 'contact', 'done'];
const STEP_LABELS = ['ServiÃ§o', 'Profissional', 'Data', 'Hora', 'Dados', 'Confirmado'];

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '/api/v1';

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}min` : `${h}h`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// â”€â”€ Mini Calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'];
const MONTH_NAMES = ['Janeiro','Fevereiro','MarÃ§o','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

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
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">â€¹</button>
        <span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">â€º</button>
      </div>
      {/* Day labels */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 pb-2">{d}</div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(viewYear, viewMonth, day);
          const dateStr = toDateString(date);
          const isPast = date < today;
          const isSelected = selected === dateStr;
          const isToday = toDateString(today) === dateStr;
          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => onSelect(dateStr)}
              className={`
                mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                ${isPast ? 'text-gray-200 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-brand-500 text-white font-semibold shadow-sm' : ''}
                ${!isSelected && isToday ? 'border-2 border-brand-500 text-brand-600 font-semibold' : ''}
                ${!isSelected && !isPast && !isToday ? 'text-gray-700 hover:bg-brand-50 hover:text-brand-600' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// â”€â”€ Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Progress({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  const visibleSteps = STEPS.slice(0, -1); // exclude 'done'
  return (
    <div className="flex items-center gap-1.5">
      {visibleSteps.map((step, i) => (
        <div
          key={step}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < idx ? 'bg-brand-500' : i === idx ? 'bg-brand-400' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function BookingFlow({ slug, info, services, branding }: { slug: string; info: TenantInfo; services: PublicService[]; branding?: TenantBranding }) {
  const color = branding?.primaryColor ?? '#7c3aed';
  const [step, setStep] = useState<Step>('service');
  const [service, setService] = useState<PublicService | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [anyPro, setAnyPro] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingPros, setLoadingPros] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState('');

  // Fetch professionals when entering professional step
  useEffect(() => {
    if (step === 'professional' && professionals.length === 0) {
      setLoadingPros(true);
      fetch(`${API}/public/agenda/professionals?slug=${slug}`)
        .then((r) => r.json())
        .then((d: Professional[]) => setProfessionals(d))
        .catch(() => setProfessionals([]))
        .finally(() => setLoadingPros(false));
    }
  }, [step, slug, professionals.length]);

  // Fetch slots when entering time step
  const fetchSlots = useCallback(() => {
    if (!date || !service) return;
    setLoadingSlots(true);
    setSlots([]);
    const proId = !anyPro && professional ? `&professionalId=${professional.id}` : '';
    fetch(`${API}/public/agenda/slots?slug=${slug}&date=${date}&serviceId=${service.id}${proId}`)
      .then((r) => r.json())
      .then((d: Slot[]) => setSlots(d))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, service, slug, professional, anyPro]);

  useEffect(() => {
    if (step === 'time') fetchSlots();
  }, [step, fetchSlots]);

  async function handleBook() {
    if (!service || !slot || !phone.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/public/agenda/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          serviceId: service.id,
          professionalId: slot.professionalId,
          scheduledAt: slot.dateTime,
          clientName: name.trim() || undefined,
          clientPhone: phone.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as BookingResult;
      setResult(data);
      setStep('done');
    } catch {
      setError('Ocorreu um erro ao marcar o agendamento. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1] as Step);
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logoUrl} alt={info.name} className="w-8 h-8 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                {info.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-base font-semibold text-gray-900">{info.name}</h1>
              <p className="text-xs text-gray-400">Agendamento online</p>
            </div>
          </div>
          {step !== 'done' && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color, backgroundColor: `${color}18` }}>
              {STEP_LABELS[STEPS.indexOf(step)]}
            </span>
          )}
        </div>
        {step !== 'done' && (
          <div className="max-w-lg mx-auto px-4 pb-3">
            <Progress current={step} />
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* â”€â”€ STEP: Service â”€â”€ */}
        {step === 'service' && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-800">Escolhe o serviÃ§o</h2>
            {services.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                Sem serviÃ§os disponÃ­veis de momento.
              </div>
            ) : (
              services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setService(s); setStep('professional'); }}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-brand-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{s.name}</div>
                      {s.description && <div className="text-sm text-gray-400 mt-1 line-clamp-2">{s.description}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      {s.price != null && s.price > 0 && (
                        <div className="text-sm font-semibold text-gray-900">â‚¬{s.price.toFixed(2)}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-0.5">{formatDuration(s.duration)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* â”€â”€ STEP: Professional â”€â”€ */}
        {step === 'professional' && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-800">Escolhe o profissional</h2>
            {loadingPros ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Any professional option */}
                <button
                  onClick={() => { setAnyPro(true); setProfessional(null); setStep('date'); }}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-brand-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 text-lg">âœ¦</div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">Qualquer disponÃ­vel</div>
                      <div className="text-sm text-gray-400">Ver todos os horÃ¡rios disponÃ­veis</div>
                    </div>
                  </div>
                </button>

                {professionals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setProfessional(p); setAnyPro(false); setStep('date'); }}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-brand-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                        {p.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{p.name}</div>
                        {p.specialty && <div className="text-sm text-gray-400">{p.specialty}</div>}
                      </div>
                    </div>
                  </button>
                ))}

                {professionals.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Sem profissionais disponÃ­veis.</p>
                )}
              </>
            )}
            <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">â† Voltar</button>
          </div>
        )}

        {/* â”€â”€ STEP: Date â”€â”€ */}
        {step === 'date' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Escolhe a data</h2>
            <Calendar
              selected={date}
              onSelect={(d) => { setDate(d); setSlot(null); setStep('time'); }}
            />
            <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">â† Voltar</button>
          </div>
        )}

        {/* â”€â”€ STEP: Time â”€â”€ */}
        {step === 'time' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-800">
              HorÃ¡rios disponÃ­veis
              {date && <span className="text-gray-400 font-normal text-sm ml-2">â€” {formatShortDate(date + 'T12:00:00')}</span>}
            </h2>

            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">NÃ£o hÃ¡ horÃ¡rios disponÃ­veis nesta data.</p>
                <button
                  onClick={() => setStep('date')}
                  className="text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
                >
                  Escolher outra data
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <button
                      key={`${s.professionalId}-${s.time}`}
                      onClick={() => { setSlot(s); setStep('contact'); }}
                      className="py-2.5 px-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all"
                    >
                      {s.time}
                      {anyPro && (
                        <div className="text-xs text-gray-400 font-normal truncate mt-0.5">{s.professionalName.split(' ')[0]}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">â† Voltar</button>
          </div>
        )}

        {/* â”€â”€ STEP: Contact â”€â”€ */}
        {step === 'contact' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Os teus dados</h2>

            {/* Summary */}
            {service && slot && (
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">ServiÃ§o</span>
                  <span className="font-medium text-gray-800">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profissional</span>
                  <span className="font-medium text-gray-800">{slot.professionalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data & Hora</span>
                  <span className="font-medium text-gray-800">{formatShortDate(slot.dateTime)} Ã s {slot.time}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O teu nome"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  TelemÃ³vel <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">ObservaÃ§Ãµes <span className="text-gray-300">(opcional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma informaÃ§Ã£o adicional..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              onClick={handleBook}
              disabled={!phone.trim() || submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl text-sm transition-colors shadow-sm"
            >
              {submitting ? 'A confirmar...' : 'Confirmar agendamento'}
            </button>
            <button onClick={goBack} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">â† Voltar</button>
          </div>
        )}

        {/* â”€â”€ STEP: Done â”€â”€ */}
        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">âœ“</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Agendamento confirmado!</h2>
              <p className="text-sm text-gray-500">ReceberÃ¡s uma confirmaÃ§Ã£o em breve.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 text-sm">
              {[
                { label: 'ServiÃ§o', value: result.service.name },
                { label: 'Profissional', value: result.professional.name },
                { label: 'Data', value: formatDate(result.scheduledAt) },
                { label: 'DuraÃ§Ã£o', value: formatDuration(result.service.duration) },
                ...(result.clientName ? [{ label: 'Nome', value: result.clientName }] : []),
                { label: 'TelemÃ³vel', value: result.clientPhone },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-3">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-medium text-gray-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setStep('service');
                setService(null); setProfessional(null); setAnyPro(false);
                setDate(null); setSlot(null); setName(''); setPhone(''); setNotes(''); setResult(null);
              }}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-2xl text-sm transition-colors"
            >
              Fazer outro agendamento
            </button>

            {result.cancelToken && (
              <div className="flex items-center justify-center gap-3 text-center text-xs text-gray-400">
                <a
                  href={`/agendar/reagendar?token=${result.cancelToken}`}
                  className="underline hover:text-gray-600 transition-colors"
                >
                  Reagendar
                </a>
                <span>Â·</span>
                <a
                  href={`/agendar/cancelar?token=${result.cancelToken}`}
                  className="underline hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
