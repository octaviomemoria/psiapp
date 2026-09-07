'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '@/components/psychologist/DashboardView';
import { TelepsychologyCockpitModal } from '@/components/psychologist/TelepsychologyCockpitModal';
import { PixPaymentModal } from '@/components/common/PixPaymentModal';
import { usePsi } from '@/lib/store/psi-context';

export default function PsychologistDashboardPage() {
  const router = useRouter();
  const { patients } = usePsi();
  const [telepsychologyPatient, setTelepsychologyPatient] = useState<{ id: string; name: string } | null>(null);
  const [pixPaymentData, setPixPaymentData] = useState<{ id: string; name: string; amount: number; appointmentId: string } | null>(null);

  const handleNavigateTab = (tab: string) => {
    router.push(`/psicologo/${tab}`);
  };

  const handleSelectPatient = (patientId: string) => {
    router.push(`/psicologo/pacientes/${patientId}`);
  };

  return (
    <div>
      <DashboardView
        onNavigateTab={handleNavigateTab}
        onSelectPatient={handleSelectPatient}
      />

      {/* Cockpit de Telepsicologia Integrada */}
      {telepsychologyPatient && (
        <TelepsychologyCockpitModal
          isOpen={true}
          onClose={() => setTelepsychologyPatient(null)}
          patientId={telepsychologyPatient.id}
          patientName={telepsychologyPatient.name}
        />
      )}

      {/* Modal de Cobrança Pix */}
      {pixPaymentData && (
        <PixPaymentModal
          isOpen={true}
          onClose={() => setPixPaymentData(null)}
          appointmentId={pixPaymentData.appointmentId}
          patientId={pixPaymentData.id}
          patientName={pixPaymentData.name}
          amount={pixPaymentData.amount}
        />
      )}
    </div>
  );
}
