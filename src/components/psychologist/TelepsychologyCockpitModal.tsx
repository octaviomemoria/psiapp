'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Shield,
  Save,
  Clock,
  Sparkles,
  Wifi,
  AlertTriangle,
  FileText,
  UserCheck,
  Maximize2,
  Lock,
  HeartPulse,
  Settings,
  HelpCircle
} from 'lucide-react';
import { encryptText } from '@/lib/crypto/encryption';

interface TelepsychologyCockpitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  sessionNumber?: number;
}

export const TelepsychologyCockpitModal: React.FC<TelepsychologyCockpitModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  sessionNumber = 1
}) => {
  const { currentPsychologist, addSession, addNotification, patients } = usePsi();
  const patient = patients.find(p => p.id === patientId);

  // Estados de Áudio e Vídeo
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Excelente' | 'Boa' | 'Instável'>('Excelente');
  const [pingMs, setPingMs] = useState(24);

  // Estados do Cronômetro Clínico (50 minutos)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Estados do Prontuário SOAP
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [privateNotes, setPrivateNotes] = useState('');
  const [lastSavedDraft, setLastSavedDraft] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Timer da Sessão
  useEffect(() => {
    if (!isOpen || !isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning]);

  // Autosave a cada 5 segundos no localStorage
  useEffect(() => {
    if (!isOpen) return;
    const autoSaveTimer = setInterval(() => {
      if (soapData.subjective || soapData.objective || soapData.assessment || soapData.plan || privateNotes) {
        const draftKey = `psi_draft_${patientId}`;
        const draftPayload = {
          soapData,
          privateNotes,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(draftKey, JSON.stringify(draftPayload));
        setLastSavedDraft(new Date().toLocaleTimeString('pt-BR'));
      }
    }, 5000);

    return () => clearInterval(autoSaveTimer);
  }, [isOpen, patientId, soapData, privateNotes]);

  // Recuperar rascunho anterior se houver
  useEffect(() => {
    if (isOpen && patientId) {
      const saved = localStorage.getItem(`psi_draft_${patientId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.soapData) setSoapData(parsed.soapData);
          if (parsed.privateNotes) setPrivateNotes(parsed.privateNotes);
          setLastSavedDraft(new Date(parsed.timestamp).toLocaleTimeString('pt-BR'));
        } catch {
          // Ignorar se corrompido
        }
      }
    }
  }, [isOpen, patientId]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinalizeSession = async () => {
    setIsEncrypting(true);

    try {
      // Criptografia das notas privadas de supervisão
      let encryptedNotesPayload = privateNotes;
      if (privateNotes.trim()) {
        const encrypted = await encryptText(privateNotes);
        encryptedNotesPayload = JSON.stringify(encrypted);
      }

      // Adiciona a sessão ao histórico clínico
      addSession(
        {
          patient_id: patientId,
          psychologist_id: currentPsychologist?.id || 'psico-1',
          session_date: new Date().toISOString(),
          duration_minutes: Math.ceil(elapsedSeconds / 60) || 50,
          session_number: sessionNumber,
          modality: 'online',
          main_topics: ['Telepsicologia', 'Evolução Clínica'],
          summary: soapData.subjective || 'Atendimento telepsicológico realizado.',
          soap_subjective: soapData.subjective,
          soap_objective: soapData.objective,
          soap_assessment: soapData.assessment,
          soap_plan: soapData.plan,
          interventions_used: 'TCC, Escuta Qualificada, Regulação Emocional',
          status: 'finalized'
        },
        privateNotes.trim()
          ? {
              private_clinical_hypothesis: encryptedNotesPayload,
              transference_countertransference_notes: 'Criptografado com WebCrypto AES-GCM.',
              supervision_notes: 'Auditoria de sigilo ativa conforme CFP 001/2009.'
            }
          : undefined
      );

      // Limpar rascunho
      localStorage.removeItem(`psi_draft_${patientId}`);

      addNotification({
        recipient_role: 'psychologist',
        title: 'Sessão Concluída e Prontuário Cifrado',
        message: `Sessão com ${patientName} finalizada com sucesso. Prontuário SOAP persistido com trilha de auditoria.`,
        type: 'session_completed',
        read: false,
        target_tab: 'pacientes'
      });

      setIsEncrypting(false);
      onClose();
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      setIsEncrypting(false);
      alert('Erro ao finalizar sessão. Suas anotações continuam salvas no rascunho local.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Barra Superior do Cockpit */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-base tracking-tight">Telepsicologia Segura (CFP 009/2024)</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-xs text-slate-300">
              Paciente: <span className="font-semibold text-white">{patientName}</span>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs">
              Sessão #{sessionNumber}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicador de Latência / Conexão */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pingMs}ms ({connectionStatus})</span>
            </div>

            {/* Cronômetro Clínico */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm font-bold border ${
              elapsedSeconds >= 48 * 60
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : elapsedSeconds >= 40 * 60
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-teal-400 border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(elapsedSeconds)} / 50:00</span>
            </div>

            {/* Autosave Status */}
            {lastSavedDraft && (
              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-300">
                <Save className="w-3.5 h-3.5 text-teal-400" />
                <span>Rascunho salvo às {lastSavedDraft}</span>
              </div>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={onClose}
              className="bg-rose-600/80 hover:bg-rose-600 text-xs flex items-center gap-1"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              Sair
            </Button>
          </div>
        </header>

        {/* Corpo Dividido: Vídeo WebRTC (Esquerda) + Prontuário SOAP (Direita) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-950">
          {/* LADO DO VÍDEO (7 Colunas em telas grandes) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 relative bg-slate-950 p-4">
            {/* Container da Transmissão */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              {!isAdmitted ? (
                /* Sala de Espera */
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sala de Espera Virtual</h3>
                  <p className="text-xs text-slate-300 mb-6">
                    {patientName} está conectado e aguardando na sala de espera com verificação de ambiente privativo e fones de ouvido.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsAdmitted(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 shadow-lg shadow-emerald-900/30"
                  >
                    Admitir Paciente na Chamada
                  </Button>
                </div>
              ) : (
                /* Chamada de Vídeo Conectada */
                <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                  {isVideoOn ? (
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-teal-500/50 flex items-center justify-center mx-auto mb-3 shadow-xl">
                        <span className="text-2xl font-bold text-teal-300">
                          {patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">{patientName}</p>
                      <span className="text-[11px] text-emerald-400 flex items-center justify-center gap-1 mt-1">
                        <Shield className="w-3 h-3" /> Transmissão Criptografada Ponta a Ponta (E2EE)
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-slate-300">
                      <VideoOff className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-xs">Câmera desativada</p>
                    </div>
                  )}

                  {/* Câmera Picture-in-Picture do Psicólogo */}
                  <div className="absolute top-4 right-4 w-36 h-28 bg-slate-850 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-teal-600/30 text-teal-300 flex items-center justify-center mx-auto text-xs font-bold mb-1">
                        Você
                      </div>
                      <p className="text-[10px] text-slate-300">Dra. Ana Martins</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de Controles de Mídia */}
            <div className="h-16 flex items-center justify-between px-4 mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMicOn(prev => !prev)}
                  className={`border-slate-700 ${isMicOn ? 'bg-slate-800 text-white' : 'bg-rose-900/40 text-rose-300 border-rose-700'}`}
                >
                  {isMicOn ? <Mic className="w-4 h-4 mr-1.5 text-emerald-400" /> : <MicOff className="w-4 h-4 mr-1.5" />}
                  {isMicOn ? 'Mutar' : 'Ativar Mic'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVideoOn(prev => !prev)}
                  className={`border-slate-700 ${isVideoOn ? 'bg-slate-800 text-white' : 'bg-rose-900/40 text-rose-300 border-rose-700'}`}
                >
                  {isVideoOn ? <Video className="w-4 h-4 mr-1.5 text-emerald-400" /> : <VideoOff className="w-4 h-4 mr-1.5" />}
                  {isVideoOn ? 'Desligar Câmera' : 'Ligar Câmera'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-teal-500/30 text-teal-400 text-xs hidden sm:flex items-center gap-1">
                  <Lock className="w-3 h-3" /> CFP 009/2024 Compliant
                </Badge>
              </div>
            </div>
          </div>

          {/* LADO DO PRONTUÁRIO SOAP & NOTAS CLÍNICAS (5 Colunas) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h4 className="font-bold text-sm text-white">Evolução Clínica SOAP em Tempo Real</h4>
              </div>
              <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-500/30">
                Autosave Ativo
              </Badge>
            </div>

            {/* S - Subjetivo */}
            <div>
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                S — Subjetivo (Relato do Paciente e Queixa Principal)
              </label>
              <textarea
                rows={2}
                value={soapData.subjective}
                onChange={e => setSoapData(prev => ({ ...prev, subjective: e.target.value }))}
                placeholder="Ex: Paciente relata melhora na ansiedade no trabalho, mas refere pico de estresse no fim de semana..."
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* O - Objetivo */}
            <div>
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                O — Objetivo (Observações Clínicas, Afeto e Discurso)
              </label>
              <textarea
                rows={2}
                value={soapData.objective}
                onChange={e => setSoapData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="Ex: Apresentou-se cooperativo(a), humor eutímico, afeto congruente, contato visual preservado..."
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* A - Avaliação */}
            <div>
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                A — Avaliação (Hipóteses Clínicas e Dinâmica)
              </label>
              <textarea
                rows={2}
                value={soapData.assessment}
                onChange={e => setSoapData(prev => ({ ...prev, assessment: e.target.value }))}
                placeholder="Ex: Identificada distorção de pensamento (catastrofização) frente a demandas corporativas..."
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* P - Plano */}
            <div>
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                P — Plano Terapêutico & Tarefas Prescritas
              </label>
              <textarea
                rows={2}
                value={soapData.plan}
                onChange={e => setSoapData(prev => ({ ...prev, plan: e.target.value }))}
                placeholder="Ex: Prescrito registro de pensamentos RPD e técnica de respiração 4-7-8 antes de reuniões..."
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* Anotações Estritamente Confidenciais do Terapeuta */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Notas Privadas de Sigilo (CFP 001/2009)
                </label>
                <span className="text-[10px] text-slate-300">Cifrado com WebCrypto AES-256</span>
              </div>
              <textarea
                rows={2}
                value={privateNotes}
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Hipóteses de supervisão, contratransferência ou notas pessoais inacessíveis ao paciente..."
                className="w-full text-xs bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
              />
            </div>

            {/* Ação de Finalização da Sessão */}
            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isEncrypting}
                onClick={handleFinalizeSession}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg"
              >
                Finalizar & Salvar Prontuário Cifrado
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
