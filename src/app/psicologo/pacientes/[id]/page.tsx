'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientDetailView } from '@/components/psychologist/PatientDetailView';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  return (
    <div>
      <PatientDetailView
        patientId={patientId}
        onBack={() => router.push('/psicologo/pacientes')}
      />
    </div>
  );
}
