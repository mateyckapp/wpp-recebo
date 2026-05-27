import Link from 'next/link';
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/landing/animated-section';
import { PricingSection } from '@/components/landing/pricing-section';

const WA_LINK =
  'https://wa.me/351920276983?text=Ol%C3%A1!%20Vi%20o%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20WppRecebo';

// ── Chat mockup (static, CSS-animated) ───────────────────────────────────────

function ChatMockup() {
  const messages = [
    { from: 'user', text: 'Boa tarde! Queria marcar uma consulta para esta semana 🙂', time: '21:47', delay: '0.8s' },
    { from: 'bot',  text: null, time: '21:47', delay: '1.2s' },
    { from: 'user', text: 'Quarta às 10h, por favor!', time: '21:48', delay: '1.8s' },
    { from: 'bot',  text: null, time: '21:48', delay: '2.4s' },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d12] overflow-hidden shadow-2xl shadow-black/60">
      <div className="bg-[#25D366] px-5 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-base flex-shrink-0">🏥</div>
        <div>
          <p className="font-semibold text-[0.88rem] text-white leading-tight">Clínica Central</p>
          <p className="text-[0.68rem] text-white/80">● online agora</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <div
          className="flex items-center gap-1 px-3 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl rounded-bl-[3px] w-fit"
          style={{ animation: 'msgIn 0.4s 0.6s ease both', opacity: 0 }}
        >
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} className="w-[5px] h-[5px] rounded-full bg-brand-400"
              style={{ animation: `typing-dot 1.2s ${d}s infinite` }} />
          ))}
        </div>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed text-gray-200 ${
                msg.from === 'user'
                  ? 'bg-white/[0.07] rounded-br-[3px]'
                  : 'bg-brand-500/10 border border-brand-500/20 rounded-bl-[3px]'
              }`}
              style={{ animation: `msgIn 0.4s ${msg.delay} ease both`, opacity: 0 }}
            >
              {msg.from === 'bot' && i === 1 && (
                <>Olá! Com muito gosto 😊 Temos disponibilidade na <strong className="text-brand-400 font-medium">quarta às 10h</strong> ou <strong className="text-brand-400 font-medium">sexta às 15h</strong>. Qual prefere?</>
              )}
              {msg.from === 'bot' && i === 3 && (
                <>✅ Marcação confirmada para <strong className="text-brand-400 font-medium">quarta, 10h00</strong>. Enviei um lembrete para o seu número. Até quarta!</>
              )}
              {msg.text}
              <p className="text-[0.6rem] text-gray-600 mt-1 text-right">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'O que está incluído na taxa de configuração?',
    a: 'A taxa de configuração cobre tudo: criação do site profissional, integração com o WhatsApp Business API, configuração da IA com o tom da sua empresa, sistema de agendamento e formação inicial. Entrega em menos de 48 horas.',
  },
  {
    q: 'Tenho de mudar o meu número de WhatsApp?',
    a: 'Não. Usamos a API oficial do WhatsApp Business (Meta). Pode continuar com o mesmo número — simplesmente passamos a gerir as respostas automaticamente através dele.',
  },
  {
    q: 'Preciso de conhecimentos técnicos?',
    a: 'Não é necessário nenhum conhecimento técnico. Tratamos de toda a configuração. Depois da instalação, a gestão é feita através de um painel simples e intuitivo.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem penalizações. Pode cancelar a qualquer momento com 30 dias de aviso prévio. Os seus dados ficam disponíveis para exportação durante 30 dias após o cancelamento.',
  },
  {
    q: 'A IA responde de forma personalizada para o meu negócio?',
    a: 'Sim. Configuramos a IA com o tom de voz, serviços, horários e perguntas frequentes da sua empresa. Os clientes não percebem que estão a falar com um assistente automático.',
  },
  {
    q: 'O site profissional está incluído em todos os planos?',
    a: 'Sim, todos os planos incluem um site profissional otimizado para Google e telemóvel, com página de marcação integrada. No plano Premium, inclui site multi-página completo.',
  },
  {
    q: 'Funciona para vários profissionais ou unidades?',
    a: 'Sim. No plano Premium pode ter múltiplos atendentes com horários independentes e até integrar com o sistema de gestão que já utiliza.',
  },
  {
    q: 'Qual a diferença entre pagar por IBAN e por cartão?',
    a: 'O pagamento por IBAN (transferência bancária) tem um desconto de 15% sobre o valor mensal — uma poupança significativa a longo prazo. O cartão de crédito/débito está disponível para quem prefere pagamento automático.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white overflow-x-hidden">

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-brand-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-brand-900/[0.06] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-900/[0.05] rounded-full blur-[80px]" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">WppRecebo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#solucao"  className="hover:text-white transition-colors">Como funciona</a>
            <a href="#precos"   className="hover:text-white transition-colors">Planos</a>
            <a href="#nichos"   className="hover:text-white transition-colors">Para quem é</a>
            <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/30"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar connosco
          </a>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <FadeIn delay={0.05}>
              <div className="inline-flex items-center gap-2 border border-brand-500/25 bg-brand-600/10 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Powered by Inteligência Artificial
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <h1 className="text-4xl md:text-[3.4rem] font-bold leading-[1.08] tracking-tight mb-6">
                O seu negócio
                <br />atende{' '}
                <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
                  24 horas
                </span>
                <br />por dia.
              </h1>
            </FadeIn>

            <FadeIn delay={0.22}>
              <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
                Automatize o atendimento no WhatsApp, aceite marcações online e nunca mais perca um cliente
                por falta de resposta — com IA que conversa como um humano.
              </p>
            </FadeIn>

            <FadeIn delay={0.32}>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/35 hover:-translate-y-0.5"
                >
                  Ver demonstração gratuita
                  <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="#precos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/[0.04] hover:border-white/20 transition-all"
                >
                  Ver planos →
                </a>
              </div>
              <p className="text-xs text-gray-600">
                30 dias grátis · Sem cartão de crédito · Instalado em menos de 48h
              </p>
            </FadeIn>

            <FadeIn delay={0.42}>
              <div className="flex flex-wrap gap-8 mt-10">
                {[
                  { num: '24/7', label: 'Atendimento automático' },
                  { num: '3 min', label: 'Tempo médio de resposta' },
                  { num: '0€', label: 'Custo nos primeiros 30 dias' },
                ].map((s) => (
                  <div key={s.num}>
                    <p className="text-2xl font-bold text-brand-400">{s.num}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} className="hidden lg:block">
            <ChatMockup />
          </FadeIn>
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">O problema</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Quantos clientes perdeu{' '}
              <span className="text-brand-400">esta semana</span> sem saber?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Todos os dias, negócios perdem clientes por telefone sem resposta, mensagens acumuladas e agenda desorganizada.
            </p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                emoji: '😤',
                title: 'Telefone sem resposta',
                desc: 'O cliente liga fora do horário e não consegue marcar. Vai ao Google e liga ao concorrente.',
              },
              {
                emoji: '📱',
                title: 'WhatsApp acumulado',
                desc: 'Dezenas de mensagens por responder. Clientes frustrados, marcações perdidas, caos diário.',
              },
              {
                emoji: '📅',
                title: 'Agenda desorganizada',
                desc: 'Marcações por telefone, WhatsApp e papel. Falhas, esquecimentos e duplos agendamentos.',
              },
            ].map((c) => (
              <FadeInItem key={c.title}>
                <div className="flex gap-4 bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 transition-colors">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{c.emoji}</span>
                  <div>
                    <p className="font-semibold text-white mb-1.5">{c.title}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── SOLUÇÃO ──────────────────────────────────────────────────────── */}
      <section id="solucao" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-white/10 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              A solução
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Tudo automatizado.{' '}
              <span className="text-brand-400">Zero trabalho</span> extra para si.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Instalamos e configuramos tudo. O seu negócio passa a atender 24 horas por dia sem precisar de si.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Features */}
            <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: '🤖',
                  title: 'IA que conversa como um humano',
                  benefit: 'Disponível 24/7',
                  desc: 'O assistente responde com linguagem natural, personalizada para o seu negócio, a qualquer hora.',
                },
                {
                  icon: '📆',
                  title: 'Agendamento automático',
                  benefit: 'Sem intervenção humana',
                  desc: 'O cliente escolhe o horário, confirma e recebe lembrete — tudo sem precisar de si.',
                },
                {
                  icon: '🌐',
                  title: 'Site profissional incluído',
                  benefit: 'Otimizado para Google',
                  desc: 'Presença online com página de marcação integrada, otimizada para pesquisa e telemóvel.',
                },
                {
                  icon: '📊',
                  title: 'Relatórios mensais',
                  benefit: 'Decisões com dados',
                  desc: 'Saiba quantos clientes contactaram, marcaram e qual o horário mais procurado.',
                },
              ].map((f) => (
                <FadeInItem key={f.title}>
                  <div className="group h-full bg-white/[0.03] rounded-2xl p-5 border border-white/[0.07] hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-brand-600/15 text-xl flex items-center justify-center mb-4 group-hover:bg-brand-600/25 transition-colors">
                      {f.icon}
                    </div>
                    <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-1">{f.benefit}</p>
                    <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>

            {/* Flow */}
            <FadeIn delay={0.1}>
              <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-5">Como funciona</p>
                <div className="space-y-1">
                  {[
                    { n: 1, text: <>Cliente envia mensagem no <strong className="text-brand-400 font-medium">WhatsApp</strong> — a qualquer hora</> },
                    { n: 2, text: <><strong className="text-brand-400 font-medium">IA responde</strong> em segundos e apresenta horários disponíveis <span className="inline-block mt-1 bg-brand-600/15 border border-brand-500/20 rounded px-1.5 py-0.5 text-[10px] text-brand-400 font-medium">Powered by Anthropic</span></> },
                    { n: 3, text: <>Cliente <strong className="text-brand-400 font-medium">confirma a marcação</strong> — sem ligações, sem espera</> },
                    { n: 4, text: <><strong className="text-brand-400 font-medium">Lembrete automático</strong> enviado 24h antes da marcação</> },
                    { n: 5, text: <>Você vê <strong className="text-brand-400 font-medium">tudo no painel</strong> — agenda, histórico, relatórios</> },
                  ].map((step, i, arr) => (
                    <div key={step.n}>
                      <div className="flex items-start gap-3.5 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                        <div className="w-7 h-7 flex-shrink-0 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-semibold text-brand-400">
                          {step.n}
                        </div>
                        <p className="text-sm text-gray-300 leading-snug pt-0.5">{step.text}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <p className="text-center text-brand-500/30 text-lg leading-none my-0.5">↓</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── NICHOS ───────────────────────────────────────────────────────── */}
      <section id="nichos" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Para quem é</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Perfeito para negócios<br />que vivem de{' '}
              <span className="text-brand-400">marcações</span>
            </h2>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🏥', title: 'Clínicas & Consultórios', desc: 'Médicos, dentistas, psicólogos, fisioterapeutas. Reduza faltas e preencha a agenda automaticamente.' },
              { icon: '✂️', title: 'Salões & Barbearias',    desc: 'Chega de gerir marcações pelo WhatsApp manual. Os clientes marcam sozinhos, 24h por dia.' },
              { icon: '⚖️', title: 'Advogados & Contabilistas', desc: 'Triagem inicial pela IA, agendamento de consultas e imagem profissional online.' },
              { icon: '🔧', title: 'Oficinas & Serviços',    desc: 'Orçamentos pelo WhatsApp, agendamento de peritagem e confirmação automática de serviços.' },
            ].map((n) => (
              <FadeInItem key={n.title}>
                <div className="h-full bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5 text-center hover:border-brand-500/25 hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-200">
                  <p className="text-3xl mb-3">{n.icon}</p>
                  <h3 className="font-semibold text-white text-sm mb-2">{n.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.desc}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── PRICING (client component) ───────────────────────────────────── */}
      <PricingSection />

      {/* ── TESTEMUNHO ───────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Resultados reais
            </h2>
            <p className="text-gray-400">De clientes reais, em Portugal</p>
          </FadeIn>

          <FadeIn>
            <div className="bg-white/[0.025] border border-brand-500/20 rounded-2xl p-8 md:p-10 relative">
              <p className="text-5xl font-bold text-brand-400 opacity-30 leading-none mb-4 select-none">"</p>
              <p className="text-lg text-gray-200 leading-[1.75] italic mb-8">
                Antes perdia marcações todos os fins de semana porque não estava disponível para atender o telefone.
                Agora o sistema trata de tudo — os clientes marcam, recebem confirmação, e eu chego segunda-feira
                com a agenda cheia. Valeu cada euro.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-600/30 text-brand-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  AC
                </div>
                <div>
                  <p className="font-semibold text-gray-200 text-sm">Ana Carvalho</p>
                  <p className="text-xs text-gray-500">Fisioterapeuta · Viseu</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Perguntas frequentes</h2>
            <p className="text-gray-400">Tudo o que precisa de saber antes de começar</p>
          </FadeIn>

          <FadeInStagger className="space-y-3">
            {faqs.map((faq) => (
              <FadeInItem key={faq.q}>
                <details className="group bg-white/[0.03] border border-white/[0.07] rounded-xl hover:border-white/[0.12] transition-colors">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
                    <span className="font-medium text-white text-sm">{faq.q}</span>
                    <svg
                      className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
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

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="relative">
              <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-48 bg-brand-600/10 rounded-full blur-3xl" />
              </div>

              <div className="inline-flex items-center gap-2 border border-brand-500/25 bg-brand-600/10 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
                ⚡ 30 dias grátis — sem cartão de crédito
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
                Pronto para não perder{' '}
                <span className="text-brand-400">mais nenhum cliente?</span>
              </h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Instalado em menos de 48 horas. Sem conhecimentos técnicos. Sem compromisso.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-xl bg-brand-600 text-white font-bold text-base hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/35 hover:-translate-y-0.5"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar pelo WhatsApp
                </a>
                <a
                  href="mailto:contacto@wpprecebo.pt"
                  className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-xl border border-white/10 text-gray-300 font-medium text-base hover:bg-white/[0.04] hover:border-white/20 transition-all"
                >
                  ✉ Enviar email
                </a>
              </div>

              <p className="text-xs text-gray-600 mt-6">
                Respondemos em menos de <span className="text-brand-500">2 horas</span> nos dias úteis.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
              <span className="font-semibold text-white">WppRecebo</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <a href="#solucao" className="hover:text-gray-300 transition-colors">Como funciona</a>
              <a href="#precos"  className="hover:text-gray-300 transition-colors">Planos</a>
              <a href="#nichos"  className="hover:text-gray-300 transition-colors">Para quem é</a>
              <a href="#faq"     className="hover:text-gray-300 transition-colors">FAQ</a>
            </nav>
            <div className="flex gap-5 text-sm text-gray-500">
              <Link href="/terms"   className="hover:text-gray-300 transition-colors">Termos</Link>
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacidade</Link>
              <Link href="/refund"  className="hover:text-gray-300 transition-colors">Reembolsos</Link>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 WppRecebo — Tondela, Portugal 🇵🇹</p>
            <p className="text-xs text-gray-600">Desenvolvido com ❤ e IA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
