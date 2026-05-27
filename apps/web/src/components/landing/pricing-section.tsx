'use client';
import { useState } from 'react';
import { RevealWrapper } from './reveal-wrapper';

const PRICES = {
  iban:   { base: '€149', pro: '€299', premium: '€524' },
  card:   { base: '€199', pro: '€399', premium: '€699' },
};

const SAVINGS = { base: '€50', pro: '€100', premium: '€175' };

const WA_BASE = 'https://wa.me/351920276983?text=';
const WA_LINKS = {
  base:    WA_BASE + encodeURIComponent('Olá! Tenho interesse no plano Base do WppRecebo.'),
  pro:     WA_BASE + encodeURIComponent('Olá! Tenho interesse no plano Pro do WppRecebo.'),
  premium: WA_BASE + encodeURIComponent('Olá! Tenho interesse no plano Premium do WppRecebo.'),
};

const PLANS = [
  {
    id: 'base' as const,
    name: 'Base',
    desc: 'Para começar com o pé direito',
    setup: '+ €400 de configuração inicial',
    badge: null,
    highlighted: false,
    features: [
      'Site profissional',
      'Agendamento online',
      'WhatsApp com respostas automáticas',
      'Confirmações e lembretes',
      'Suporte por email',
    ],
    ctaLabel: 'Começar agora',
    ctaFilled: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    desc: 'A solução completa com IA',
    setup: '+ €600 de configuração inicial',
    badge: '⭐ Mais popular',
    highlighted: true,
    features: [
      'Tudo do plano Base',
      'IA humanizada (Anthropic)',
      'Integração Google Calendar',
      'Relatório mensal de atendimento',
      'Personalização de respostas',
      'Suporte prioritário',
    ],
    ctaLabel: 'Quero o plano Pro',
    ctaFilled: true,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    desc: 'Para negócios em crescimento',
    setup: '+ €900 de configuração inicial',
    badge: null,
    highlighted: false,
    features: [
      'Tudo do plano Pro',
      'Site completo multi-página',
      'Múltiplos atendentes/unidades',
      'Integração com sistema próprio',
      'Dashboard personalizado',
      'Suporte telefónico dedicado',
    ],
    ctaLabel: 'Falar connosco',
    ctaFilled: false,
  },
];

export function PricingSection() {
  const [isCard, setIsCard] = useState(false);
  const mode = isCard ? 'card' : 'iban';

  return (
    <section className="py-28 px-6 md:px-16 border-t border-white/[0.06]" id="precos">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-4">Planos</p>
        <h2 className="text-3xl md:text-[2.4rem] font-bold leading-[1.1] tracking-tight mb-2">
          Simples, transparente,{' '}
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
            sem surpresas
          </span>
        </h2>

        {/* Payment toggle */}
        <div className="flex items-center justify-center gap-4 mt-10 mb-12">
          <span
            className={`text-sm cursor-pointer transition-colors ${!isCard ? 'text-white font-medium' : 'text-gray-500 font-normal'}`}
            onClick={() => setIsCard(false)}
          >
            💳 Pagar por IBAN{' '}
            <span className="inline-block bg-brand-600/15 border border-brand-600/30 text-brand-400 px-3 py-0.5 rounded-full text-[0.72rem] font-semibold align-middle">
              Poupe 25%
            </span>
          </span>

          <button
            role="switch"
            aria-checked={isCard}
            onClick={() => setIsCard((v) => !v)}
            className="relative w-[52px] h-[28px] rounded-full border border-white/[0.12] transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            style={{ background: isCard ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.04)' }}
          >
            <span
              className="absolute top-[3px] w-5 h-5 rounded-full bg-brand-400 shadow-[0_2px_6px_rgba(74,222,128,0.4)] transition-transform"
              style={{ left: 3, transform: isCard ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>

          <span
            className={`text-sm cursor-pointer transition-colors ${isCard ? 'text-white font-medium' : 'text-gray-500 font-normal'}`}
            onClick={() => setIsCard(true)}
          >
            Pagar com cartão
          </span>
        </div>

        <RevealWrapper className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 flex flex-col transition-transform duration-200 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'border border-brand-500/60 bg-gradient-to-br from-brand-600/[0.08] to-[#0d0d12]'
                  : 'border border-white/[0.07] bg-[#0d0d12]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-[#060609] px-4 py-1 rounded-full text-[0.72rem] font-bold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <p className="font-bold text-[1.1rem] mb-1">{plan.name}</p>
              <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>

              {/* Price */}
              <div
                className="text-sm text-gray-500 line-through min-h-[1.2rem] mb-1"
                style={{ visibility: isCard ? 'hidden' : 'visible' }}
              >
                {PRICES.card[plan.id]}/mês
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-bold text-[2.5rem] text-brand-400 leading-none">
                  {PRICES[mode][plan.id]}
                </span>
                <span className="text-sm font-normal text-gray-500">/mês</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 mb-5">
                {isCard ? (
                  <>Pagamento por <span className="text-brand-400 font-medium">cartão de crédito/débito</span></>
                ) : (
                  <><span className="text-brand-400 font-medium">✓ Desconto IBAN aplicado</span> — poupa {SAVINGS[plan.id]}/mês</>
                )}
              </p>
              <p className="text-xs text-gray-500 mb-6">{plan.setup}</p>

              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm leading-relaxed">
                    <span className="text-brand-400 font-bold flex-shrink-0 mt-[0.05rem]">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href={WA_LINKS[plan.id]}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center py-3 rounded-xl font-medium text-sm no-underline transition-all ${
                  plan.ctaFilled
                    ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/30 hover:shadow-brand-500/30'
                    : 'border border-brand-500/40 text-brand-400 hover:bg-brand-500/[0.08]'
                }`}
              >
                {plan.ctaLabel}
              </a>
            </div>
          ))}
        </RevealWrapper>

        <p className="text-center mt-8 text-sm text-gray-500">
          Todos os planos incluem{' '}
          <strong className="text-brand-400">30 dias grátis</strong> sem compromisso. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}
