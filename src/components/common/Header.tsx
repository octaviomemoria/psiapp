'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Sparkles,
  Users,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Brain,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { NotificationDropdown } from './NotificationDropdown';
import { AuthModal } from '@/components/auth/AuthModal';

export const Header: React.FC = () => {
  const {
    currentRole,
    currentPsychologist,
    currentPatient,
    patients,
    switchRole,
    resetToDemoData,
  } = usePsi();

  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
                <Badge variant="default" size="sm" className="hidden sm:inline-flex bg-teal-50 text-teal-700">
                  MVP v1.0
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">Acompanhamento Terapêutico & Evolução Clínica</p>
            </div>
          </div>

          {/* Seletor de Perfil / Demo Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Alternador de Perfil */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => switchRole('psychologist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'psychologist'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visualização da Psicóloga"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Psicóloga:</span> {currentPsychologist.profile?.display_name || 'Dra. Ana'}
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <div className="relative group">
                <button
                  type="button"
                  onClick={() => switchRole('patient')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentRole === 'patient'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Visualização do Paciente"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paciente:</span> {currentPatient.social_name || currentPatient.full_name.split(' ')[0]}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown de troca de paciente */}
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-dropdown border border-slate-100 py-1 hidden group-hover:block z-50">
                  <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Alternar Paciente Demo:
                  </div>
                  {patients.map(patient => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => switchRole('patient', patient.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentPatient.id === patient.id && currentRole === 'patient'
                          ? 'font-bold text-teal-700 bg-teal-50/50'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{patient.full_name}</span>
                      {currentPatient.id === patient.id && currentRole === 'patient' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sino de Notificações */}
            <NotificationDropdown />

            {/* Botão Entrar / Conta */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs font-semibold shadow-xs"
              title="Entrar ou criar conta"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Entrar / Conta</span>
            </Button>

            {/* Ações Auxiliares */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLgpdModalOpen(true)}
              className="hidden lg:flex items-center text-xs text-slate-600 border-slate-200"
              title="Privacidade e Segurança LGPD/CFP"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 mr-1" />
              LGPD & Sigilo
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-slate-400 hover:text-slate-600"
              title="Restaurar dados iniciais de demonstração"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Autenticação Real */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal LGPD e Compliance Ético */}
      <Modal
        isOpen={isLgpdModalOpen}
        onClose={() => setIsLgpdModalOpen(false)}
        title="Privacidade, LGPD e Segurança de Dados"
        description="Diretrizes éticas e de proteção a dados sensíveis de saúde."
        maxWidth="2xl"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-teal-900">Segregação Rigorosa de Dados Clínicos</p>
              <p className="text-xs text-teal-800 mt-1">
                Anotações classificadas como <strong>Privado do Psicólogo (Sigilo)</strong> possuem isolamento estrutural e nunca são transmitidas ou exibidas na interface do paciente.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Conformidade com o CFP e a LGPD (Lei 13.709/2018):</h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
              <li><strong>Controle pelo Paciente:</strong> Diários e anotações pessoais nascem privados e só são acessíveis pelo terapeuta se o paciente optar por compartilhar.</li>
              <li><strong>Não-Diagnóstico Automatizado:</strong> Gráficos e resumos de humor destinam-se exclusivamente ao diálogo clínico de acompanhamento.</li>
              <li><strong>Trilha de Auditoria:</strong> Operações de criação, edição e visualização de registros clínicos possuem registro temporal.</li>
              <li><strong>Guarda Segura:</strong> Banco de dados PostgreSQL com políticas de segurança em nível de linha (RLS).</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsLgpdModalOpen(false)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmação Reset Demo */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Restaurar Dados da Demonstração?"
        description="Isso recarregará os dados originais da Dra. Ana Martins e dos 5 pacientes fictícios."
        maxWidth="md"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Todas as alterações feitas localmente durante esta sessão serão substituídas pelos dados iniciais da demonstração.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetToDemoData();
                setIsResetConfirmOpen(false);
              }}
            >
              Sim, Restaurar
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
