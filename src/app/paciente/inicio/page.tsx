'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PatientHomeView } from '@/components/patient/PatientHomeView';

export default function PatientHomePage() {
  const router = useRouter();

  const handleNavigateTab = (tab: string) => {
    const route = tab.replace('_', '-');
    router.push(`/paciente/${route}`);
  };

  return (
    <div>
      <PatientHomeView onNavigateTab={handleNavigateTab} />
    </div>
  );
}
