'use client';

import React, { useState, useEffect } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Header } from '@/components/common/Header';
import { CrisisBanner } from '@/components/common/CrisisBanner';

// Psychologist Views
import { PsychologistNav } from '@/components/psychologist/PsychologistNav';
import { DashboardView } from '@/components/psychologist/DashboardView';
import { PatientListView } from '@/components/psychologist/PatientListView';
import { PatientDetailView } from '@/components/psychologist/PatientDetailView';
import { AgendaView } from '@/components/psychologist/AgendaView';
import { LibraryView } from '@/components/psychologist/LibraryView';
import { FinancialModal } from '@/components/psychologist/FinancialModal';
import { AIAssistantWidget } from '@/components/common/AIAssistantWidget';

// Patient Views
import { PatientDesktopNav } from '@/components/patient/PatientDesktopNav';
import { PatientBottomNav } from '@/components/patient/PatientBottomNav';
import { PatientHomeView } from '@/components/patient/PatientHomeView';
import { BetweenSessionsHub } from '@/components/patient/BetweenSessionsHub';
import { DiaryView } from '@/components/patient/DiaryView';
import { EvolutionView } from '@/components/patient/EvolutionView';
import { PatientProfileView } from '@/components/patient/PatientProfileView';

export default function Home() {
  const { currentRole, currentPatient, switchRole, acceptPatientInvite } = usePsi();

  // Abas do Psicólogo
  const [psychologistTab, setPsychologistTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Abas do Paciente
  const [patientTab, setPatientTab] = useState<string>('inicio');

  // Detectar convite via link de URL (?invite=PSI-...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite');
      if (inviteToken) {
        const accepted = acceptPatientInvite(inviteToken);
        if (accepted) {
          switchRole('patient');
          setPatientTab('inicio');
        }
      }
    }
  }, [acceptPatientInvite, switchRole]);

  const handleSelectPatientForDetail = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPsychologistTab('pacientes');
  };

  const handleBackToPatientList = () => {
    setSelectedPatientId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-teal-100 selection:text-teal-900 pb-16 sm:pb-8">
      {/* Banner de Acolhimento e Suporte a Crises */}
      <CrisisBanner />

      {/* Header Principal com Seletor de Perfil / Demonstração */}
      <Header />

      {/* Navegação da Psicóloga */}
      {currentRole === 'psychologist' && (
        <PsychologistNav
          activeTab={psychologistTab}
          onSelectTab={tab => {
            setPsychologistTab(tab);
            if (tab !== 'pacientes') {
              setSelectedPatientId(null);
            }
          }}
        />
      )}

      {/* Navegação do Paciente (Desktop) */}
      {currentRole === 'patient' && (
        <PatientDesktopNav
          activeTab={patientTab}
          onSelectTab={tab => setPatientTab(tab)}
        />
      )}

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ========================================================================= */}
        {/* 1. VISÃO DO PSICÓLOGO */}
        {/* ========================================================================= */}
        {currentRole === 'psychologist' && (
          <div>
            {psychologistTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={tab => {
                  setPsychologistTab(tab);
                  if (tab !== 'pacientes') setSelectedPatientId(null);
                }}
                onSelectPatient={handleSelectPatientForDetail}
              />
            )}

            {psychologistTab === 'pacientes' && (
              <div>
                {selectedPatientId ? (
                  <PatientDetailView
                    patientId={selectedPatientId}
                    onBack={handleBackToPatientList}
                  />
                ) : (
                  <PatientListView onSelectPatient={handleSelectPatientForDetail} />
                )}
              </div>
            )}

            {psychologistTab === 'agenda' && (
              <AgendaView onSelectPatient={handleSelectPatientForDetail} />
            )}

            {psychologistTab === 'biblioteca' && <LibraryView />}

            {psychologistTab === 'financeiro' && (
              <FinancialModal
                isOpen={true}
                onClose={() => setPsychologistTab('dashboard')}
              />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. VISÃO DO PACIENTE */}
        {/* ========================================================================= */}
        {currentRole === 'patient' && (
          <div>
            {patientTab === 'inicio' && (
              <PatientHomeView onNavigateTab={tab => setPatientTab(tab)} />
            )}

            {patientTab === 'entre_sessoes' && (
              <BetweenSessionsHub onNavigateTab={tab => setPatientTab(tab)} />
            )}

            {patientTab === 'diario' && <DiaryView />}

            {patientTab === 'evolucao' && <EvolutionView />}

            {patientTab === 'perfil' && <PatientProfileView />}
          </div>
        )}
      </main>

      {/* Navegação Inferior Mobile do Paciente */}
      {currentRole === 'patient' && (
        <PatientBottomNav
          activeTab={patientTab}
          onSelectTab={tab => setPatientTab(tab)}
        />
      )}

      {/* Assistente Flutuante de IA Ética (Supervisionada) */}
      <AIAssistantWidget />
    </div>
  );
}
