'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] ?? '');

const API_URL = '/api/v1';

interface CheckoutData {
  status: 'pending' | 'paid' | 'expired';
  clientSecret?: string;
  amount?: number;
  currency?: string;
  description?: string;
  tenantName?: string;
  tenantLogo?: string;
}

function formatAmount(cents: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

// ─── Payment Form ─────────────────────────────────────────────────────────────

function PaymentForm({ amount, description }: { amount: number; description: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Erro ao processar pagamento');
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href + '?success=1' },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Pagamento recusado');
    } else {
      setSucceeded(true);
    }
    setLoading(false);
  }

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="h-14 w-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">Pagamento recebido!</h2>
        <p className="text-sm text-gray-400">{description} · {formatAmount(amount)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
      >
        {loading ? 'A processar…' : `Pagar ${formatAmount(amount)}`}
      </button>

      <p className="text-center text-xs text-gray-600">
        Pagamento seguro processado pela Stripe
      </p>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const success = new URLSearchParams(window.location.search).get('success');
    if (success) { setData({ status: 'paid' }); setLoading(false); return; }

    fetch(`${API_URL}/payments/checkout/${params.token}`)
      .then((r) => r.json())
      .then((d: CheckoutData) => setData(d))
      .catch(() => setData({ status: 'expired' }))
      .finally(() => setLoading(false));
  }, [params.token]);

  return (
    <div className="min-h-screen bg-[#060609] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-600/40">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          {data?.tenantName && (
            <p className="text-sm text-gray-400">{data.tenantName}</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a] p-6 shadow-2xl">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-brand-500 animate-spin" />
            </div>
          )}

          {!loading && data?.status === 'paid' && (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Pagamento concluído</h2>
              <p className="text-sm text-gray-500">Obrigado! O pagamento foi recebido com sucesso.</p>
            </div>
          )}

          {!loading && data?.status === 'expired' && (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Link expirado</h2>
              <p className="text-sm text-gray-500">Este link de pagamento já não é válido. Pede um novo link.</p>
            </div>
          )}

          {!loading && data?.status === 'pending' && data.clientSecret && (
            <>
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">A pagar</p>
                <p className="text-2xl font-bold text-white">{formatAmount(data.amount ?? 0)}</p>
                <p className="text-sm text-gray-400 mt-0.5">{data.description}</p>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: data.clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#22c55e',
                      colorBackground: '#0e0e1a',
                      colorText: '#e5e7eb',
                      colorDanger: '#f87171',
                      borderRadius: '10px',
                    },
                  },
                }}
              >
                <PaymentForm amount={data.amount ?? 0} description={data.description ?? ''} />
              </Elements>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Powered by Wpp Recebo
        </p>
      </div>
    </div>
  );
}
