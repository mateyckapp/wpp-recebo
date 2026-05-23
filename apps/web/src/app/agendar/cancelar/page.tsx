'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API = '/api/v1';

interface AppointmentInfo {
  status: string;
  scheduledAt: string;
  service: { name: string; duration: number };
  professional: { name: string };
  tenant: { name: string; slug: string };
}

function formatDate(iso: string) {
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

function CancelPage() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [info, setInfo] = useState<AppointmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!token) { setError('Link inválido.'); setLoading(false); return; }
    fetch(`${API}/public/agenda/appointment?token=${token}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data: AppointmentInfo) => { setInfo(data); setLoading(false); })
      .catch(() => { setError('Agendamento não encontrado ou link expirado.'); setLoading(false); });
  }, [token]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`${API}/public/agenda/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? 'Erro ao cancelar');
      }
      setCancelled(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao cancelar. Tenta novamente.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Cancelar agendamento</h1>
          {info && <p className="text-sm text-gray-500 mt-1">{info.tenant.name}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && info && !cancelled && (
            <>
              {info.status === 'CANCELLED' ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">Este agendamento já foi cancelado.</p>
                </div>
              ) : (
                <>
                  <div className="p-5 space-y-3 text-sm border-b border-gray-100">
                    {[
                      { label: 'Serviço', value: info.service.name },
                      { label: 'Profissional', value: info.professional.name },
                      { label: 'Data', value: formatDate(info.scheduledAt) },
                      { label: 'Hora', value: formatTime(info.scheduledAt) },
                      { label: 'Duração', value: formatDuration(info.service.duration) },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-gray-400">{row.label}</span>
                        <span className="font-medium text-gray-800 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 space-y-3">
                    <p className="text-sm text-gray-500 text-center">
                      Tens a certeza que queres cancelar este agendamento?
                    </p>
                    {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {cancelling ? 'A cancelar...' : 'Sim, cancelar agendamento'}
                    </button>
                    <button
                      onClick={() => window.history.back()}
                      className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      Manter agendamento
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {!loading && cancelled && (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <p className="font-semibold text-gray-900">Agendamento cancelado</p>
              <p className="text-sm text-gray-500">O teu agendamento foi cancelado com sucesso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CancelarPage() {
  return (
    <Suspense>
      <CancelPage />
    </Suspense>
  );
}
