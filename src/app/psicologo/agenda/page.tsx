'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AgendaView } from '@/components/psychologist/AgendaView';

export default function PsychologistAgendaPage() {
  const router = useRouter();

  const handleSelectPatient = (patientId: string) => {
    router.push(`/psicologo/pacientes/${patientId}`);
  };

  return (
    <div>
      <AgendaView onSelectPatient={handleSelectPatient} />
    </div>
  );
}
