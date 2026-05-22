import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';

const APP_DOMAIN = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';

function getRegisterUrl() {
  return '/register';
}

function getLoginUrl() {
  return '/login';
}

const features = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Caixa de entrada unificada',
    desc: 'Todas as conversas do WhatsApp numa única plataforma. Atribui conversas à tua equipa e nunca percas um cliente.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Kanban visual',
    desc: 'Organiza os teus clientes em colunas personalizadas. Acompanha cada negócio desde o primeiro contacto até ao fecho.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: 'Assistente de IA',
    desc: 'Responde automaticamente 24/7 com Claude Haiku. Define o contexto do teu negócio e a IA fala pela tua marca.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Mensagens agendadas',
    desc: 'Programa follow-ups e campanhas com antecedência. As mensagens são enviadas automaticamente na hora certa.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.275 2.903 2.875 2.903h.375a.75.75 0 010 1.5h-.375A4.404 4.404 0 012.25 12.76v-.01A4.404 4.404 0 016.625 8.35h.375a.75.75 0 010 1.5h-.375A2.904 2.904 0 003.75 12.75v.01z" />
      </svg>
    ),
    title: 'Templates de resposta',
    desc: 'Cria respostas rápidas com atalhos. Responde em segundos às perguntas mais comuns sem repetir o mesmo texto.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Multi-utilizador',
    desc: 'Adiciona a tua equipa e distribui conversas. Cada agente tem o seu acesso, sem partilha de credenciais.',
  },
];

const plans = [
  {
    name: 'Start',
    price: '49',
    originalPrice: '89',
    desc: 'Para negócios que estão a começar',
    features: ['1 número WhatsApp', 'Até 3 utilizadores', 'Kanban + CRM básico', 'Templates de resposta', 'Suporte por email'],
    cta: 'Começar grátis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '99',
    originalPrice: '179',
    desc: 'Para equipas em crescimento',
    features: ['1 número WhatsApp', 'Utilizadores ilimitados', 'Assistente de IA 24/7', 'Mensagens agendadas', 'Relatórios avançados', 'Suporte prioritário'],
    cta: 'Experimentar Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '199',
    originalPrice: '349',
    desc: 'Para grandes operações',
    features: ['Vários números WhatsApp', 'Utilizadores ilimitados', 'IA personalizada', 'API & Webhooks', 'Integração personalizada', 'Gestor de conta dedicado'],
    cta: 'Falar connosco',
    highlighted: false,
  },
];

const steps = [
  { n: '1', title: 'Cria a tua conta', desc: 'Regista o teu negócio em menos de 2 minutos.' },
  { n: '2', title: 'Liga o WhatsApp', desc: 'Conecta o teu número via API oficial do WhatsApp.' },
  { n: '3', title: 'Convida a equipa', desc: 'Adiciona os teus agentes e define permissões.' },
  { n: '4', title: 'Começa a vender', desc: 'Gere conversas, agendas e clientes num só lugar.' },
];

const stats = [
  { value: '2.400+', label: 'mensagens geridas por mês' },
  { value: '98%', label: 'satisfação dos clientes' },
  { value: '3×', label: 'mais rápido que email' },
  { value: '24/7', label: 'disponibilidade com IA' },
];

export default function LandingPage() {
  const loginUrl = getLoginUrl();
  const registerUrl = getRegisterUrl();

  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-brand-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-emerald-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-brand-900/[0.12] rounded-full blur-[80px]" />
      </div>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/40">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">Wpp-Recebo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#precos" className="hover:text-white transition-colors">Preços</a>
          </nav>
          <a
            href={loginUrl}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-500/35"
          >
            Entrar
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-28 pb-32 text-center">
        <FadeIn delay={0.05}>
          <div className="inline-flex items-center gap-2 border border-brand-500/25 bg-brand-600/10 text-brand-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            API oficial WhatsApp Business · Feito em Portugal
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Gere o teu WhatsApp
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-emerald-400 bg-clip-text text-transparent">
              como um profissional
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma completa para pequenas e médias empresas portuguesas gerirem clientes, vendas e suporte — tudo pelo WhatsApp.
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={registerUrl}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/30 hover:shadow-brand-500/40 hover:-translate-y-0.5"
            >
              Começar gratuitamente
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/[0.04] hover:border-white/20 transition-all"
            >
              Ver como funciona
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-4">Sem cartão de crédito · 14 dias grátis</p>
        </FadeIn>
      </section>

      {/* Stats */}
      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <FadeInStagger className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <FadeInItem key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white mb-1 tabular-nums">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </div>

      {/* Features */}
      <section id="funcionalidades" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-white/10 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Funcionalidades
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Tudo o que precisas, num só lugar
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Desenvolvido especificamente para negócios portugueses que usam WhatsApp como canal principal de vendas e suporte.
            </p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FadeInItem key={f.title}>
                <div className="group h-full bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] hover:border-brand-500/40 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-5 group-hover:bg-brand-600/30 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-white/10 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Como funciona
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Começa em 4 passos</h2>
            <p className="text-gray-400">Sem instalações. Sem configurações complexas. Pronto em minutos.</p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <FadeInItem key={s.n} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[58%] right-0 h-px bg-gradient-to-r from-brand-600/40 via-brand-600/20 to-transparent" />
                )}
                <div className="relative z-10 h-11 w-11 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
                  {s.n}
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              O que dizem os nossos clientes
            </h2>
            <p className="text-gray-400">Negócios portugueses que transformaram o seu WhatsApp</p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: 'Passámos de perder 30% das mensagens a responder em menos de 2 minutos. O nosso faturamento subiu 40% no primeiro mês.',
                name: 'Ricardo Mendes',
                role: 'Dono de restaurante',
                location: 'Lisboa',
                initial: 'R',
              },
              {
                quote: 'A IA responde às perguntas básicas e eu foco-me nos clientes que realmente precisam de atenção. Recuperei 3 horas por dia.',
                name: 'Ana Sousa',
                role: 'Loja online',
                location: 'Porto',
                initial: 'A',
              },
              {
                quote: 'Finalmente tenho controlo total. Sei quem respondeu, quando, e o que foi dito. Acabaram-se as surpresas desagradáveis.',
                name: 'Miguel Ferreira',
                role: 'Agência imobiliária',
                location: 'Braga',
                initial: 'M',
              },
            ].map((t) => (
              <FadeInItem key={t.name}>
                <div className="h-full flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-colors">
                  {/* Estrelas */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">
                    "{t.quote}"
                  </p>

                  {/* Author */}
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

      {/* Pricing */}
      <section id="precos" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-white/10 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Preços
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Preços simples e transparentes
            </h2>
            <p className="text-gray-400">Cancela quando quiseres. Sem permanências.</p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {plans.map((p) => (
              <FadeInItem key={p.name}>
                <div
                  className={`h-full rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                    p.highlighted
                      ? 'bg-gradient-to-b from-brand-600/25 to-brand-900/20 border border-brand-500/50 shadow-2xl shadow-brand-600/10 ring-1 ring-brand-500/20'
                      : 'bg-white/[0.03] border border-white/[0.07] hover:border-white/15 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {p.highlighted && (
                      <span className="text-xs font-semibold bg-brand-600/30 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full">
                        Mais popular
                      </span>
                    )}
                    <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                      🎉 Oferta de lançamento
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{p.desc}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white tabular-nums">{p.price}€</span>
                      <span className="text-sm text-gray-500 ml-1">/mês</span>
                      <span className="text-lg text-gray-600 line-through tabular-nums">{p.originalPrice}€</span>
                    </div>
                    <p className="text-xs text-amber-400/80 mt-1">Preço normal após lançamento</p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <svg
                          className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-gray-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={registerUrl}
                    className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      p.highlighted
                        ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/30 hover:-translate-y-0.5'
                        : 'bg-white/[0.07] text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {p.cta}
                  </a>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Agenda vertical */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Plano específico para o setor
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Para Clínicas, Salões e Consultórios
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Um plano completo com sistema de agendamento integrado. Os clientes marcam pelo WhatsApp, a IA confirma e a tua agenda fica organizada automaticamente.
            </p>
          </FadeIn>

          {/* Sectors */}
          <FadeIn className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: '🏥', label: 'Clínicas' },
              { icon: '💆', label: 'Centros de Estética' },
              { icon: '✂️', label: 'Salões de Beleza' },
              { icon: '💈', label: 'Barbearias' },
              { icon: '🦷', label: 'Consultórios' },
              { icon: '💪', label: 'Personal Trainers' },
            ].map((s) => (
              <span key={s.label} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-gray-300">
                {s.icon} {s.label}
              </span>
            ))}
          </FadeIn>

          <FadeIn>
            <div className="max-w-3xl mx-auto rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-brand-900/10 p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                {/* Left — price + CTA */}
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Pro + Agenda
                    </span>
                    <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                      🎉 Oferta de lançamento
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Agenda Pro</h3>
                  <p className="text-sm text-gray-400 mb-5">Tudo do plano Pro + sistema de agendamento completo</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold text-white tabular-nums">129€</span>
                    <span className="text-sm text-gray-500">/mês</span>
                    <span className="text-xl text-gray-600 line-through tabular-nums">229€</span>
                  </div>
                  <p className="text-xs text-amber-400/80 mb-6">Preço normal após lançamento</p>
                  <a
                    href={registerUrl}
                    className="w-full text-center block py-3.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5"
                  >
                    Experimentar grátis — 14 dias
                  </a>
                  <p className="text-xs text-gray-600 mt-3 text-center">Sem cartão de crédito. Cancela quando quiseres.</p>
                </div>

                {/* Right — features split */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Inclui tudo do Pro +</p>
                    <ul className="space-y-2.5">
                      {[
                        'Agendamento via WhatsApp com IA',
                        'Clientes marcam durante a conversa',
                        'Horários disponíveis em tempo real',
                        'Marcação automática sem intervenção',
                        'Agenda por profissional / sala',
                        'Confirmação automática ao cliente',
                        'Gestão de serviços e preços',
                        'Vista de agenda por dia',
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Example conversation */}
              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Como funciona na prática</p>
                <div className="space-y-2">
                  {[
                    { from: 'cliente', text: 'Bom dia! Queria marcar uma consulta de fisioterapia.' },
                    { from: 'ia', text: 'Olá! Temos disponibilidade esta semana. Para quando prefere?\n📅 Terça — 10h, 14h, 16h\n📅 Quarta — 9h, 11h, 15h\n📅 Quinta — 10h, 17h' },
                    { from: 'cliente', text: 'Terça às 14h.' },
                    { from: 'ia', text: '✅ Marcado! Consulta de fisioterapia na terça-feira às 14h com Dra. Ana. Até lá! 😊' },
                  ].map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'cliente' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs whitespace-pre-line ${
                        msg.from === 'cliente'
                          ? 'bg-white/[0.06] text-gray-300 rounded-tl-sm'
                          : 'bg-emerald-600/30 text-emerald-200 rounded-tr-sm border border-emerald-500/20'
                      }`}>
                        {msg.from === 'ia' && <span className="text-emerald-400 text-[10px] font-semibold block mb-0.5">IA Wpp-Recebo</span>}
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="relative">
              <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-40 bg-brand-600/15 rounded-full blur-3xl" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Pronto para transformar<br />o teu WhatsApp?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Junta-te a centenas de negócios portugueses que já usam o Wpp-Recebo para crescer.
              </p>
              <a
                href={registerUrl}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/30 hover:shadow-brand-500/40 hover:-translate-y-0.5"
              >
                Começar grátis — 14 dias sem compromisso
                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-brand-600 flex items-center justify-center text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-300">Wpp-Recebo</span>
          </div>
          <p className="text-xs text-gray-600">© 2026 Wpp-Recebo. Todos os direitos reservados.</p>
          <div className="flex gap-5 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Termos</a>
            <a href="mailto:suporte@wpprecebo.pt" className="hover:text-gray-400 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
