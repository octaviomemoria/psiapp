import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PsiProvider } from '@/lib/store/psi-context';
import { PwaRegistration } from '@/components/common/PwaRegistration';

export const viewport: Viewport = {
  themeColor: '#0D9488',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'PsiApp — Plataforma de Acompanhamento Psicológico & Evolução Terapêutica',
  description:
    'SaaS moderno para psicólogos e pacientes: gestão de sessões, exercícios terapêuticos entre consultas, diário emocional e acompanhamento longitudinal.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PsiApp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-[#F8FAFC]">
        <PsiProvider>
          {children}
          <PwaRegistration />
        </PsiProvider>
      </body>
    </html>
  );
}
