import { Sidebar } from '@/components/sidebar';
import { SessionProvider } from '@/components/session-provider';
import { OnboardingBanner } from '@/components/onboarding-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex h-screen overflow-hidden bg-[#060609]">
      <SessionProvider />
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 flex flex-col">
        <OnboardingBanner />
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}
