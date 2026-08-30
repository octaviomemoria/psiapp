import React from 'react';
import { Lock, ShieldCheck, Share2, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface PrivacyBadgeProps {
  type: 'psychologist_private' | 'patient_private' | 'shared' | 'clinical_record';
  size?: 'sm' | 'md';
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ type, size = 'sm' }) => {
  if (type === 'psychologist_private') {
    return (
      <Badge variant="purple" size={size} className="gap-1 font-medium">
        <Lock className="w-3 h-3 text-purple-600" />
        <span>Privado do Psicólogo (Sigilo)</span>
      </Badge>
    );
  }

  if (type === 'patient_private') {
    return (
      <Badge variant="neutral" size={size} className="gap-1 font-medium">
        <EyeOff className="w-3 h-3 text-slate-500" />
        <span>Privado do Paciente</span>
      </Badge>
    );
  }

  if (type === 'shared') {
    return (
      <Badge variant="success" size={size} className="gap-1 font-medium">
        <Share2 className="w-3 h-3 text-emerald-600" />
        <span>Compartilhado com Terapeuta</span>
      </Badge>
    );
  }

  return (
    <Badge variant="info" size={size} className="gap-1 font-medium">
      <ShieldCheck className="w-3 h-3 text-sky-600" />
      <span>Prontuário Profissional</span>
    </Badge>
  );
};
