import Link from 'next/link';
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingNavSession } from '@/components/landing/landing-nav-session';

const REGISTER_URL = '/register';

const features = [
  {
    icon: '🤖',
    title: 'Assistente de IA 24/7',
    desc: 'A IA responde com o teu tom, resolve as dúvidas mais comuns e faz marcações — mesmo quando estás fora de horas ou ocupado.',
  },
  {
    icon: '👥',
    title: 'Utilizadores ilimitados',
    desc: 'Toda a equipa acede ao mesmo painel. Sem limites de agentes, sem custo extra por utilizador.',
  },
  {
    icon: '📣',
    title: 'Campanhas em massa',
    desc: 'Envia mensagens para toda a tua lista de contactos de uma vez. Promoções, avisos, novidades — com taxa de abertura muito acima do email.',
  },
  {
    icon: '⏰',
    title: 'Mensagens agendadas',
    desc: 'Programa mensagens para enviar no momento certo. Aniversários, follow-ups, confirmações — acontecem sozinhos.',
  },
  {
    icon: '📊',
    title: 'Relatórios avançados',
    desc: 'Tempo médio de resposta, volume de conversas, desempenho por agente. Dados para tomares melhores decisões.',
  },
  {
    icon: '💬',
    title: 'Caixa de entrada da equipa',
    desc: 'Inbox unificada, atribuição de conversas, notas internas e histórico completo de cada cliente.',
  },
  {
    icon: '🗂️',
    title: 'Kanban e CRM completo',
    desc: 'Pipeline visual de vendas, tags de segmentação e perfil completo de cada contacto.',
  },
  {
    icon: '📋',
    title: 'Templates de resposta rápida',
    desc: 'Biblioteca de respostas prontas para a equipa usar e responder em segundos.',
  },
  {
    icon: '🎯',
    title: 'Suporte prioritário',
    desc: 'Acesso prioritário à nossa equipa de suporte. Problemas resolvidos mais rápido.',
  },
];

const stats = [
  { value: '3×', label: 'mais rápido a responder', sub: 'com IA e inbox unificada' },
  { value: '∞', label: 'utilizadores incluídos', sub: 'sem custo extra por agente' },
  { value: '40%', label: 'mais faturação', sub: 'reportado por clientes Pro' },
];

const forWhom = [
  { icon: '🏪', label: 'Equipas de atendimento' },
  { icon: '📈', label: 'Negócios em crescimento' },
  { icon: '💼', label: 'Agências e consultoras' },
  { icon: '🛒', label: 'E-commerce e lojas' },
  { icon: '🏋️', label: 'Ginásios e centros desportivos' },
  { icon: '🏠', label: 'Imobiliárias' },
];

export default function ProPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-brand-600/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-brand-900/[0.06] rounded-full blur-[100px]" />
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
          <div className="inline-flex items-center gap-2 border border-brand-500/30 bg-brand-600/10 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            ⚡ Plano Pro · Mais popular · €99/mês
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h1 className="text-4xl md:text-[60px] font-bold leading-[1.06] tracking-tight mb-6">
            Escala o teu atendimento<br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
              com IA e sem limites de equipa
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Para equipas em crescimento que precisam de mais do que uma caixa de entrada.
            IA que responde 24/7, utilizadores ilimitados, campanhas e relatórios — tudo incluído.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <a
              href={REGISTER_URL}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/35 hover:-translate-y-0.5"
            >
              Experimentar Pro — 14 dias grátis
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
          <p className="text-xs text-gray-600">Sem cartão de crédito · Cancela quando quiseres</p>
        </FadeIn>
      </section>

      {/* Stats */}
      <div className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <FadeInStagger className="grid grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <FadeInItem key={s.label}>
                <div className="text-4xl font-bold text-white mb-1 tabular-nums">{s.value}</div>
                <div className="text-sm font-medium text-gray-300">{s.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </div>

      {/* Pricing card */}
      <section className="max-w-sm mx-auto px-6 py-16">
        <FadeIn>
          <div className="rounded-2xl border border-brand-500/40 bg-gradient-to-b from-brand-600/15 to-brand-900/10 p-8 text-center shadow-2xl shadow-brand-600/10">
            <span className="inline-block text-xs font-semibold bg-brand-600/30 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full mb-4">Mais popular</span>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 block">
              🎉 Oferta de lançamento
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-5xl font-bold text-white">€99</span>
              <span className="text-gray-500">/mês</span>
              <span className="text-gray-600 line-through text-xl">€179</span>
            </div>
            <p className="text-xs text-gray-600 mb-6">IVA incluído · Cancela a qualquer momento</p>
            <ul className="space-y-2.5 text-left mb-8">
              {['1 número WhatsApp Business', 'Utilizadores ilimitados', 'Assistente de IA 24/7', 'Campanhas em massa', 'Mensagens agendadas', 'Relatórios avançados', 'Suporte prioritário'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <svg className="h-4 w-4 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={REGISTER_URL}
              className="block w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all text-center shadow-lg shadow-brand-600/30"
            >
              Começar grátis agora
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Tudo o que o plano Pro inclui
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Sem limites de utilizadores, com IA integrada e ferramentas para crescer de forma organizada.
            </p>
          </FadeIn>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FadeInItem key={f.title}>
                <div className="h-full bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-300">
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
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Para quem é o plano Pro?</h2>
            <p className="text-gray-400">Para negócios com equipa que precisam de IA, campanhas e dados para crescer.</p>
          </FadeIn>
          <FadeInStagger className="flex flex-wrap justify-center gap-3">
            {forWhom.map((s) => (
              <FadeInItem key={s.label}>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-600/5 px-4 py-2 text-sm text-gray-300">
                  {s.icon} {s.label}
                </span>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Agenda Pro nudge */}
      <section className="border-t border-white/[0.06] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-600/5 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Para clínicas, salões e consultórios</p>
                <h3 className="text-xl font-bold text-white mb-1">Tens marcações? Experimenta o Agenda Pro</h3>
                <p className="text-sm text-gray-400">Pro + agenda online + lembretes automáticos + gestão de profissionais.</p>
              </div>
              <Link
                href="/produtos/agenda-pro"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all whitespace-nowrap"
              >
                Ver Agenda Pro →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Experimenta o Pro sem risco.
            </h2>
            <p className="text-gray-400 mb-8">14 dias grátis, sem cartão de crédito. Se não gostar, cancelas sem penalizações.</p>
            <a
              href={REGISTER_URL}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/30"
            >
              Experimentar Pro — 14 dias grátis
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
