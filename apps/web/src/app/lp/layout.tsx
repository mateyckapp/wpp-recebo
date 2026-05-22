import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

export const metadata: Metadata = {
  title: 'Wpp-Recebo — WhatsApp Business para negócios portugueses',
  description: 'Transforma o teu WhatsApp numa máquina de vendas. Responde mais rápido, vende mais e nunca percas uma mensagem.',
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={dmSans.className}>
      {children}
    </div>
  );
}
