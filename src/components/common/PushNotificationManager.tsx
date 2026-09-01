'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  Calendar
} from 'lucide-react';

interface PushNotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ isOpen, onClose }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dailyReminderTime, setDailyReminderTime] = useState('20:00');
  const [sessionAlertHours, setSessionAlertHours] = useState('2');
  const [isDailyEnabled, setIsDailyEnabled] = useState(true);
  const [isSessionAlertEnabled, setIsSessionAlertEnabled] = useState(true);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const handleSendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('PsiApp — Momento de Cuidado 🌿', {
        body: 'Como foi o seu dia hoje? Reserve 1 minuto para o seu check-in de humor.',
        icon: '/favicon.ico'
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      handleRequestPermission();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notificações & Lembretes Terapêuticos"
      description="Receba avisos pontuais no seu celular ou computador para manter a consistência do acompanhamento."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Status da Permissão do Navegador */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Status de Notificação</span>
              <p className="text-[11px] text-slate-500">
                {permission === 'granted'
                  ? 'Notificações ativadas no dispositivo'
                  : permission === 'denied'
                  ? 'Bloqueadas pelo navegador'
                  : 'Aguardando autorização'}
              </p>
            </div>
          </div>

          {permission === 'granted' ? (
            <Badge variant="success" size="sm">
              Ativo
            </Badge>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRequestPermission}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
            >
              Ativar
            </Button>
          )}
        </div>

        {/* Configuração de Lembrete Diário de Check-in */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-900">Check-in Diário de Humor & Diário</span>
            </div>
            <input
              type="checkbox"
              checked={isDailyEnabled}
              onChange={e => setIsDailyEnabled(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Envia um lembrete gentil no horário escolhido para você registrar seus sentimentos.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium">Horário preferencial:</span>
            <input
              type="time"
              value={dailyReminderTime}
              onChange={e => setDailyReminderTime(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Lembrete de Sessão Agendada */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-slate-900">Avisos de Consultas & Sessões</span>
            </div>
            <input
              type="checkbox"
              checked={isSessionAlertEnabled}
              onChange={e => setIsSessionAlertEnabled(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Avisar com antecedência com o link de teleconsulta ou endereço do consultório.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-slate-600 font-medium">Antecedência:</span>
            <select
              value={sessionAlertHours}
              onChange={e => setSessionAlertHours(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="1">1 hora antes</option>
              <option value="2">2 horas antes</option>
              <option value="24">24 horas antes (1 dia)</option>
            </select>
          </div>
        </div>

        {testSent && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Notificação de teste disparada com sucesso!</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTestNotification}
            className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            Testar Notificação Agora
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          >
            Salvar Preferências
          </Button>
        </div>
      </div>
    </Modal>
  );
};
