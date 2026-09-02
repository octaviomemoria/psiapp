'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  Phone,
  Send,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientPhone?: string;
  sessionDate?: string;
  sessionTime?: string;
  psychologistName?: string;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Mariana Costa',
  patientPhone = '(11) 98765-4321',
  sessionDate = '2026-08-31',
  sessionTime = '14:00',
  psychologistName = 'Dra. Ana Martins'
}) => {
  const [templateType, setTemplateType] = useState<'24h' | '2h' | 'reschedule'>('24h');
  const [copied, setCopied] = useState(false);

  // Formatar número para wa.me (apenas dígitos)
  const cleanPhone = patientPhone.replace(/\D/g, '');
  const fullInternationalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const meetLink = `https://meet.google.com/psi-ana-${Date.now().toString().slice(-4)}`;
  
  // Link de 1 clique para o paciente salvar no Google Agenda dele
  const calStart = sessionDate.replace(/-/g, '') + 'T' + sessionTime.replace(':', '') + '00';
  const googleCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Sessão de Psicoterapia — ${psychologistName}`)}&dates=${calStart}/${calStart}&details=${encodeURIComponent(`Sessão clínica com ${psychologistName} via PsiApp.`)}&sf=true`;

  const messageTemplates = {
    '24h': `Olá, ${patientName}! 👋\n\nPassando para confirmar nossa sessão de psicoterapia amanhã, dia *${formatDate(sessionDate)}* às *${sessionTime}* com *${psychologistName}*.\n\n📅 *Salvar na sua Agenda do Google / Celular:*\n${googleCalLink}\n\nPor favor, responda com:\n1️⃣ *SIM*, confirmo minha presença!\n2️⃣ *REMARCAR* (caso precise de outro horário com antecedência).\n\nNos vemos amanhã! 🌿`,
    '2h': `Olá, ${patientName}! Tudo bem? 🌿\n\nNossa sessão de psicoterapia começa em *2 horas* (às *${sessionTime}*).\n\n🔗 Link direto para a nossa sala de teleconsulta segura:\n${meetLink}\n\nRecomendo buscar um local tranquilo e fones de ouvido. Até já! 🤍`,
    'reschedule': `Olá, ${patientName}! Tudo bem? 📅\n\nConforme conversamos, estamos reagendando sua sessão de psicoterapia. Por favor, me avise quais dos seguintes dias e horários ficam melhores para você nesta semana.\n\nAbraços,\n${psychologistName}`
  };

  const currentMessage = messageTemplates[templateType];

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(currentMessage);
    const url = `https://wa.me/${fullInternationalPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disparo de Lembrete via WhatsApp"
      description="Envie lembretes automáticos e links de teleconsulta para reduzir faltas (No-Show)."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Destinatário */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">{patientName}</span>
              <span className="text-[11px] text-emerald-800">{patientPhone}</span>
            </div>
          </div>
          <Badge variant="success" size="sm">
            WhatsApp Ativo
          </Badge>
        </div>

        {/* Seleção do Tipo de Lembrete */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTemplateType('24h')}
            className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
              templateType === '24h'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Lembrete 24h
          </button>

          <button
            type="button"
            onClick={() => setTemplateType('2h')}
            className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
              templateType === '2h'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Lembrete 2h (Link)
          </button>

          <button
            type="button"
            onClick={() => setTemplateType('reschedule')}
            className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
              templateType === 'reschedule'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Remarcação
          </button>
        </div>

        {/* Pré-visualização da Mensagem */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Mensagem que será enviada:</span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 hover:underline"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>

          <div className="p-3.5 bg-[#DCF8C6]/60 border border-emerald-200/80 rounded-2xl text-slate-800 whitespace-pre-wrap leading-relaxed font-sans shadow-xs">
            {currentMessage}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Abrir WhatsApp e Enviar
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
