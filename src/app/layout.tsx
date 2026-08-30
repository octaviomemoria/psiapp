import type { Metadata } from 'next';
import './globals.css';
import { PsiProvider } from '@/lib/store/psi-context';

export const metadata: Metadata = {
  title: 'PsiApp — Plataforma de Acompanhamento Psicológico & Evolução Terapêutica',
  description:
    'SaaS moderno para psicólogos e pacientes: gestão de sessões, exercícios terapêuticos entre consultas, diário emocional e acompanhamento longitudinal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-[#F8FAFC]">
        <PsiProvider>{children}</PsiProvider>
      </body>
    </html>
  );
}
