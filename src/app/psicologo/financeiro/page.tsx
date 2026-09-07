'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FinancialModal } from '@/components/psychologist/FinancialModal';

export default function PsychologistFinancialPage() {
  const router = useRouter();

  return (
    <div>
      <FinancialModal
        isOpen={true}
        onClose={() => router.push('/psicologo/dashboard')}
      />
    </div>
  );
}
