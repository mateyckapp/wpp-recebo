import Link from 'next/link';
import { LandingNavSession } from '@/components/landing/landing-nav-session';

const NAV_SECTIONS = [
  {
    title: 'Início',
    items: [
      { href: '/docs', label: 'Introdução' },
      { href: '/docs/autenticacao', label: 'Autenticação' },
      { href: '/docs/rate-limits', label: 'Rate Limits' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { href: '/docs/conversas', label: 'Conversas' },
      { href: '/docs/mensagens', label: 'Mensagens' },
      { href: '/docs/contactos', label: 'Contactos' },
      { href: '/docs/analytics', label: 'Analytics' },
    ],
  },
  {
    title: 'Webhooks',
    items: [
      { href: '/docs/webhooks', label: 'Visão geral' },
      { href: '/docs/webhooks/eventos', label: 'Eventos disponíveis' },
      { href: '/docs/webhooks/verificacao', label: 'Verificação de assinatura' },
    ],
  },
  {
    title: 'IA Personalizada',
    items: [
      { href: '/docs/ia', label: 'Configuração da IA' },
      { href: '/docs/ia/contexto', label: 'Base de conhecimento' },
      { href: '/docs/ia/comportamento', label: 'Comportamento e tom' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060609] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/90 backdrop-blur-xl">
        <div className="max-w-[90rem] mx-auto px-6 h-14 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm tracking-tight">Wpp Recebo</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm text-gray-400 font-medium">Documentação</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 rounded-full font-mono">
              v1.0
            </span>
            <LandingNavSession />
          </div>
        </div>
      </header>

      <div className="max-w-[90rem] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-white/[0.06] py-6 px-4">
          <nav className="space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-2 px-2">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block rounded-md px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs font-semibold text-amber-400 mb-1">Enterprise only</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                O acesso à API e webhooks requer o plano Enterprise.
              </p>
              <Link
                href="/produtos/enterprise"
                className="mt-2 inline-block text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Ver plano Enterprise →
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-8 py-10 max-w-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}
