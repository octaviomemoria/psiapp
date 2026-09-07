'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { CrisisBanner } from '@/components/common/CrisisBanner';
import { PsychologistNav } from '@/components/psychologist/PsychologistNav';
import { AIAssistantWidget } from '@/components/common/AIAssistantWidget';

export default function PsychologistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Mapear rota atual para id da aba
  const getActiveTab = () => {
    if (pathname.includes('/agenda')) return 'agenda';
    if (pathname.includes('/pacientes')) return 'pacientes';
    if (pathname.includes('/biblioteca')) return 'biblioteca';
    if (pathname.includes('/financeiro')) return 'financeiro';
    return 'dashboard';
  };

  const handleSelectTab = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        router.push('/psicologo/dashboard');
        break;
      case 'pacientes':
        router.push('/psicologo/pacientes');
        break;
      case 'agenda':
        router.push('/psicologo/agenda');
        break;
      case 'biblioteca':
        router.push('/psicologo/biblioteca');
        break;
      case 'financeiro':
        router.push('/psicologo/financeiro');
        break;
      default:
        router.push('/psicologo/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-teal-100 selection:text-teal-900 pb-16 sm:pb-8">
      <CrisisBanner />
      <Header />
      <PsychologistNav activeTab={getActiveTab()} onSelectTab={handleSelectTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <AIAssistantWidget />
    </div>
  );
}
