'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Clock,
  AlertTriangle,
  PhoneCall,
  CheckCheck,
  User,
  Brain,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';

interface Message {
  id: string;
  senderRole: 'psychologist' | 'patient';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface SecureChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName?: string;
  contactRole?: 'psychologist' | 'patient';
}

const CRISIS_KEYWORDS = [
  'suicid',
  'me matar',
  'acabar com tudo',
  'nao aguento mais',
  'não aguento mais',
  'desespero',
  'sumir',
  'dar um fim',
  'morrer',
];

export const SecureChatModal: React.FC<SecureChatModalProps> = ({
  isOpen,
  onClose,
  contactName,
  contactRole = 'patient',
}) => {
  const { currentRole, currentPsychologist, currentPatient } = usePsi();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      senderRole: 'psychologist',
      senderName: currentPsychologist.profile?.full_name || 'Psicóloga',
      content: 'Olá! Como você está se sentindo após a última sessão? Conseguiu realizar a técnica de respiração?',
      timestamp: 'Hoje às 10:15',
      read: true,
    },
    {
      id: 'm2',
      senderRole: 'patient',
      senderName: currentPatient?.full_name || 'Paciente',
      content: 'Oi, consegui sim! Pratiquei a respiração 4-7-8 ontem à noite quando bateu a ansiedade e ajudou bastante a desacelerar.',
      timestamp: 'Hoje às 11:30',
      read: true,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [crisisDetected, setCrisisDetected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verificação de Horário de Expediente (Seg a Sex das 08h às 19h)
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
  const isBusinessHours = currentDay >= 1 && currentDay <= 5 && currentHour >= 8 && currentHour < 19;

  // Detecção de gatilhos de crise em tempo real
  useEffect(() => {
    const lower = inputMessage.toLowerCase();
    const hasTrigger = CRISIS_KEYWORDS.some(word => lower.includes(word));
    setCrisisDetected(hasTrigger);
  }, [inputMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const senderName =
      currentRole === 'patient'
        ? currentPatient?.full_name || 'Paciente'
        : currentPsychologist.profile?.full_name || 'Psicólogo(a)';

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderRole: currentRole === 'patient' ? 'patient' : 'psychologist',
      senderName,
      content: inputMessage.trim(),
      timestamp: `Hoje às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mensageria Clínica Segura & Sigilo Ético"
      description="Canal direto com criptografia de ponta a ponta e respeito aos limites terapêuticos."
      maxWidth="lg"
    >
      <div className="flex flex-col h-[520px] -mx-6 -my-4">
        {/* Banner de Status de Expediente & Sigilo */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold text-slate-700">Criptografia E2EE Ativa</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">LGPD & CFP 009/2024</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {isBusinessHours ? (
              <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Horário de Atendimento
              </span>
            ) : (
              <span className="text-amber-800 font-medium text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Fora do Expediente (08h - 19h)
              </span>
            )}
          </div>
        </div>

        {/* Alerta de Fora do Horário */}
        {!isBusinessHours && currentRole === 'patient' && (
          <div className="bg-amber-50/80 border-b border-amber-100 px-6 py-2 text-xs text-amber-800 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong>Aviso aos limites da terapia:</strong> A terapeuta responde mensagens em dias úteis das 08h às 19h. Mensagens enviadas agora serão lidas no próximo período de expediente.
            </p>
          </div>
        )}

        {/* Alerta Instantâneo de Crise Emocional */}
        {crisisDetected && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 text-xs text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-800 text-xs">Precisa de acolhimento imediato?</p>
                <p className="text-[11px] text-rose-700">Se você está em sofrimento agudo, ligue gratuitamente para:</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <a
                href="tel:188"
                className="inline-flex items-center px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                <PhoneCall className="w-3 h-3 mr-1" />
                CVV 188 (24h)
              </a>
              <a
                href="tel:192"
                className="inline-flex items-center px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition border border-rose-300"
              >
                SAMU 192
              </a>
            </div>
          </div>
        )}

        {/* Área de Mensagens com Rolagem */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50/50">
          <div className="text-center my-2">
            <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase font-mono">
              Início do registro seguro
            </span>
          </div>

          {messages.map(msg => {
            const isMe =
              (currentRole === 'patient' && msg.senderRole === 'patient') ||
              (currentRole !== 'patient' && msg.senderRole === 'psychologist');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">
                  {msg.senderName}
                </span>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                    isMe
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-teal-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-teal-200" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              currentRole === 'patient'
                ? 'Escreva para sua psicóloga...'
                : 'Escreva para o paciente...'
            }
            rows={1}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden resize-none bg-slate-50/50"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="h-10 px-4 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
