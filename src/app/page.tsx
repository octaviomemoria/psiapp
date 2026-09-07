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
import { FinancialView } from '@/components/psychologist/FinancialView';
import { AIAssistantWidget } from '@/components/common/AIAssistantWidget';

// Patient Views
import { PatientDesktopNav } from '@/components/patient/PatientDesktopNav';
import { PatientBottomNav } from '@/components/patient/PatientBottomNav';
import { PatientHomeView } from '@/components/patient/PatientHomeView';
import { BetweenSessionsHub } from '@/components/patient/BetweenSessionsHub';
import { DiaryView } from '@/components/patient/DiaryView';
import { EvolutionView } from '@/components/patient/EvolutionView';
import { PatientProfileView } from '@/components/patient/PatientProfileView';

// Clinic Manager Views (Dono da Clínica)
import { ManagerNav } from '@/components/manager/ManagerNav';
import { ManagerDashboardView } from '@/components/manager/ManagerDashboardView';
import { ManagerPsychologistsView } from '@/components/manager/ManagerPsychologistsView';
import { ManagerPatientsView } from '@/components/manager/ManagerPatientsView';
import { ManagerFinancialView } from '@/components/manager/ManagerFinancialView';
import { ManagerRoomsView } from '@/components/manager/ManagerRoomsView';

// SuperAdmin SaaS Views (Dono do Sistema)
import { SuperAdminNav } from '@/components/superadmin/SuperAdminNav';
import { SuperAdminDashboardView } from '@/components/superadmin/SuperAdminDashboardView';
import { SuperAdminTenantsView } from '@/components/superadmin/SuperAdminTenantsView';
import { SuperAdminPlansView } from '@/components/superadmin/SuperAdminPlansView';
import { SuperAdminAuditView } from '@/components/superadmin/SuperAdminAuditView';

export default function Home() {
  const { currentRole, currentPatient, switchRole, acceptPatientInvite } = usePsi();

  // Abas do Psicólogo
  const [psychologistTab, setPsychologistTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Abas do Paciente
  const [patientTab, setPatientTab] = useState<string>('inicio');

  // Abas do Gerente (Clínica)
  const [managerTab, setManagerTab] = useState<string>('dashboard');

  // Abas do SuperAdmin (SaaS)
  const [superAdminTab, setSuperAdminTab] = useState<string>('dashboard');

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
      {/* Banner de Acolhimento e Suporte a Crises (Exibido para pacientes e terapeutas) */}
      {(currentRole === 'patient' || currentRole === 'psychologist') && <CrisisBanner />}

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

      {/* Navegação do Gerente da Clínica */}
      {currentRole === 'manager' && (
        <ManagerNav
          activeTab={managerTab}
          onSelectTab={tab => setManagerTab(tab)}
        />
      )}

      {/* Navegação do SuperAdmin SaaS */}
      {currentRole === 'superadmin' && (
        <SuperAdminNav
          activeTab={superAdminTab}
          onSelectTab={tab => setSuperAdminTab(tab)}
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
              <FinancialView onNavigateTab={setPsychologistTab} />
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

        {/* ========================================================================= */}
        {/* 3. VISÃO DO GERENTE (DONO DA CLÍNICA) */}
        {/* ========================================================================= */}
        {currentRole === 'manager' && (
          <div>
            {managerTab === 'dashboard' && (
              <ManagerDashboardView onNavigateTab={tab => setManagerTab(tab)} />
            )}

            {managerTab === 'equipe' && <ManagerPsychologistsView />}

            {managerTab === 'pacientes' && <ManagerPatientsView />}

            {managerTab === 'financeiro' && <ManagerFinancialView />}

            {managerTab === 'salas' && <ManagerRoomsView />}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. VISÃO DO SUPERADMIN (DONO DA PLATAFORMA SAAS) */}
        {/* ========================================================================= */}
        {currentRole === 'superadmin' && (
          <div>
            {superAdminTab === 'dashboard' && (
              <SuperAdminDashboardView onNavigateTab={tab => setSuperAdminTab(tab)} />
            )}

            {superAdminTab === 'clinicas' && <SuperAdminTenantsView />}

            {superAdminTab === 'planos' && <SuperAdminPlansView />}

            {superAdminTab === 'auditoria' && <SuperAdminAuditView />}
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
