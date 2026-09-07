'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Sparkles,
  Users,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Brain,
  CheckCircle2,
  KeyRound,
  LogOut,
  Database,
  User,
  Building2,
  Crown,
  Fingerprint,
  FileText,
  Globe,
  BellRing,
  Lock,
  MessageSquare,
  Palette,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { NotificationDropdown } from './NotificationDropdown';
import { AuthModal } from '@/components/auth/AuthModal';
import { BiometricLockModal } from './BiometricLockModal';
import { TherapeuticContractModal } from './TherapeuticContractModal';
import { PublicBookingPage } from '@/components/public/PublicBookingPage';
import { PushNotificationManager } from './PushNotificationManager';
import { TwoFactorSetupModal } from '@/components/auth/TwoFactorSetupModal';
import { SaaSSubscriptionModal } from './SaaSSubscriptionModal';
import { SecureChatModal } from './SecureChatModal';
import { ClinicBrandingModal } from './ClinicBrandingModal';
import { AccountSecurityModal } from '@/components/auth/AccountSecurityModal';

export const Header: React.FC = () => {
  const {
    authUser,
    authProfile,
    isLiveProduction,
    signOut,
    currentRole,
    currentPsychologist,
    currentPatient,
    patients,
    switchRole,
  } = usePsi();

  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPushOpen, setIsPushOpen] = useState(false);
  const [isTwoFactorOpen, setIsTwoFactorOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isAccountSecurityOpen, setIsAccountSecurityOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-800 tracking-tight">PsiApp</span>
                <Badge variant="success" size="sm" className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Supabase Live
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">Acompanhamento Terapêutico & Evolução Clínica</p>
            </div>
          </div>

          {/* Seletor de Perfil & Conta */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seletor de Perfil & Papel */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
              {/* 1. Psicólogo */}
              <button
                type="button"
                onClick={() => switchRole('psychologist')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'psychologist'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visualização do Consultório do Psicólogo"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Psicólogo(a)</span>
              </button>

              {/* 2. Paciente */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => switchRole('patient')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentRole === 'patient'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Visualização do Paciente"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Paciente</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown de troca de paciente */}
                {patients.length > 0 && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-dropdown border border-slate-100 py-1 hidden group-hover:block z-50">
                    <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Meus Pacientes:
                    </div>
                    {patients.map(patient => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => switchRole('patient', patient.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentPatient?.id === patient.id && currentRole === 'patient'
                            ? 'font-bold text-teal-700 bg-teal-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{patient.full_name}</span>
                        {currentPatient?.id === patient.id && currentRole === 'patient' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Gerente da Clínica */}
              <button
                type="button"
                onClick={() => switchRole('manager')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'manager'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Painel do Gerente (Dono da Clínica)"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Gerente</span>
              </button>

              {/* 4. SuperAdmin */}
              <button
                type="button"
                onClick={() => switchRole('superadmin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'superadmin'
                    ? 'bg-white text-amber-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Painel do SuperAdmin SaaS (Multi-Tenant)"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline">SuperAdmin</span>
              </button>
            </div>

            {/* Sino de Notificações */}
            <NotificationDropdown />

            {/* Usuário Logado vs Botão Entrar */}
            {authProfile || (isLiveProduction && authUser) ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[120px] truncate">{authProfile?.display_name || authProfile?.full_name || authUser?.email}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-600" />
                </button>
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-dropdown border border-slate-100 py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{authProfile?.display_name || authProfile?.full_name || 'Meu Consultório'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{authProfile?.email || authUser?.email}</p>
                    <Badge variant="success" size="sm" className="mt-1">
                      Conectado ao Supabase
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAccountSecurityOpen(true)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                  >
                    <Shield className="w-3.5 h-3.5 text-teal-600" />
                    <span>Segurança & Sessões Ativas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta (Logout)</span>
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs font-semibold shadow-xs bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600"
                title="Entrar ou criar conta real"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1" />
                <span>Entrar / Cadastrar</span>
              </Button>
            )}

            {/* Ações Auxiliares */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBookingOpen(true)}
              className="hidden sm:flex items-center text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
              title="Página Pública de Agendamento Online"
            >
              <Globe className="w-3.5 h-3.5 mr-1 text-teal-600" />
              Bio Link
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsContractOpen(true)}
              className="hidden md:flex items-center text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              title="Termo de Consentimento & Contrato Terapêutico"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Contrato
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBiometricOpen(true)}
              className="text-slate-600 hover:text-indigo-600"
              title="Bloqueio por PIN / Biometria de Privacidade"
            >
              <Fingerprint className="w-4 h-4 text-indigo-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(true)}
              className="text-slate-600 hover:text-teal-600 relative"
              title="Mensageria Segura In-App (E2EE) • Horário de Expediente & Triagem"
            >
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPushOpen(true)}
              className="text-slate-600 hover:text-amber-600"
              title="Configurar Notificações Push & Lembretes"
            >
              <BellRing className="w-4 h-4 text-amber-500" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubscriptionOpen(true)}
              className="hidden lg:flex items-center text-xs text-amber-800 border-amber-300 bg-amber-50/60 hover:bg-amber-100 font-semibold"
              title="Assinatura e Planos SaaS"
            >
              <Crown className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Planos SaaS
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsBrandingOpen(true)}
              className="text-slate-600 hover:text-purple-600 hidden sm:flex"
              title="Personalização de Marca & Identidade Visual (White-Label)"
            >
              <Palette className="w-4 h-4 text-purple-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTwoFactorOpen(true)}
              className="text-slate-600 hover:text-teal-600"
              title="Configurar Autenticação em Dois Fatores (2FA/TOTP)"
            >
              <Lock className="w-4 h-4 text-teal-600" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLgpdModalOpen(true)}
              className="hidden xl:flex items-center text-xs text-slate-600 border-slate-200"
              title="Privacidade e Segurança LGPD/CFP"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 mr-1" />
              LGPD & Sigilo
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Autenticação Real */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal de Informações LGPD / Sigilo Ético */}
      <Modal
        isOpen={isLgpdModalOpen}
        onClose={() => setIsLgpdModalOpen(false)}
        title="Privacidade, LGPD e Resoluções do CFP"
        description="Conformidade ética e técnica rigorosa com a Resolução CFP nº 001/2009 e CFP nº 011/2018."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-900">Segregação Absoluta de Anotações Clínicas</p>
              <p className="mt-1 text-teal-800">
                Anotações de hipóteses diagnósticas e supervisão são armazenadas em tabelas com chaves de encriptação separadas, sendo inacessíveis pelo paciente conforme determina o Código de Ética Profissional do Psicólogo.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">Direito do Titular (LGPD Art. 18)</p>
            <p className="mt-1">
              O paciente possui total controle de compartilhamento de seu diário emocional pessoal, podendo definir individualmente quais reflexões deseja ou não disponibilizar para a terapeuta.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsLgpdModalOpen(false)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Bloqueio por PIN / Biometria */}
      <BiometricLockModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
      />

      {/* Modal de Contrato Terapêutico Digital */}
      <TherapeuticContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        patientName={currentPatient?.full_name || 'Paciente'}
        psychologistName={currentPsychologist.profile?.full_name ? `${currentPsychologist.profile.full_name} (CRP ${currentPsychologist.crp_number}/${currentPsychologist.crp_state})` : 'Psicólogo(a)'}
      />

      {/* Página Pública de Agendamento (Bio Link) */}
      <PublicBookingPage
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* Gerenciador de Notificações Push */}
      <PushNotificationManager
        isOpen={isPushOpen}
        onClose={() => setIsPushOpen(false)}
      />

      {/* Modal de Autenticação em Dois Fatores (2FA/TOTP) */}
      <TwoFactorSetupModal
        isOpen={isTwoFactorOpen}
        onClose={() => setIsTwoFactorOpen(false)}
        userEmail={authUser?.email || authProfile?.email || 'psicologo@clinica.com.br'}
      />

      {/* Modal de Assinaturas e Planos SaaS */}
      <SaaSSubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      {/* Modal de Mensageria Clínica Segura (E2EE) */}
      <SecureChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Modal de Personalização White-Label da Clínica */}
      <ClinicBrandingModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
      />

      {/* Modal de Segurança da Conta & Sessões Ativas */}
      <AccountSecurityModal
        isOpen={isAccountSecurityOpen}
        onClose={() => setIsAccountSecurityOpen(false)}
      />
    </header>
  );
};
