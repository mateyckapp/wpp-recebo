import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { SessionProvider } from '@/components/session-provider';
import { SocketProvider } from '@/components/socket-provider';
import { OnboardingBanner } from '@/components/onboarding-banner';
import { WelcomeWizard } from '@/components/welcome-wizard';
import { EmailVerificationBanner } from '@/components/email-verification-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex h-screen overflow-hidden bg-[#060609]">
      <SessionProvider />
      <SocketProvider />
      <WelcomeWizard />
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Cabeçalho móvel */}
        <div className="flex md:hidden items-center h-12 px-4 border-b border-white/[0.06] bg-[#0a0a0f] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">Wpp-Recebo</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-3 md:p-6 pb-16 md:pb-6 flex flex-col">
          <EmailVerificationBanner />
          <OnboardingBanner />
          <div className="flex-1 overflow-auto flex flex-col">{children}</div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
