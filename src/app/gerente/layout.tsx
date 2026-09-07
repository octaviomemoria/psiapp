'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { CrisisBanner } from '@/components/common/CrisisBanner';
import { ManagerNav } from '@/components/manager/ManagerNav';
import { AIAssistantWidget } from '@/components/common/AIAssistantWidget';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/equipe')) return 'equipe';
    if (pathname.includes('/pacientes')) return 'pacientes';
    if (pathname.includes('/financeiro')) return 'financeiro';
    if (pathname.includes('/salas')) return 'salas';
    return 'dashboard';
  };

  const handleSelectTab = (tab: string) => {
    router.push(`/gerente/${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-indigo-100 selection:text-indigo-900 pb-16 sm:pb-8">
      <CrisisBanner />
      <Header />
      <ManagerNav activeTab={getActiveTab()} onSelectTab={handleSelectTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <AIAssistantWidget />
    </div>
  );
}
