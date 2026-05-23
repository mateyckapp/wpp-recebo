'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const PRODUCTS = [
  {
    key: 'start',
    name: 'Start',
    price: '€49/mês',
    desc: 'Para começar com o WhatsApp',
    href: '/produtos/start',
    icon: '🚀',
    colorClass: 'text-gray-200',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '€99/mês',
    desc: 'Para equipas em crescimento',
    href: '/produtos/pro',
    icon: '⚡',
    colorClass: 'text-brand-400',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '€199/mês',
    desc: 'Para grandes operações',
    href: '/produtos/enterprise',
    icon: '🏢',
    colorClass: 'text-violet-400',
  },
  {
    key: 'agenda-pro',
    name: 'Agenda Pro',
    price: '€129/mês',
    desc: 'Para clínicas e salões',
    href: '/produtos/agenda-pro',
    icon: '📅',
    colorClass: 'text-emerald-400',
  },
];

export function LandingNav(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Produtos
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
            <div className="w-72 rounded-xl border border-white/[0.1] bg-[#0c0c10]/96 backdrop-blur-xl shadow-2xl shadow-black/60 p-2">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.key}
                  href={p.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${p.colorClass}`}>{p.name}</span>
                      <span className="text-xs text-gray-600">{p.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <a href="/#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
      <a href="/#precos" className="hover:text-white transition-colors">Preços</a>
      <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
    </nav>
  );
}
