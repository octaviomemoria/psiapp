'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FinancialView } from '@/components/psychologist/FinancialView';

export default function PsychologistFinancialPage() {
  const router = useRouter();

  // Mesma tela completa da navegação por abas (antes esta rota abria um modal simplificado).
  const handleNavigateTab = (tab: string) => router.push(`/psicologo/${tab}`);

  return (
    <div>
      <FinancialView onNavigateTab={handleNavigateTab} />
    </div>
  );
}
