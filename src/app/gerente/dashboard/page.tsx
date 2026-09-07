'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ManagerDashboardView } from '@/components/manager/ManagerDashboardView';

export default function ManagerDashboardPage() {
  const router = useRouter();

  const handleNavigateTab = (tab: string) => {
    router.push(`/gerente/${tab}`);
  };

  return (
    <div>
      <ManagerDashboardView onNavigateTab={handleNavigateTab} />
    </div>
  );
}
