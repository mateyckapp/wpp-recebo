function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00D26A" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const REGISTER_URL = '/register';

export default function MaquinaDeVendasPage() {
  return (
    <div
      className="w-full min-h-screen text-white"
      style={{ background: 'linear-gradient(rgb(10, 15, 13), rgb(13, 26, 20), rgb(10, 15, 13))' }}
    >
      {/* Hero */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-6 inline-block" style={{ color: '#00D26A', fontWeight: 400, fontSize: 16 }}>
              API Oficial WhatsApp Business · Feito em Portugal
            </p>
            <h1 className="font-black leading-[1.1]" style={{ color: '#fff', fontWeight: 900, fontSize: 48 }}>
              Transforma o teu WhatsApp numa máquina de vendas
            </h1>
            <p className="mt-6 text-lg opacity-75 leading-relaxed" style={{ color: '#fff', fontSize: 16 }}>
              Responde mais rápido, vende mais e nunca percas uma mensagem. A plataforma que negócios portugueses usam para escalar pelo WhatsApp.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#oferta">
                <button
                  className="px-8 py-4 rounded-full font-bold text-lg transition hover:scale-105"
                  style={{
                    background: '#00D26A',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: '0 0 50px rgba(0,210,106,0.25), 0 0 100px rgba(0,210,106,0.08)',
                  }}
                >
                  Quero experimentar grátis →
                </button>
              </a>
            </div>
            <p className="mt-4 text-sm opacity-40" style={{ color: '#fff', fontSize: 16 }}>
              14 dias grátis · Sem cartão de crédito
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full rounded-2xl object-cover h-80 shadow-2xl"
            loading="lazy"
            src="https://images.pexels.com/photos/7793999/pexels-photo-7793999.jpeg?auto=compress&cs=tinysrgb&w=1280"
            alt="Equipa de profissionais a celebrar resultados"
          />
        </div>
      </section>

      {/* Problem */}
      <section className="w-full max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-bold text-center" style={{ color: '#fff', fontWeight: 700, fontSize: 34 }}>
          Quantos clientes perdeste esta semana sem saber?
        </h2>
        <div className="mt-12 space-y-6">
          {[
            'Mensagens no WhatsApp ficam horas sem resposta — o cliente vai à concorrência.',
            'Cada colaborador usa o próprio telemóvel. Zero controlo, zero histórico.',
            'Não sabes o que foi dito, quem respondeu, nem quanto estás a perder.',
          ].map((text) => (
            <p
              key={text}
              className="opacity-90"
              style={{
                color: 'rgb(248, 113, 113)',
                fontSize: 16,
                borderLeft: '4px solid #00D26A',
                paddingLeft: '1.25rem',
              }}
            >
              {text}
            </p>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full rounded-2xl object-cover h-64 mt-14 shadow-lg"
          loading="lazy"
          src="https://images.pexels.com/photos/7971713/pexels-photo-7971713.jpeg?auto=compress&cs=tinysrgb&w=1280"
          alt="Empresária frustrada ao telefone"
        />
      </section>

      {/* Solution */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 34 }}>
          O Wpp-Recebo resolve isto em minutos
        </h2>
        <p className="mt-4 opacity-60 max-w-2xl mx-auto" style={{ color: '#fff', fontSize: 16 }}>
          Uma plataforma onde toda a equipa gere o WhatsApp do negócio — com IA, automações e controlo total.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full max-w-3xl mx-auto rounded-2xl object-cover h-72 mt-12 shadow-xl"
          loading="lazy"
          src="https://images.pexels.com/photos/6893327/pexels-photo-6893327.jpeg?auto=compress&cs=tinysrgb&w=1280"
          alt="Espaço de trabalho moderno com laptop"
        />
      </section>

      {/* Benefits */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-bold text-center mb-14" style={{ color: '#fff', fontWeight: 700, fontSize: 34 }}>
          O que ganhas com o Wpp-Recebo
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <InboxIcon />,
              title: 'Caixa de entrada unificada',
              desc: 'Todas as conversas num só lugar. Atribui, responde e acompanha sem perder nada.',
            },
            {
              icon: <BotIcon />,
              title: 'IA que responde 24/7',
              desc: 'Assistente inteligente que fala pela tua marca mesmo fora de horário.',
            },
            {
              icon: <ZapIcon />,
              title: 'Resultados em dias, não meses',
              desc: 'Configuração em minutos. Sem instalações, sem código, sem stress.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(0,210,106,0.1)' }}>
                {card.icon}
              </div>
              <h3 className="font-semibold" style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
                {card.title}
              </h3>
              <p className="mt-3 text-sm opacity-60" style={{ color: '#fff', fontSize: 16 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof — stats */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '2.400+', label: 'mensagens geridas por mês' },
            { num: '98%', label: 'satisfação dos clientes' },
            { num: '3×', label: 'mais rápido que email' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-black" style={{ color: '#00D26A', fontWeight: 900 }}>
                {stat.num}
              </p>
              <p className="text-sm opacity-50 mt-2" style={{ color: '#fff', fontSize: 16 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="w-full max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
        </div>
        <p className="text-xl italic opacity-80 leading-relaxed" style={{ color: '#fff', fontSize: 18 }}>
          "Passámos de perder 30% das mensagens a responder em menos de 2 minutos. O nosso faturamento subiu 40% no primeiro mês."
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-14 h-14 rounded-full object-cover"
            loading="lazy"
            src="https://images.pexels.com/photos/5920775/pexels-photo-5920775.jpeg?auto=compress&cs=tinysrgb&w=400"
            alt="Ricardo Mendes"
          />
          <div className="text-left">
            <p className="font-semibold" style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
              Ricardo Mendes
            </p>
            <p className="text-sm opacity-50" style={{ color: '#fff', fontSize: 14 }}>
              Dono de restaurante · Lisboa
            </p>
          </div>
        </div>
      </section>

      {/* Offer / Pricing */}
      <section id="oferta" className="w-full max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>
          Oferta especial de lançamento
        </h2>
        <p className="mt-3 opacity-60" style={{ color: '#fff', fontSize: 16 }}>
          Cancela quando quiseres. Sem permanências.
        </p>

        <div
          className="rounded-3xl p-10 mt-12 text-left max-w-md mx-auto"
          style={{
            background: 'rgba(0,210,106,0.05)',
            border: '2px solid #00D26A',
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wide mb-4 inline-block px-3 py-1 rounded-full"
            style={{ background: 'rgb(245,158,11)', color: '#000', fontWeight: 700, fontSize: 12 }}
          >
            Mais popular
          </span>
          <p className="font-black" style={{ color: '#fff', fontWeight: 900, fontSize: 48 }}>
            99€<span className="text-xl font-medium opacity-60">/mês</span>
          </p>
          <p className="text-sm opacity-50 mt-1" style={{ color: '#fff', fontSize: 14 }}>
            Preço normal após lançamento: <span className="line-through">179€</span>
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              '1 número WhatsApp',
              'Utilizadores ilimitados',
              'Assistente de IA 24/7',
              'Mensagens agendadas',
              'Relatórios avançados',
            ].map((f) => (
              <li key={f} className="opacity-80 flex items-center gap-2" style={{ color: '#fff', fontSize: 16 }}>
                <span style={{ color: '#00D26A', fontWeight: 700 }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <a href={REGISTER_URL}>
            <button
              className="w-full mt-10 py-4 rounded-full font-bold text-lg transition hover:scale-105"
              style={{
                background: '#00D26A',
                color: '#000',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 0 50px rgba(0,210,106,0.25), 0 0 100px rgba(0,210,106,0.08)',
              }}
            >
              Experimentar Pro — 14 dias grátis
            </button>
          </a>
        </div>
        <p className="mt-6 text-sm opacity-40" style={{ color: '#fff', fontSize: 14 }}>
          Sem cartão de crédito. Cancela a qualquer momento.
        </p>
      </section>

      {/* Final CTA */}
      <section className="w-full max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-bold" style={{ color: '#fff', fontWeight: 700, fontSize: 36 }}>
          Pronto para transformar o teu WhatsApp?
        </h2>
        <p className="mt-4 opacity-60" style={{ color: '#fff', fontSize: 16 }}>
          Junta-te a centenas de negócios portugueses que já usam o Wpp-Recebo para crescer.
        </p>
        <a href="#oferta">
          <button
            className="mt-10 px-10 py-4 rounded-full font-bold text-lg transition hover:scale-105"
            style={{
              background: '#00D26A',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 0 50px rgba(0,210,106,0.25), 0 0 100px rgba(0,210,106,0.08)',
            }}
          >
            Começar grátis →
          </button>
        </a>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-semibold" style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
            Wpp-Recebo
          </span>
          <p className="text-xs opacity-40" style={{ color: '#fff', fontSize: 12 }}>
            © 2025 Wpp-Recebo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
