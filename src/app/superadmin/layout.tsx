'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { SuperAdminNav } from '@/components/superadmin/SuperAdminNav';
import { AIAssistantWidget } from '@/components/common/AIAssistantWidget';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/clinicas')) return 'clinicas';
    if (pathname.includes('/planos')) return 'planos';
    if (pathname.includes('/auditoria')) return 'auditoria';
    return 'dashboard';
  };

  const handleSelectTab = (tab: string) => {
    router.push(`/superadmin/${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-300 pb-16 sm:pb-8">
      <Header />
      <SuperAdminNav activeTab={getActiveTab()} onSelectTab={handleSelectTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <AIAssistantWidget />
    </div>
  );
}
