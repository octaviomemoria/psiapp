'use client';

import React from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  Lock,
  Heart,
  FileCheck,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export const PatientProfileView: React.FC = () => {
  const { currentPatient, currentPsychologist, switchRole } = usePsi();

  return (
    <div className="space-y-6 animate-fade-in pb-12 sm:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-teal-600" />
          Meu Perfil & Privacidade
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Suas informações cadastrais, consentimentos de privacidade e contato do terapeuta.
        </p>
      </div>

      {/* Cartão de Identificação */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
            {currentPatient.profile?.avatar_url ? (
              <img src={currentPatient.profile.avatar_url} alt={currentPatient.full_name} className="w-full h-full object-cover" />
            ) : (
              currentPatient.full_name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">{currentPatient.full_name}</h3>
              <Badge variant="success" size="sm">Paciente Ativo</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentPatient.email} • {currentPatient.phone}
            </p>
          </div>
        </div>
      </Card>

      {/* Psicóloga Responsável */}
      <Card className="p-6 bg-gradient-to-br from-teal-50/50 to-slate-50 border-teal-100">
        <h4 className="text-sm font-bold text-teal-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          Psicóloga Responsável Técnica
        </h4>
        <div className="space-y-2 text-xs text-slate-700">
          <p className="text-base font-bold text-slate-800">{currentPsychologist.profile?.full_name || 'Dra. Ana Martins'}</p>
          <p>CRP: {currentPsychologist.crp_number}/{currentPsychologist.crp_state}</p>
          <p>Abordagem: {currentPsychologist.approach}</p>
          <p className="text-slate-500 italic mt-2">"{currentPsychologist.bio}"</p>
        </div>
      </Card>

      {/* Dados de Emergência */}
      <Card className="p-6">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          Contato de Apoio / Emergência
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="font-semibold text-slate-700 block">Nome do Contato:</span>
            {currentPatient.emergency_contact_name || 'Lucas Costa (Irmão)'}
          </div>
          <div>
            <span className="font-semibold text-slate-700 block">Telefone:</span>
            {currentPatient.emergency_contact_phone || '(11) 98888-1111'}
          </div>
        </div>
      </Card>

      {/* LGPD e Termos de Consentimento */}
      <Card className="p-6 space-y-3">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-teal-600" />
          Consentimento & Proteção de Dados (LGPD)
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Seus dados de saúde e registros de acompanhamento psicológico são protegidos conforme as normas da Lei Geral de Proteção de Dados (LGPD) e as resoluções do Conselho Federal de Psicologia (CFP).
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          Termo de Consentimento para Telepsicologia aceito em {formatDate(currentPatient.started_at)}
        </div>
      </Card>

      {/* Alternar de volta para visão da Psicóloga (Para fins de Teste / Demo) */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => switchRole('psychologist')}
          className="text-xs font-semibold text-teal-800 border-teal-200 hover:bg-teal-50"
        >
          Alternar para Visão da Psicóloga (Dra. Ana Martins)
        </Button>
      </div>
    </div>
  );
};
