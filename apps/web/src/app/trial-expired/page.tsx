import Link from 'next/link';

export default function TrialExpiredPage(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060609] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[100px]" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-md px-6 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30">
          <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          O teu período de trial terminou
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Os teus 14 dias grátis chegaram ao fim. Subscreve um plano para continuar a gerir o teu WhatsApp e aceder a todas as funcionalidades.
        </p>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-6 text-left space-y-3">
          {[
            'Caixa de entrada unificada',
            'Kanban e gestão de clientes',
            'Assistente de IA 24/7',
            'Mensagens agendadas',
            'Relatórios e analytics',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
              <svg className="h-4 w-4 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        <a
          href="/invoices"
          className="block w-full rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25 hover:-translate-y-0.5 mb-3"
        >
          Ver planos e subscrever
        </a>
        <p className="text-xs text-gray-600">
          Dúvidas?{' '}
          <a href="mailto:suporte@wpprecebo.pt" className="text-gray-500 hover:text-gray-400 transition-colors">
            Contacta o suporte
          </a>
        </p>
      </div>
    </main>
  );
}
