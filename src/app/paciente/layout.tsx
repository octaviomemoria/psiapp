'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { CrisisBanner } from '@/components/common/CrisisBanner';
import { PatientDesktopNav } from '@/components/patient/PatientDesktopNav';
import { PatientBottomNav } from '@/components/patient/PatientBottomNav';
import { AIAssistantWidget } from '@/components/common/AIAssistantWidget';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/entre-sessoes')) return 'entre_sessoes';
    if (pathname.includes('/diario')) return 'diario';
    if (pathname.includes('/evolucao')) return 'evolucao';
    if (pathname.includes('/perfil')) return 'perfil';
    return 'inicio';
  };

  const handleSelectTab = (tab: string) => {
    const routeName = tab.replace('_', '-');
    router.push(`/paciente/${routeName}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-teal-100 selection:text-teal-900 pb-20 sm:pb-8">
      <CrisisBanner />
      <Header />
      <PatientDesktopNav activeTab={getActiveTab()} onSelectTab={handleSelectTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <PatientBottomNav activeTab={getActiveTab()} onSelectTab={handleSelectTab} />
      <AIAssistantWidget />
    </div>
  );
}
