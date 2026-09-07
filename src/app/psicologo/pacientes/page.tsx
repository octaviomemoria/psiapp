'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PatientListView } from '@/components/psychologist/PatientListView';

export default function PsychologistPatientsPage() {
  const router = useRouter();

  const handleSelectPatient = (patientId: string) => {
    router.push(`/psicologo/pacientes/${patientId}`);
  };

  return (
    <div>
      <PatientListView onSelectPatient={handleSelectPatient} />
    </div>
  );
}
