'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const WIZARD_KEY = 'welcome_wizard_v1';

interface WizardStep {
  title: string;
  subtitle: string;
  icon: string;
  content: React.ReactNode;
  cta?: { label: string; href: string };
}

function StepWhatsApp() {
  return (
    <div className="space-y-3 text-sm text-gray-400">
      <p>Para receber e enviar mensagens precisas de ligar o <strong className="text-gray-200">WhatsApp Business API</strong> da Meta.</p>
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">O que vais precisar:</p>
        <ul className="space-y-1.5 text-xs">
          <li className="flex items-start gap-2"><span className="text-brand-400 flex-shrink-0">→</span>Uma conta no <strong className="text-gray-300">Meta Business Manager</strong></li>
          <li className="flex items-start gap-2"><span className="text-brand-400 flex-shrink-0">→</span>Um número de telemóvel dedicado (não pode estar em uso no WhatsApp pessoal)</li>
          <li className="flex items-start gap-2"><span className="text-brand-400 flex-shrink-0">→</span>O <strong className="text-gray-300">Phone Number ID</strong> e o <strong className="text-gray-300">Access Token</strong> da API</li>
        </ul>
      </div>
      <p className="text-xs text-gray-500">Vai a <strong className="text-brand-400">Definições → WhatsApp</strong> para introduzir as credenciais.</p>
    </div>
  );
}

function StepAgenda() {
  return (
    <div className="space-y-3 text-sm text-gray-400">
      <p>Configura a tua agenda online para que os clientes possam agendar serviços diretamente pelo link público.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '✂️', label: 'Serviços', desc: 'Cria os serviços que ofereces com duração e preço' },
          { icon: '👤', label: 'Profissionais', desc: 'Adiciona os profissionais disponíveis' },
          { icon: '🗓️', label: 'Horários', desc: 'Define os dias e horas de funcionamento' },
          { icon: '🌐', label: 'Página pública', desc: 'O teu link de agendamento fica ativo automaticamente' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-xl mb-1">{item.icon}</div>
            <p className="text-xs font-semibold text-gray-300">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTeam() {
  return (
    <div className="space-y-3 text-sm text-gray-400">
      <p>Adiciona membros da equipa para gerir conversas, responder a clientes e tratar agendamentos.</p>
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
        {[
          { role: 'Admin', desc: 'Acesso total, incluindo faturação e configurações' },
          { role: 'Agente', desc: 'Gere conversas e responde a clientes' },
          { role: 'Visualizador', desc: 'Apenas leitura (relatórios e contactos)' },
        ].map((r) => (
          <div key={r.role} className="flex items-start gap-3">
            <span className="text-xs font-bold text-brand-400 bg-brand-600/15 border border-brand-500/20 px-2 py-0.5 rounded-full flex-shrink-0">{r.role}</span>
            <p className="text-xs text-gray-500">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WelcomeWizard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `${WIZARD_KEY}_${user.tenantId ?? user.id}`;
    if (!localStorage.getItem(key)) setVisible(true);
  }, [user]);

  function dismiss() {
    if (!user) return;
    const key = `${WIZARD_KEY}_${user.tenantId ?? user.id}`;
    localStorage.setItem(key, '1');
    setVisible(false);
  }

  const steps: WizardStep[] = [
    {
      title: `Bem-vindo${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋`,
      subtitle: 'Vamos configurar o teu workspace em 3 passos.',
      icon: '🚀',
      content: (
        <div className="space-y-3 text-sm text-gray-400">
          <p>O <strong className="text-gray-200">WppRecebo</strong> permite-te gerir conversas WhatsApp, agendar serviços e automatizar respostas — tudo num só lugar.</p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { icon: '💬', label: 'Conversas', desc: 'Kanban de mensagens WhatsApp' },
              { icon: '📅', label: 'Agenda', desc: 'Agendamentos online automáticos' },
              { icon: '🤖', label: 'IA', desc: 'Respostas automáticas com Claude' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs font-semibold text-gray-300">{f.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Ligar o WhatsApp Business',
      subtitle: 'Conecta o teu número para começar a receber mensagens.',
      icon: '📱',
      content: <StepWhatsApp />,
      cta: { label: 'Ir para Definições', href: '/settings' },
    },
    {
      title: 'Configurar a Agenda',
      subtitle: 'Permite que os clientes agendem online, 24h por dia.',
      icon: '📅',
      content: <StepAgenda />,
      cta: { label: 'Configurar Agenda', href: '/agenda/configurar' },
    },
    {
      title: 'Convidar a Equipa',
      subtitle: 'Adiciona colegas para gerir conversas e agendamentos.',
      icon: '👥',
      content: <StepTeam />,
      cta: { label: 'Gerir Equipa', href: '/settings' },
    },
  ];

  if (!visible) return null;

  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d0d14] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/[0.05]">
          <div
            className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            {current.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-100">{current.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{current.subtitle}</p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 -mt-1"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-5">{current.content}</div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${i === step ? 'w-4 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-white/20'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                Anterior
              </button>
            )}

            {current.cta && (
              <button
                onClick={() => { router.push(current.cta!.href); dismiss(); }}
                className="px-4 py-2 text-sm text-brand-400 border border-brand-500/30 rounded-xl hover:bg-brand-600/10 transition-colors"
              >
                {current.cta.label}
              </button>
            )}

            {isLast ? (
              <button
                onClick={dismiss}
                className="px-5 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors font-medium"
              >
                Começar 🎉
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors font-medium"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
