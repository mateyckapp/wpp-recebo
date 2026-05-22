import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wpp-Recebo — Gestão de WhatsApp para o seu negócio',
  description:
    'A plataforma portuguesa para gerir o WhatsApp da sua empresa com produtividade e IA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
