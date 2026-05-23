'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminLogout } from '@/lib/admin';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/admin/tenants', label: 'Clientes', icon: '⊞' },
  { href: '/admin/billing', label: 'Faturação', icon: '◎' },
  { href: '/admin/pagamentos', label: 'Pagamentos', icon: '◉' },
  { href: '/admin/pixels', label: 'Pixels & Ads', icon: '⬡' },
  { href: '/admin/settings', label: 'Configurações', icon: '⊕' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function handleLogout() {
    await adminLogout();
    router.push('/admin/login');
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#111118] border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">W</div>
            <div>
              <div className="text-xs font-semibold text-white">WppRecebo</div>
              <div className="text-[10px] text-white/30">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <span className="text-base leading-none">⏻</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
