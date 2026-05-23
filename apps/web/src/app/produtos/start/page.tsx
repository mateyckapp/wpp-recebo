import Link from 'next/link';
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingNavSession } from '@/components/landing/landing-nav-session';

const REGISTER_URL = '/register';

const features = [
  {
    icon: '💬',
    title: 'Caixa de entrada da equipa',
    desc: 'Toda a equipa responde num único painel partilhado. Nunca mais uma mensagem sem resposta porque "não era minha".',
  },
  {
    icon: '🗂️',
    title: 'Kanban de clientes',
    desc: 'Organiza os teus clientes em colunas personalizadas — do primeiro contacto ao fecho. Pipeline de vendas visual e simples.',
  },
  {
    icon: '📋',
    title: 'Templates de resposta rápida',
    desc: 'Cria respostas prontas para as perguntas mais frequentes. Responde em segundos sem escrever a mesma coisa várias vezes.',
  },
  {
    icon: '👥',
    title: 'Até 3 utilizadores',
    desc: 'Adiciona até 3 membros da equipa. Cada um com o seu acesso, todos a responder pelo mesmo número WhatsApp.',
  },
  {
    icon: '📱',
    title: '1 número WhatsApp Business',
    desc: 'O teu número atual ligado à plataforma via API oficial do Meta. Sem mudar de número, sem perder contactos.',
  },
  {
    icon: '📧',
    title: 'Suporte por email',
    desc: 'Acesso à nossa equipa de suporte por email para ajudar na configuração e em qualquer dúvida que surja.',
  },
];

const forWhom = [
  { icon: '🛍️', label: 'Lojas locais' },
  { icon: '💇', label: 'Cabeleireiros' },
  { icon: '🍕', label: 'Restaurantes' },
  { icon: '🔧', label: 'Técnicos e reparações' },
  { icon: '💼', label: 'Freelancers' },
  { icon: '🏪', label: 'Pequenos comércios' },
];

export default function StartPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-gray-600/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-brand-600/[0.04] rounded-full blur-[100px]" />
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
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] text-gray-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            🚀 Plano Start · €49/mês
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h1 className="text-4xl md:text-[60px] font-bold leading-[1.06] tracking-tight mb-6">
            O ponto de partida para<br />
            <span className="bg-gradient-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent">
              levar o WhatsApp a sério
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Para pequenos negócios que querem organizar o atendimento no WhatsApp sem gastar uma fortuna.
            Caixa de entrada partilhada, Kanban de clientes e templates — tudo o que precisas para começar.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <a
              href={REGISTER_URL}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/30 hover:-translate-y-0.5"
            >
              Começar grátis — 14 dias
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

      {/* Pricing card */}
      <section className="max-w-sm mx-auto px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              🎉 Oferta de lançamento
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-5xl font-bold text-white">€49</span>
              <span className="text-gray-500">/mês</span>
              <span className="text-gray-600 line-through text-xl">€89</span>
            </div>
            <p className="text-xs text-gray-600 mb-6">IVA incluído · Cancela a qualquer momento</p>
            <ul className="space-y-2.5 text-left mb-8">
              {['1 número WhatsApp Business', 'Até 3 utilizadores', 'Caixa de entrada partilhada', 'Kanban de clientes', 'Templates de resposta rápida', 'Suporte por email'].map((f) => (
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
              className="block w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all text-center"
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
              Tudo o que o plano Start inclui
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Simples, direto e suficiente para o teu negócio nunca mais perder um cliente no WhatsApp.
            </p>
          </FadeIn>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FadeInItem key={f.title}>
                <div className="h-full bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.12] transition-colors">
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
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Para quem é o plano Start?
            </h2>
            <p className="text-gray-400">
              Ideal para negócios individuais ou pequenas equipas que querem estruturar o atendimento no WhatsApp pela primeira vez.
            </p>
          </FadeIn>
          <FadeInStagger className="flex flex-wrap justify-center gap-3">
            {forWhom.map((s) => (
              <FadeInItem key={s.label}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-gray-300">
                  {s.icon} {s.label}
                </span>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Upgrade nudge */}
      <section className="border-t border-white/[0.06] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="rounded-2xl border border-brand-500/20 bg-brand-600/5 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">Quando cresceres</p>
                <h3 className="text-xl font-bold text-white mb-1">Faz upgrade para o Pro</h3>
                <p className="text-sm text-gray-400">Utilizadores ilimitados, IA 24/7, campanhas e relatórios avançados.</p>
              </div>
              <Link
                href="/produtos/pro"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-all whitespace-nowrap"
              >
                Ver plano Pro →
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
              Começa hoje. Sem riscos.
            </h2>
            <p className="text-gray-400 mb-8">
              14 dias grátis, sem cartão de crédito. Se não gostar, cancelas sem penalizações.
            </p>
            <a
              href={REGISTER_URL}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/30"
            >
              Experimentar grátis — Plano Start
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Footer minimal */}
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
