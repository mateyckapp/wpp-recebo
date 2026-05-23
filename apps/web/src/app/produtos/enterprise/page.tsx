import Link from 'next/link';
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingNavSession } from '@/components/landing/landing-nav-session';

const features = [
  {
    icon: '📱',
    title: 'Vários números WhatsApp',
    desc: 'Conecta múltiplos números WhatsApp Business à mesma plataforma. Ideal para franchises, filiais e marcas diferentes.',
  },
  {
    icon: '👥',
    title: 'Utilizadores ilimitados',
    desc: 'Toda a organização na plataforma. Sem custo extra por utilizador, sem limite de agentes ou equipas.',
  },
  {
    icon: '🧠',
    title: 'IA personalizada',
    desc: 'Treina a IA com o conhecimento específico da tua empresa: produtos, processos, tom de voz e regras de negócio.',
  },
  {
    icon: '🔗',
    title: 'API & Webhooks',
    desc: 'Integra o Wpp Recebo com o teu CRM, ERP ou qualquer sistema interno via API REST e webhooks em tempo real.',
  },
  {
    icon: '⚙️',
    title: 'Integração personalizada',
    desc: 'A nossa equipa trabalha contigo para integrar a plataforma nos teus fluxos e sistemas existentes.',
  },
  {
    icon: '👔',
    title: 'Gestor de conta dedicado',
    desc: 'Tens um ponto de contacto exclusivo na nossa equipa para onboarding, suporte e evolução contínua.',
  },
  {
    icon: '📣',
    title: 'Campanhas em massa',
    desc: 'Envia campanhas segmentadas para toda a base de contactos, com análise de resultados detalhada.',
  },
  {
    icon: '📊',
    title: 'Relatórios e analytics avançados',
    desc: 'Dashboards completos por equipa, por número e por período. Exportação de dados e relatórios personalizados.',
  },
  {
    icon: '🔒',
    title: 'Segurança e conformidade RGPD',
    desc: 'Servidores na Europa, encriptação ponta-a-ponta, conformidade total com o RGPD e gestão de dados avançada.',
  },
];

const forWhom = [
  { icon: '🏢', label: 'Grandes empresas' },
  { icon: '🔗', label: 'Franchises e redes' },
  { icon: '🏥', label: 'Grupos de clínicas' },
  { icon: '🏨', label: 'Hotelaria e turismo' },
  { icon: '🚗', label: 'Concessionários' },
  { icon: '🏗️', label: 'Imobiliárias de grande escala' },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-violet-600/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-brand-600/[0.04] rounded-full blur-[100px]" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">Wpp Recebo</span>
          </Link>
          <LandingNav />
          <LandingNavSession />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <FadeIn delay={0.05}>
          <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-600/10 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            🏢 Plano Enterprise · €199/mês
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h1 className="text-4xl md:text-[60px] font-bold leading-[1.06] tracking-tight mb-6">
            A solução completa para<br />
            <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-brand-400 bg-clip-text text-transparent">
              operações de grande escala
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Para empresas com múltiplas equipas, vários números WhatsApp e necessidade de integração com sistemas internos.
            API, webhooks, IA personalizada e um gestor de conta dedicado.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <a
              href="mailto:enterprise@wpprecebo.com"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-all shadow-2xl shadow-violet-600/30 hover:-translate-y-0.5"
            >
              Falar com a nossa equipa
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <Link
              href="/#precos"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/[0.04] transition-all"
            >
              Ver todos os planos
            </Link>
          </div>
          <p className="text-xs text-gray-600">Demo personalizada · Proposta à medida · SLA garantido</p>
        </FadeIn>
      </section>

      {/* Pricing card */}
      <section className="max-w-sm mx-auto px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-600/10 to-violet-900/5 p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              🎉 Oferta de lançamento
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-5xl font-bold text-white">€199</span>
              <span className="text-gray-500">/mês</span>
              <span className="text-gray-600 line-through text-xl">€349</span>
            </div>
            <p className="text-xs text-gray-600 mb-6">IVA incluído · Proposta personalizada disponível</p>
            <ul className="space-y-2.5 text-left mb-8">
              {[
                'Vários números WhatsApp',
                'Utilizadores ilimitados',
                'IA personalizada',
                'API & Webhooks',
                'Integração personalizada',
                'Gestor de conta dedicado',
                'Relatórios avançados',
                'Suporte prioritário 24/7',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <svg className="h-4 w-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:enterprise@wpprecebo.com"
              className="block w-full py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-all text-center"
            >
              Falar connosco
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Tudo o que o Enterprise inclui
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Infraestrutura robusta, integração à medida e suporte dedicado para operações exigentes.
            </p>
          </FadeIn>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FadeInItem key={f.title}>
                <div className="h-full bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] hover:border-violet-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* For whom */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Para quem é o Enterprise?</h2>
            <p className="text-gray-400">Para organizações com operações complexas, múltiplas equipas e necessidade de integração.</p>
          </FadeIn>
          <FadeInStagger className="flex flex-wrap justify-center gap-3">
            {forWhom.map((s) => (
              <FadeInItem key={s.label}>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-600/5 px-4 py-2 text-sm text-gray-300">
                  {s.icon} {s.label}
                </span>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Vamos construir juntos a solução certa.
            </h2>
            <p className="text-gray-400 mb-8">
              A nossa equipa faz uma demonstração personalizada e apresenta uma proposta adaptada à tua operação.
            </p>
            <a
              href="mailto:enterprise@wpprecebo.com"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-all shadow-2xl shadow-violet-600/25"
            >
              Agendar demonstração
            </a>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2026 Wpp Recebo. Feito em Portugal 🇵🇹</p>
          <nav className="flex gap-6 text-xs text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition-colors">Início</Link>
            <Link href="/#precos" className="hover:text-gray-400 transition-colors">Preços</Link>
            <Link href="/register" className="hover:text-gray-400 transition-colors">Registar</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
