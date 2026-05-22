import { Sidebar } from '@/components/sidebar';
import { SessionProvider } from '@/components/session-provider';
import { SocketProvider } from '@/components/socket-provider';
import { OnboardingBanner } from '@/components/onboarding-banner';
import { WelcomeWizard } from '@/components/welcome-wizard';

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
      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        <OnboardingBanner />
        <div className="flex-1 overflow-auto flex flex-col">{children}</div>
      </div>
    </div>
  );
}
