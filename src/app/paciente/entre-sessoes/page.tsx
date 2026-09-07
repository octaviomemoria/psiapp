'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BetweenSessionsHub } from '@/components/patient/BetweenSessionsHub';

export default function PatientBetweenSessionsPage() {
  const router = useRouter();

  const handleNavigateTab = (tab: string) => {
    const route = tab.replace('_', '-');
    router.push(`/paciente/${route}`);
  };

  return (
    <div>
      <BetweenSessionsHub onNavigateTab={handleNavigateTab} />
    </div>
  );
}
