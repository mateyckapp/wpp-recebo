import {
  MessageCircleIcon, MessageWarningIcon, UserXIcon, ClockIcon, RepeatIcon,
  InboxIcon, LayoutDashboardIcon, BotIcon, ZapIcon, UsersIcon,
} from '../_components/icons';

const REGISTER_URL = '/register';
const glowGreen = { boxShadow: '0 0 40px rgba(0,210,106,0.3), 0 0 80px rgba(0,210,106,0.1)' };
const cardGlass = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' };

const PROBLEMS = [
  { icon: <MessageWarningIcon />, title: 'Caos total nas mensagens', desc: 'O WhatsApp pessoal mistura clientes com família. Mensagens perdem-se, clientes ficam sem resposta.' },
  { icon: <UserXIcon />, title: 'Dependência de uma pessoa', desc: 'Quando o dono está de férias ou doente, as vendas param. Impossível delegar.' },
  { icon: <ClockIcon />, title: 'Perda de clientes por demora', desc: 'O cliente manda mensagem e espera horas. O concorrente responde em minutos e fecha a venda.' },
  { icon: <RepeatIcon />, title: 'Sempre as mesmas perguntas', desc: '"Qual o horário?" "Qual o preço?" As mesmas perguntas 20 vezes por dia, respondidas manualmente.' },
];

const FEATURES = [
  { icon: <InboxIcon />, title: 'Caixa de entrada unificada', desc: 'Todas as conversas numa única plataforma. Atribui conversas à equipa e nunca percas um cliente.' },
  { icon: <LayoutDashboardIcon />, title: 'Kanban visual', desc: 'Organiza clientes em colunas. Acompanha cada negócio do primeiro contacto ao fecho.' },
  { icon: <BotIcon />, title: 'Assistente de IA 24/7', desc: 'Responde automaticamente às perguntas básicas. Define o contexto e a IA fala pela tua marca.' },
  { icon: <ClockIcon color="#00D26A" />, title: 'Mensagens agendadas', desc: 'Programa follow-ups e campanhas. Enviadas automaticamente na hora certa.' },
  { icon: <ZapIcon />, title: 'Templates de resposta', desc: 'Responde em segundos às perguntas mais comuns com atalhos rápidos.' },
  { icon: <UsersIcon />, title: 'Multi-utilizador', desc: 'Adiciona a equipa e distribui conversas. Cada agente com o seu acesso.' },
];

const TESTIMONIALS = [
  { quote: '"Passámos de perder 30% das mensagens a responder em menos de 2 minutos. O faturamento subiu 40% no primeiro mês."', img: 'https://images.pexels.com/photos/5920775/pexels-photo-5920775.jpeg?auto=compress&cs=tinysrgb&w=400', name: 'Ricardo Mendes', role: 'Dono de restaurante · Lisboa' },
  { quote: '"A IA responde às perguntas básicas e eu foco-me nos clientes que precisam de atenção. Recuperei 3 horas por dia."', img: 'https://images.pexels.com/photos/3906984/pexels-photo-3906984.jpeg?auto=compress&cs=tinysrgb&w=400', name: 'Ana Sousa', role: 'Loja online · Porto' },
  { quote: '"Finalmente tenho controlo total. Sei quem respondeu, quando, e o que foi dito. Acabaram-se as surpresas."', img: 'https://images.pexels.com/photos/10031264/pexels-photo-10031264.jpeg?auto=compress&cs=tinysrgb&w=400', name: 'Miguel Ferreira', role: 'Agência imobiliária · Braga' },
  { quote: '"Antes perdia clientes ao fim de semana. Agora a IA responde e agenda para segunda-feira. Nunca mais perdi uma venda."', img: 'https://images.pexels.com/photos/3822949/pexels-photo-3822949.jpeg?auto=compress&cs=tinysrgb&w=400', name: 'João Oliveira', role: 'Oficina mecânica · Aveiro' },
  { quote: '"As templates de resposta rápida mudaram tudo. O que demorava 5 minutos agora leva 10 segundos. A equipa adora."', img: 'https://images.pexels.com/photos/33867554/pexels-photo-33867554.jpeg?auto=compress&cs=tinysrgb&w=400', name: 'Carla Santos', role: 'Salão de beleza · Coimbra' },
  { quote: '"Montei o Wpp-Recebo em 10 minutos e no mesmo dia já tinha a equipa toda a responder. Simples e eficaz."', img: 'https://images.pexels.com/photos/16837409/pexels-photo-16837409.jpeg?auto=compress&cs=tinysrgb&w=400', name: 'Sofia Lopes', role: 'Pastelaria · Faro' },
];

export default function SolucaoCompletaPage() {
  return (
    <div
      className="w-full min-h-screen text-white"
      style={{ background: 'linear-gradient(rgb(10, 15, 13), rgb(13, 26, 20), rgb(10, 15, 13))' }}
    >
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircleIcon size={18} color="#000" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#fff' }}>Wpp-Recebo</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#problems" className="text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: '#fff' }}>Problemas</a>
          <a href="#features" className="text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: '#fff' }}>Funcionalidades</a>
          <a href="#pricing" className="text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: '#fff' }}>Preços</a>
        </div>
        <a href="#pricing">
          <button className="px-5 py-2 rounded-full text-sm font-semibold transition hover:scale-105" style={{ background: '#00D26A', color: '#000' }}>
            Começar grátis
          </button>
        </a>
      </nav>

      {/* Hero */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-block text-xs uppercase tracking-widest mb-6 px-4 py-1 rounded-full border" style={{ color: '#00D26A', borderColor: 'rgba(0,210,106,0.3)' }}>
            ▸ API oficial WhatsApp Business · Feito em Portugal
          </p>
          <h1 className="font-black leading-tight" style={{ color: '#fff', fontWeight: 900, fontSize: 48 }}>
            Estás a perder clientes enquanto dormes
          </h1>
          <p className="mt-6 text-lg opacity-70" style={{ color: '#fff' }}>
            O teu concorrente responde em 2 minutos. Tu demoras horas. Com o Wpp-Recebo, a tua equipa e a IA respondem 24/7 — sem perderes uma venda.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#pricing">
              <button className="px-8 py-4 rounded-full font-bold text-lg transition hover:scale-105" style={{ background: '#00D26A', color: '#000', fontWeight: 700, ...glowGreen }}>
                Começar gratuitamente →
              </button>
            </a>
          </div>
          <p className="mt-4 text-sm opacity-50" style={{ color: '#fff' }}>Sem cartão de crédito. 14 dias grátis.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 text-center">ANTES</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full rounded-xl object-cover h-64" loading="lazy" src="https://images.pexels.com/photos/36713398/pexels-photo-36713398.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Empresário stressado no escritório" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2 text-center">DEPOIS</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full rounded-xl object-cover h-64" loading="lazy" src="https://images.pexels.com/photos/9615244/pexels-photo-9615244.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Homem a dormir tranquilamente" />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="w-full border-y border-white/10 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {[
            { num: '2.400+', label: 'mensagens geridas por mês' },
            { num: '98%', label: 'satisfação dos clientes' },
            { num: '3×', label: 'mais rápido que email' },
            { num: '24/7', label: 'disponibilidade com IA' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold" style={{ color: '#fff' }}>{s.num}</p>
              <p className="text-sm opacity-60 mt-1" style={{ color: '#fff' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problems */}
      <section id="problems" className="w-full max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>Reconheces algum destes problemas?</h2>
          <p className="mt-4 opacity-60 max-w-2xl mx-auto" style={{ color: '#fff' }}>
            Se tens uma equipa a usar WhatsApp pessoal para falar com clientes, estás a perder dinheiro todos os dias.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-2xl p-6 flex gap-4 items-start" style={cardGlass}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {p.icon}
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: '#fff', fontWeight: 600, fontSize: 19 }}>{p.title}</h3>
                <p className="text-sm opacity-60 mt-2" style={{ color: '#fff' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest opacity-50 mb-4" style={{ color: '#00D26A' }}>Funcionalidades</p>
          <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>Tudo o que precisas, num só lugar</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-6" style={cardGlass}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(0,210,106,0.1)' }}>
                {f.icon}
              </div>
              <h3 className="font-semibold" style={{ color: '#fff', fontWeight: 600, fontSize: 19 }}>{f.title}</h3>
              <p className="mt-2 text-sm opacity-60" style={{ color: '#fff' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-widest opacity-50 mb-4" style={{ color: '#00D26A' }}>Como funciona</p>
        <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>Começa em 4 passos</h2>
        <p className="mt-3 opacity-60" style={{ color: '#fff' }}>Sem instalações. Sem configurações complexas. Pronto em minutos.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14">
          {[
            { n: 1, title: 'Cria a tua conta', desc: 'Regista o teu negócio em menos de 2 minutos.' },
            { n: 2, title: 'Liga o WhatsApp', desc: 'Conecta o teu número via API oficial.' },
            { n: 3, title: 'Convida a equipa', desc: 'Adiciona agentes e define permissões.' },
            { n: 4, title: 'Começa a vender', desc: 'Gere conversas e clientes num só lugar.' },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-10 h-10 rounded-full text-black font-bold flex items-center justify-center mx-auto text-sm" style={{ background: '#00D26A' }}>
                {s.n}
              </div>
              <h4 className="font-semibold mt-4" style={{ color: '#fff', fontWeight: 600 }}>{s.title}</h4>
              <p className="text-sm opacity-60 mt-2" style={{ color: '#fff' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — 6 cards (2 rows of 3) */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <h2 className="font-bold text-center" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>O que dizem os nossos clientes</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl p-6" style={cardGlass}>
              <p className="italic opacity-80" style={{ color: '#fff' }}>{t.quote}</p>
              <div className="flex items-center gap-3 mt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-12 h-12 rounded-full object-cover" loading="lazy" src={t.img} alt={t.name} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#fff', fontWeight: 600 }}>{t.name}</p>
                  <p className="text-xs opacity-50" style={{ color: '#fff' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="w-full max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>Preços simples e transparentes</h2>
        <p className="mt-3 opacity-60" style={{ color: '#fff' }}>Cancela quando quiseres. Sem permanências.</p>
        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {/* Start */}
          <div className="rounded-2xl p-8 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'rgb(245,158,11)' }}>⚡ Oferta de lançamento</p>
            <h3 className="font-bold text-xl" style={{ color: '#fff' }}>Start</h3>
            <p className="text-4xl font-black mt-4" style={{ color: '#fff' }}>49€<span className="text-lg font-medium opacity-60">/mês</span></p>
            <p className="text-sm opacity-50 mt-1" style={{ color: '#fff' }}>Preço normal após lançamento: <span className="line-through">89€</span></p>
            <ul className="mt-6 space-y-3 text-sm opacity-80">
              {['1 número WhatsApp', 'Até 3 utilizadores', 'Kanban + CRM básico', 'Templates de resposta', 'Suporte por email'].map((f) => (
                <li key={f} style={{ color: '#fff' }}>✓ {f}</li>
              ))}
            </ul>
            <a href={REGISTER_URL}>
              <button className="w-full mt-8 py-3 rounded-full font-semibold transition hover:scale-105" style={{ background: 'rgba(255,255,255,0.098)', color: '#fff' }}>
                Começar grátis
              </button>
            </a>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-8 text-left relative" style={{ background: 'rgba(0,210,106,0.05)', border: '2px solid #00D26A' }}>
            <span className="text-xs font-bold mb-2 inline-block px-3 py-1 rounded-full" style={{ background: 'rgb(245,158,11)', color: '#000' }}>Mais popular</span>
            <h3 className="font-bold text-xl" style={{ color: '#fff' }}>Pro</h3>
            <p className="text-4xl font-black mt-4" style={{ color: '#fff' }}>99€<span className="text-lg font-medium opacity-60">/mês</span></p>
            <p className="text-sm opacity-50 mt-1" style={{ color: '#fff' }}>Preço normal após lançamento: <span className="line-through">179€</span></p>
            <ul className="mt-6 space-y-3 text-sm opacity-80">
              {['1 número WhatsApp', 'Utilizadores ilimitados', 'Assistente de IA 24/7', 'Mensagens agendadas', 'Relatórios avançados', 'Suporte prioritário'].map((f) => (
                <li key={f} style={{ color: '#fff' }}>✓ {f}</li>
              ))}
            </ul>
            <a href={REGISTER_URL}>
              <button className="w-full mt-8 py-3 rounded-full font-bold transition hover:scale-105" style={{ background: '#00D26A', color: '#000', ...glowGreen }}>
                Experimentar Pro
              </button>
            </a>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl p-8 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'rgb(245,158,11)' }}>⚡ Oferta de lançamento</p>
            <h3 className="font-bold text-xl" style={{ color: '#fff' }}>Enterprise</h3>
            <p className="text-4xl font-black mt-4" style={{ color: '#fff' }}>199€<span className="text-lg font-medium opacity-60">/mês</span></p>
            <p className="text-sm opacity-50 mt-1" style={{ color: '#fff' }}>Preço normal após lançamento: <span className="line-through">349€</span></p>
            <ul className="mt-6 space-y-3 text-sm opacity-80">
              {['Vários números WhatsApp', 'Utilizadores ilimitados', 'API & Webhooks', 'Integração personalizada', 'Gestor de conta dedicado'].map((f) => (
                <li key={f} style={{ color: '#fff' }}>✓ {f}</li>
              ))}
            </ul>
            <a href={REGISTER_URL}>
              <button className="w-full mt-8 py-3 rounded-full font-semibold transition hover:scale-105" style={{ background: 'rgba(255,255,255,0.098)', color: '#fff' }}>
                Falar connosco
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 40 }}>Pronto para transformar o teu WhatsApp?</h2>
        <p className="mt-4 opacity-60" style={{ color: '#fff' }}>Junta-te a centenas de negócios portugueses que já usam o Wpp-Recebo para crescer.</p>
        <a href="#pricing">
          <button className="mt-10 px-10 py-4 rounded-full font-bold text-lg transition hover:scale-105" style={{ background: '#00D26A', color: '#000', fontWeight: 700, ...glowGreen }}>
            Começar grátis — 14 dias sem compromisso →
          </button>
        </a>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircleIcon size={12} color="#000" />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#fff' }}>Wpp-Recebo</span>
          </div>
          <p className="text-xs opacity-40" style={{ color: '#fff' }}>© 2025 Wpp-Recebo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
