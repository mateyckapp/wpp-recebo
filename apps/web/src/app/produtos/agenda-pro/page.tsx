import Link from 'next/link';
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingNavSession } from '@/components/landing/landing-nav-session';

const REGISTER_URL = '/register';

const features = [
  {
    icon: '🔗',
    title: 'Link público de marcações',
    desc: 'Cada negócio tem o seu link único. O cliente clica, escolhe o serviço, o profissional e o horário — sem te ligar.',
  },
  {
    icon: '📲',
    title: 'Lembretes automáticos no WhatsApp',
    desc: 'Confirmação imediata após marcar + lembrete 2 dias antes + lembrete 1h antes. As faltas chegam a desaparecer.',
  },
  {
    icon: '👩‍⚕️',
    title: 'Gestão de profissionais',
    desc: 'Cada profissional com os seus serviços, preços e horários independentes. Os clientes escolhem com quem querem.',
  },
  {
    icon: '🕐',
    title: 'Horários configuráveis',
    desc: 'Define folgas, intervalos, horários diferentes por dia da semana e exceções pontuais. Flexibilidade total.',
  },
  {
    icon: '📅',
    title: 'Painel de agenda visual',
    desc: 'Vista de calendário com todas as marcações. Adiciona, move ou cancela marcações com um clique.',
  },
  {
    icon: '📋',
    title: 'Histórico por cliente',
    desc: 'Vê todos os serviços anteriores de cada cliente, datas, profissionais e observações. CRM integrado na agenda.',
  },
  {
    icon: '🤖',
    title: 'IA que agenda durante conversa',
    desc: 'O cliente pergunta no WhatsApp — a IA responde, mostra disponibilidade e marca ali mesmo. Sem sair do chat.',
  },
  {
    icon: '📣',
    title: 'Campanhas em massa',
    desc: 'Envia promoções ou lembretes para toda a base de clientes via WhatsApp. Incluso no plano Pro base.',
  },
  {
    icon: '💬',
    title: 'Tudo do plano Pro',
    desc: 'Inclui a caixa de entrada da equipa, utilizadores ilimitados, relatórios avançados e suporte prioritário.',
  },
];

const sectors = [
  { icon: '💆', label: 'Centros de Estética' },
  { icon: '✂️', label: 'Cabeleireiros' },
  { icon: '💈', label: 'Barbearias' },
  { icon: '🦷', label: 'Consultórios Dentários' },
  { icon: '🏥', label: 'Clínicas de Fisioterapia' },
  { icon: '💪', label: 'Personal Trainers' },
  { icon: '🧘', label: 'Estúdios de Yoga e Pilates' },
  { icon: '⚕️', label: 'Psicólogos e Terapeutas' },
];

const conversation = [
  { from: 'cliente', text: 'Olá! Tenho horário para corte de cabelo esta semana?' },
  {
    from: 'ia',
    text: 'Olá! Temos disponibilidade esta semana:\n\n📅 Terça — 10h00, 14h00, 17h30\n📅 Quarta — 9h00, 11h00, 16h00\n📅 Sexta — 10h00, 15h00\n\nCom qual profissional prefere?',
  },
  { from: 'cliente', text: 'Com a Joana, sexta às 15h!' },
  {
    from: 'ia',
    text: '✅ Marcado! Corte de cabelo com a Joana, sexta-feira às 15h00.\n\nVais receber um lembrete 2 dias antes e 1h antes. Até sexta! 💇‍♀️',
  },
];

export default function AgendaProPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-emerald-600/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-emerald-900/[0.06] rounded-full blur-[100px]" />
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
          <div className="inline-flex items-center gap-2 border border-emerald-500/35 bg-emerald-600/10 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            📅 Agenda Pro · Para clínicas & salões · €129/mês
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h1 className="text-4xl md:text-[60px] font-bold leading-[1.06] tracking-tight mb-6">
            A agenda que trabalha por ti<br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-brand-400 bg-clip-text text-transparent">
              24 horas por dia, 7 dias por semana
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Para clínicas, salões, barbearias e consultórios. Os clientes marcam sozinhos pelo WhatsApp,
            recebem lembretes automáticos e as faltas praticamente desaparecem.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <a
              href={REGISTER_URL}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/30 hover:-translate-y-0.5"
            >
              Experimentar grátis — 14 dias
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

      {/* Conversation mock */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/15 to-brand-900/10 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Como funciona na prática</p>
            <div className="space-y-3">
              {conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'cliente' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed ${
                      msg.from === 'cliente'
                        ? 'bg-white/[0.07] text-gray-300 rounded-tl-sm'
                        : 'bg-emerald-600/25 text-emerald-100 rounded-tr-sm border border-emerald-500/20'
                    }`}
                  >
                    {msg.from === 'ia' && (
                      <span className="text-emerald-400 text-[10px] font-bold block mb-1 uppercase tracking-wider">IA · Wpp Recebo</span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-gray-500">Disponível 24h por dia, 7 dias por semana</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Pricing card */}
      <section className="max-w-sm mx-auto px-6 pb-16">
        <FadeIn>
          <div className="rounded-2xl border border-emerald-500/35 bg-gradient-to-b from-emerald-600/12 to-emerald-900/8 p-8 text-center">
            <span className="inline-block text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full mb-3">Para clínicas & salões</span>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 block">
              🎉 Oferta de lançamento
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-5xl font-bold text-white">€129</span>
              <span className="text-gray-500">/mês</span>
              <span className="text-gray-600 line-through text-xl">€229</span>
            </div>
            <p className="text-xs text-gray-600 mb-6">IVA incluído · Cancela a qualquer momento</p>
            <ul className="space-y-2.5 text-left mb-8">
              {[
                'Tudo do plano Pro',
                'Agenda online 24/7',
                'Agendamento via WhatsApp com IA',
                'Gestão de serviços e profissionais',
                'Horários configuráveis por profissional',
                'Confirmação automática de marcações',
                'Histórico de marcações por cliente',
                'Painel de agenda visual',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={REGISTER_URL}
              className="block w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all text-center shadow-lg shadow-emerald-600/25"
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
              Tudo o que o Agenda Pro inclui
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A combinação perfeita entre gestão de WhatsApp, IA e agenda automática — tudo numa só plataforma.
            </p>
          </FadeIn>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FadeInItem key={f.title}>
                <div className="h-full bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Sectors */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Feito para o teu setor</h2>
            <p className="text-gray-400">
              Qualquer negócio que trabalhe com marcações beneficia do Agenda Pro.
            </p>
          </FadeIn>
          <FadeInStagger className="flex flex-wrap justify-center gap-3">
            {sectors.map((s) => (
              <FadeInItem key={s.label}>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-600/5 px-4 py-2 text-sm text-gray-300">
                  {s.icon} {s.label}
                </span>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <FadeInStagger className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '70%', label: 'menos faltas', sub: 'com lembretes automáticos' },
              { value: '24/7', label: 'marcações online', sub: 'mesmo fora de horas' },
              { value: '5 min', label: 'para configurar', sub: 'e começar a usar' },
            ].map((s) => (
              <FadeInItem key={s.label}>
                <div className="text-4xl font-bold text-white mb-1 tabular-nums">{s.value}</div>
                <div className="text-sm font-medium text-gray-300">{s.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </div>

      {/* CTA */}
      <section className="border-t border-white/[0.06] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Chega de marcações às 22h.
            </h2>
            <p className="text-gray-400 mb-8">
              14 dias grátis, sem cartão de crédito. A agenda começa a trabalhar por ti hoje mesmo.
            </p>
            <a
              href={REGISTER_URL}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/25"
            >
              Experimentar Agenda Pro — 14 dias grátis
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
