'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReportsView } from '@/components/psychologist/reports/ReportsView';

export default function PsychologistReportsPage() {
  const router = useRouter();

  return (
    <div>
      <ReportsView onSelectPatient={patientId => router.push(`/psicologo/pacientes/${patientId}`)} />
    </div>
  );
}
