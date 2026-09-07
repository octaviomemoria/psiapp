'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminDashboardView } from '@/components/superadmin/SuperAdminDashboardView';

export default function SuperAdminDashboardPage() {
  const router = useRouter();

  const handleNavigateTab = (tab: string) => {
    router.push(`/superadmin/${tab}`);
  };

  return (
    <div>
      <SuperAdminDashboardView onNavigateTab={handleNavigateTab} />
    </div>
  );
}
