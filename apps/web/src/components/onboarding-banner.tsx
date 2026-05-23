'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  fetchOnboardingStatus,
  countCompleted,
  TOTAL_STEPS,
  ONBOARDING_STEPS,
} from '@/lib/onboarding';
import { useAuthStore } from '@/stores/auth.store';

const DISMISS_KEY = 'onboarding_dismissed';

export function OnboardingBanner() {
  const tenantId = useAuthStore((s) => s.user?.tenantId ?? '');
  const storageKey = `${DISMISS_KEY}_${tenantId}`;
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === '1';
  });
  const [expanded, setExpanded] = useState(true);

  const { data: status } = useQuery({
    queryKey: ['onboarding'],
    queryFn: fetchOnboardingStatus,
    staleTime: 30_000,
  });

  if (dismissed || !status) return null;

  const completed = countCompleted(status);
  const allDone = completed === TOTAL_STEPS;

  function dismiss() {
    localStorage.setItem(storageKey, '1');
    setDismissed(true);
  }

  return (
    <div className="hidden md:block mb-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${allDone ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-white/60'}`}>
            {allDone ? '✓' : `${completed}/${TOTAL_STEPS}`}
          </div>
          <div>
            <p className="text-sm font-medium text-white/90">
              {allDone ? 'Configuração concluída! 🎉' : 'Começa aqui — configura o teu workspace'}
            </p>
            <p className="text-xs text-white/35 mt-0.5">
              {allDone ? 'O teu workspace está pronto para usar.' : `${completed} de ${TOTAL_STEPS} passos concluídos`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2 w-32">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${(completed / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/30 tabular-nums">{Math.round((completed / TOTAL_STEPS) * 100)}%</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            className="text-white/20 hover:text-white/50 transition-colors text-lg leading-none"
            title="Dispensar"
          >
            ×
          </button>
          <span className="text-white/20 text-xs">{expanded ? '▲' : '▽'}</span>
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ONBOARDING_STEPS.map((step, i) => {
            const done = status[step.key];
            return (
              <div
                key={step.key}
                className={`rounded-xl p-3.5 border transition-colors ${
                  done
                    ? 'bg-brand-500/5 border-brand-500/15'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                    done ? 'bg-brand-500 text-white' : 'bg-white/8 text-white/30 border border-white/10'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${done ? 'text-brand-400' : 'text-white/70'}`}>
                    {step.label}
                  </p>
                </div>
                <p className="text-xs text-white/30 leading-relaxed pl-7">{step.description}</p>
                {!done && step.href && (
                  <Link
                    href={step.href}
                    className="block mt-2.5 pl-7 text-xs text-brand-400/80 hover:text-brand-300 transition-colors"
                  >
                    {step.actionLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
