import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingNavSession } from '@/components/landing/landing-nav-session';

const REGISTER_URL = '/register';

const painPoints = [
  {
    emoji: '😤',
    title: 'São 22h e tens 14 mensagens por responder',
    desc: 'Trabalhas o dia todo e ainda tens de gerir o WhatsApp à noite. Os clientes esperam, tu esgotaste.',
  },
  {
    emoji: '📭',
    title: 'Perdeste clientes e nem sabes quantos',
    desc: 'Alguém enviou mensagem, não respondeste a tempo, foi à concorrência. Acontece todos os dias.',
  },
  {
    emoji: '📅',
    title: 'Marcações por mensagem = agenda em caos',
    desc: 'Tens de ir ao histórico para confirmar horas, clientes faltam sem avisar e ficas com tempo vazio.',
  },
  {
    emoji: '😴',
    title: 'O teu negócio para quando paras tu',
    desc: 'De férias, doente ou ocupado — sem ti não há resposta. Nenhum negócio consegue crescer assim.',
  },
];

const features = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Caixa de entrada unificada',
    benefit: 'Nunca mais mensagens perdidas',
    desc: 'Toda a equipa responde num único painel. Atribui conversas, adiciona notas e vê o histórico completo de cada cliente.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    ),
    title: 'Agenda online 24/7',
    benefit: 'Clientes marcam sozinhos, sem te ligar',
    desc: 'Cada cliente tem um link público para marcar. Escolhe o serviço, o profissional e o horário — sem necessitar de ti.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Lembretes automáticos',
    benefit: 'Faltas reduzidas em até 70%',
    desc: 'Confirmação imediata, lembrete 2 dias antes e 1h antes — todos pelo WhatsApp. Os clientes aparecem porque foram avisados.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: 'Assistente de IA 24/7',
    benefit: 'Responde fora de horas por ti',
    desc: 'A IA fala com o teu tom, responde às perguntas mais comuns e agenda — mesmo quando estás a dormir.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Kanban de clientes',
    benefit: 'Pipeline de vendas visual',
    desc: 'Vê cada cliente numa coluna da tua escolha. Do primeiro contacto ao fecho — nada se perde, nada esquece.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Relatórios e analytics',
    benefit: 'Decisões com base em dados',
    desc: 'Tempo de resposta, conversas abertas, mensagens enviadas — tudo medido para saberes o que está a funcionar.',
  },
];

const sectors = [
  { icon: '✂️', label: 'Cabeleireiros' },
  { icon: '💆', label: 'Centros de Estética' },
  { icon: '🦷', label: 'Consultórios' },
  { icon: '💈', label: 'Barbearias' },
  { icon: '💪', label: 'Personal Trainers' },
  { icon: '🏥', label: 'Clínicas' },
  { icon: '⚖️', label: 'Advogados' },
  { icon: '📐', label: 'Consultores' },
];

const testimonials = [
  {
    quote: 'Reduzi as faltas em 70% no primeiro mês. Os clientes recebem o lembrete no WhatsApp e aparecem sempre. Já não tenho horas vazias.',
    name: 'Ana Costa',
    role: 'Cabeleireira',
    location: 'Porto',
    highlight: '70% menos faltas',
    initial: 'A',
  },
  {
    quote: 'Aumentei a faturação em 40% em 3 meses porque deixei de perder contactos no WhatsApp. A IA responde enquanto estou a trabalhar.',
    name: 'João Pereira',
    role: 'Centro de Estética',
    location: 'Lisboa',
    highlight: '+40% faturação',
    initial: 'J',
  },
  {
    quote: 'Os clientes marcam sozinhos pelo link. Já não recebo chamadas às 22h a pedir marcações. Recuperei as minhas noites.',
    name: 'Maria Santos',
    role: 'Consultório de Fisioterapia',
    location: 'Braga',
    highlight: 'Recuperou as noites',
    initial: 'M',
  },
];

const plans = [
  {
    name: 'Start',
    price: '49',
    originalPrice: '89',
    desc: 'Para começar com o pé direito',
    features: [
      '1 número WhatsApp',
      'Até 3 utilizadores',
      'Caixa de entrada unificada',
      'Kanban de clientes',
      'Templates de resposta rápida',
      'Suporte por email',
    ],
    cta: 'Começar grátis',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: '99',
    originalPrice: '179',
    desc: 'Para equipas que querem crescer',
    features: [
      '1 número WhatsApp',
      'Utilizadores ilimitados',
      'Assistente de IA 24/7',
      'Campanhas em massa',
      'Mensagens agendadas',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    cta: 'Experimentar Pro',
    highlighted: true,
    badge: 'Mais popular',
  },
  {
    name: 'Enterprise',
    price: '199',
    originalPrice: '349',
    desc: 'Para grandes operações',
    features: [
      'Vários números WhatsApp',
      'Utilizadores ilimitados',
      'IA personalizada',
      'API & Webhooks',
      'Integração à medida',
      'Gestor de conta dedicado',
    ],
    cta: 'Falar connosco',
    highlighted: false,
    badge: null,
  },
];

const faqs = [
  {
    q: 'Preciso de sair do meu número de WhatsApp atual?',
    a: 'Não. Continuas com o mesmo número. Conectamos o teu número de WhatsApp Business à plataforma via API oficial do Meta — sem perder contactos nem histórico.',
  },
  {
    q: 'Quanto tempo demora a configurar?',
    a: 'A maioria dos clientes fica operacional em menos de 30 minutos. Tens um guia passo a passo e a nossa equipa de suporte disponível para ajudar.',
  },
  {
    q: 'Preciso de conhecimentos técnicos?',
    a: 'Não. Foi desenhado para donos de negócios, não para informáticos. Se sabes usar o WhatsApp, sabes usar o Wpp Recebo.',
  },
  {
    q: 'E se não gostar? Posso cancelar?',
    a: 'Sim, cancelas quando quiseres, sem penalizações. Tens 14 dias de trial gratuito para experimentar sem comprometeres nada.',
  },
  {
    q: 'A IA pode parecer robótica com os meus clientes?',
    a: 'A IA usa o contexto que tu defines sobre o teu negócio, serviços e tom de voz. Podes deixá-la soar exatamente como tu — natural e humana.',
  },
  {
    q: 'Funciona para mais do que um utilizador / agente?',
    a: 'Sim. No plano Pro tens utilizadores ilimitados. Podes ter toda a equipa a responder a partir do mesmo número, cada um com o seu acesso.',
  },
  {
    q: 'Os dados dos meus clientes estão seguros?',
    a: 'Sim. Servidores na Europa, encriptação em trânsito e em repouso, e conformidade com o RGPD. Os dados são teus e só teus.',
  },
  {
    q: 'A agenda online funciona para vários profissionais?',
    a: 'Sim. Podes criar horários independentes para cada profissional ou sala. Os clientes escolhem com quem querem e a que hora.',
  },
];

const comparisonRows = [
  { feature: 'Caixa de entrada da equipa', us: true, wa: false, agenda: false },
  { feature: 'Agenda online para clientes', us: true, wa: false, agenda: true },
  { feature: 'Lembretes automáticos WhatsApp', us: true, wa: false, agenda: '±' },
  { feature: 'IA que responde 24/7', us: true, wa: false, agenda: false },
  { feature: 'Kanban e gestão de clientes', us: true, wa: false, agenda: false },
  { feature: 'Campanhas em massa', us: true, wa: false, agenda: false },
  { feature: 'Multi-agente no mesmo número', us: true, wa: false, agenda: false },
  { feature: 'Configuração em menos de 30 min', us: true, wa: true, agenda: false },
];

function CheckIcon({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <svg className="h-5 w-5 text-brand-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }
  if (value === '±') {
    return <span className="text-amber-400 text-sm font-medium">±</span>;
  }
  return (
    <svg className="h-5 w-5 text-gray-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-brand-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-amber-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-900/[0.08] rounded-full blur-[80px]" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">Wpp Recebo</span>
          </div>
          <LandingNav />
          <LandingNavSession />
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
        <FadeIn delay={0.05}>
          <div className="inline-flex items-center gap-2 border border-brand-500/25 bg-brand-600/10 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Mais de 200 negócios portugueses já usam
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="text-5xl md:text-[68px] font-bold leading-[1.04] tracking-tight mb-6">
            Chega de perder clientes
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
              por falta de resposta
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            O Wpp Recebo junta a caixa de entrada da tua equipa, a agenda online e a IA numa só plataforma —
            para que o teu negócio funcione mesmo quando não estás disponível.
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <a
              href={REGISTER_URL}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/35 hover:shadow-brand-500/45 hover:-translate-y-0.5"
            >
              Experimentar 14 dias grátis
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#funcionalidades"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/[0.04] hover:border-white/20 transition-all"
            >
              <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Ver como funciona
            </a>
          </div>
          <p className="text-xs text-gray-600">
            Sem cartão de crédito&nbsp;·&nbsp;Cancela quando quiseres&nbsp;·&nbsp;Configura em 5 minutos
          </p>
        </FadeIn>

        {/* Sector pills */}
        <FadeIn delay={0.45}>
          <div className="flex flex-wrap justify-center gap-2 mt-14">
            {sectors.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3.5 py-1.5 text-xs text-gray-400"
              >
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── PAIN SECTION ────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Reconheces esta situação?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              O problema não és tu.<br />É a falta da ferramenta certa.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Todos os dias, milhares de negócios perdem clientes por causa de mensagens sem resposta, faltas e desorganização.
            </p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {painPoints.map((p) => (
              <FadeInItem key={p.title}>
                <div className="flex gap-4 bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 transition-colors">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{p.emoji}</span>
                  <div>
                    <p className="font-semibold text-white mb-1.5">{p.title}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>

          <FadeIn>
            <div className="relative text-center bg-gradient-to-r from-brand-600/10 via-brand-600/5 to-transparent border border-brand-500/20 rounded-2xl px-8 py-10">
              <p className="text-2xl md:text-3xl font-bold text-white leading-snug">
                "Cada mensagem sem resposta<br />
                <span className="text-brand-400">é um cliente que foi embora."</span>
              </p>
              <p className="text-sm text-gray-500 mt-4">E o pior? A maioria nunca diz nada — simplesmente não volta.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="funcionalidades" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-white/10 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              A solução
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Tudo o que precisas. Numa só plataforma.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Desenvolvido especificamente para negócios portugueses que usam WhatsApp como canal principal.
            </p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FadeInItem key={f.title}>
                <div className="group h-full bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-brand-600/15 text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/25 transition-colors">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider mb-1">{f.benefit}</p>
                      <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── AGENDA HIGHLIGHT ────────────────────────────────────── */}
      <section id="agenda" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-5">
              Novo · Agenda Online Integrada
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Os teus clientes marcam sozinhos.<br />
              <span className="text-emerald-400">Tu só apareces à hora certa.</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Chega de mensagens às 22h a pedir marcações. Com a agenda online, cada cliente escolhe o serviço,
              o profissional e o horário — 24h por dia, sem ti.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            {/* Left: benefits */}
            <FadeIn>
              <div className="space-y-5">
                {[
                  {
                    icon: '🔗',
                    title: 'Link público da tua agenda',
                    desc: 'Partilhas o teu link no WhatsApp, Instagram ou onde quiseres. O cliente clica e marca.',
                  },
                  {
                    icon: '📲',
                    title: 'Lembretes automáticos no WhatsApp',
                    desc: 'Confirmação imediata + lembrete 2 dias antes + lembrete 1h antes. As faltas desaparecem.',
                  },
                  {
                    icon: '📅',
                    title: 'Agenda por profissional ou sala',
                    desc: 'Vários profissionais, horários independentes. Os clientes escolhem com quem querem.',
                  },
                  {
                    icon: '🤖',
                    title: 'IA que agenda durante a conversa',
                    desc: 'O cliente pergunta no WhatsApp "tenho horário para amanhã?" — a IA responde e marca ali mesmo.',
                  },
                ].map((b) => (
                  <div key={b.title} className="flex gap-4 items-start">
                    <span className="text-xl flex-shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-white mb-1">{b.title}</p>
                      <p className="text-sm text-gray-400">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right: mock conversation */}
            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/15 to-brand-900/10 p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Conversa real no WhatsApp</p>
                <div className="space-y-3">
                  {[
                    { from: 'cliente', text: 'Bom dia! Queria marcar uma consulta de fisioterapia para esta semana.' },
                    {
                      from: 'ia',
                      text: 'Olá! Temos disponibilidade esta semana:\n\n📅 Terça — 10h00, 14h00, 16h30\n📅 Quarta — 9h00, 11h00, 15h00\n📅 Quinta — 10h00, 17h00\n\nQual prefere?',
                    },
                    { from: 'cliente', text: 'Terça às 14h, por favor!' },
                    {
                      from: 'ia',
                      text: '✅ Marcado! Consulta de fisioterapia na terça-feira às 14h00 com Dra. Ana Silva.\n\nVais receber um lembrete 2 dias antes e 1h antes. Até lá! 😊',
                    },
                  ].map((msg, i) => (
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
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-gray-500">Disponível 24h por dia, 7 dias por semana</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Agenda Pro plan highlight */}
          <FadeIn className="mt-16">
            <div className="max-w-3xl mx-auto rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/15 to-brand-900/10 p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">Agenda Pro</span>
                    <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">🎉 Oferta de lançamento</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Pro + Agenda Online Completa</h3>
                  <p className="text-gray-400 text-sm max-w-sm">WhatsApp, agenda, lembretes automáticos e IA — tudo incluído.</p>
                </div>
                <div className="flex-shrink-0 text-center md:text-right">
                  <div className="flex items-baseline gap-2 md:justify-end">
                    <span className="text-5xl font-bold text-white tabular-nums">129€</span>
                    <span className="text-gray-500 text-sm">/mês</span>
                    <span className="text-gray-600 line-through text-xl">229€</span>
                  </div>
                  <p className="text-xs text-amber-400/80 mt-1 mb-4">Preço normal após lançamento</p>
                  <a
                    href={REGISTER_URL}
                    className="inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5"
                  >
                    Experimentar grátis — 14 dias
                  </a>
                  <p className="text-xs text-gray-600 mt-2">Sem cartão. Cancela quando quiseres.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <FadeInStagger className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '200+', label: 'negócios ativos', sub: 'em Portugal' },
              { value: '70%', label: 'menos faltas', sub: 'com lembretes WhatsApp' },
              { value: '3×', label: 'mais rápido', sub: 'a responder a clientes' },
              { value: '24/7', label: 'disponível', sub: 'com IA integrada' },
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

      {/* ── COMPARISON TABLE ─────────────────────────────────────── */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Porque é diferente do resto
            </h2>
            <p className="text-gray-400">Uma comparação honesta</p>
          </FadeIn>

          <FadeIn>
            <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 bg-white/[0.04] border-b border-white/[0.07]">
                <div className="p-4" />
                <div className="p-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-brand-400 font-bold text-sm">
                    <div className="h-4 w-4 rounded bg-brand-600 flex items-center justify-center">
                      <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                      </svg>
                    </div>
                    Wpp Recebo
                  </span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-gray-400 text-sm">WhatsApp Business</span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-gray-400 text-sm">Outras agendas</span>
                </div>
              </div>

              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 border-b border-white/[0.05] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                >
                  <div className="p-4 text-sm text-gray-300">{row.feature}</div>
                  <div className="p-4 flex items-center justify-center"><CheckIcon value={row.us} /></div>
                  <div className="p-4 flex items-center justify-center"><CheckIcon value={row.wa} /></div>
                  <div className="p-4 flex items-center justify-center"><CheckIcon value={row.agenda} /></div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Negócios que já transformaram o seu WhatsApp
            </h2>
            <p className="text-gray-400">Resultados reais, de clientes reais, em Portugal</p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <FadeInItem key={t.name}>
                <div className="h-full flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-colors">
                  <div className="inline-flex items-center gap-1.5 bg-brand-600/15 text-brand-400 text-xs font-bold px-3 py-1.5 rounded-full self-start mb-4 border border-brand-500/20">
                    {t.highlight}
                  </div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                    <div className="w-9 h-9 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role} · {t.location}</p>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="precos" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-4">
            <div className="inline-flex items-center gap-2 border border-white/10 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Preços
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Menos do que perdes por dia<br />em clientes sem resposta
            </h2>
            <p className="text-gray-400">14 dias grátis · Sem cartão · Cancela quando quiseres</p>
          </FadeIn>

          <FadeIn className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full">
              🎉 Preços de lançamento — válidos enquanto houver vagas
            </div>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mb-8">
            {plans.map((p) => (
              <FadeInItem key={p.name}>
                <div
                  className={`h-full rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                    p.highlighted
                      ? 'bg-gradient-to-b from-brand-600/20 to-brand-900/15 border border-brand-500/50 shadow-2xl shadow-brand-600/10 ring-1 ring-brand-500/15'
                      : 'bg-white/[0.03] border border-white/[0.07] hover:border-white/15'
                  }`}
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.badge && (
                      <span className="text-xs font-semibold bg-brand-600/30 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full">
                      🎉 Oferta
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-400 mb-5">{p.desc}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white tabular-nums">{p.price}€</span>
                      <span className="text-gray-500 text-sm">/mês</span>
                      <span className="text-gray-600 line-through text-lg tabular-nums">{p.originalPrice}€</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-gray-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={REGISTER_URL}
                    className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      p.highlighted
                        ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/30 hover:-translate-y-0.5'
                        : 'bg-white/[0.06] text-gray-200 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {p.cta}
                  </a>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>

          {/* Agenda Pro callout */}
          <FadeIn>
            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-900/15 to-transparent p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 rounded-full">Agenda Pro</span>
                  <span className="text-xs text-gray-500">Plano Pro + Agenda integrada</span>
                </div>
                <h4 className="font-bold text-white text-lg mb-1">Para negócios com marcações</h4>
                <p className="text-sm text-gray-400">Clínicas, salões, consultórios, barbearias — a solução completa com agenda, lembretes e IA.</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-6">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-white">129€</span>
                    <span className="text-gray-500 text-sm">/mês</span>
                    <span className="text-gray-600 line-through">229€</span>
                  </div>
                </div>
                <a
                  href={REGISTER_URL}
                  className="flex-shrink-0 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all whitespace-nowrap"
                >
                  Experimentar grátis
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Perguntas frequentes</h2>
            <p className="text-gray-400">Tudo o que precisas de saber antes de começar</p>
          </FadeIn>

          <FadeInStagger className="space-y-3">
            {faqs.map((faq) => (
              <FadeInItem key={faq.q}>
                <details className="group bg-white/[0.03] border border-white/[0.07] rounded-xl hover:border-white/[0.12] transition-colors">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
                    <span className="font-medium text-white text-sm">{faq.q}</span>
                    <svg
                      className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/[0.05] pt-4">
                    {faq.a}
                  </div>
                </details>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="relative">
              <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-48 bg-brand-600/12 rounded-full blur-3xl" />
              </div>

              <div className="inline-flex items-center gap-2 border border-amber-500/25 bg-amber-500/10 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
                ⚡ O teu concorrente já está a responder mais rápido que tu
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
                Cada dia que passa<br />
                <span className="text-brand-400">é um cliente que pode ir embora.</span>
              </h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Junta-te a mais de 200 negócios portugueses que já pararam de perder clientes por falta de resposta.
                O trial é gratuito, sem cartão, sem compromisso.
              </p>

              <a
                href={REGISTER_URL}
                className="group inline-flex items-center gap-2.5 px-10 py-5 rounded-xl bg-brand-600 text-white font-bold text-base hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/35 hover:shadow-brand-500/45 hover:-translate-y-0.5"
              >
                Começar o meu trial gratuito agora
                <svg className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  14 dias grátis
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Cancela quando quiseres
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Wpp Recebo</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <a href="#funcionalidades" className="hover:text-gray-300 transition-colors">Funcionalidades</a>
              <a href="#agenda" className="hover:text-gray-300 transition-colors">Agenda</a>
              <a href="#precos" className="hover:text-gray-300 transition-colors">Preços</a>
              <a href="#faq" className="hover:text-gray-300 transition-colors">FAQ</a>
            </nav>
            <div className="flex gap-5 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Termos</a>
              <a href="mailto:suporte@wpprecebo.pt" className="hover:text-gray-300 transition-colors">Suporte</a>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 Wpp Recebo. Todos os direitos reservados. Feito em Portugal 🇵🇹</p>
            <p className="text-xs text-gray-600">Conforme com o RGPD · Dados protegidos · Servidores na Europa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
