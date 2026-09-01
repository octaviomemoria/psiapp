'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Patient, TherapySession, SessionModality } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Lock,
  FileText,
  Brain,
  Activity,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Save,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { AIService } from '@/lib/ai/ai-service';

interface LiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSessionFinished?: () => void;
}

export const LiveSessionModal: React.FC<LiveSessionModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSessionFinished
}) => {
  const {
    currentPsychologist,
    addSession,
    addCognitiveDiagram,
    addVoiceAnchor,
    addNotification
  } = usePsi();

  // Cronômetro Clínico (50 minutos padrão)
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'soap' | 'diagram' | 'suds' | 'voice' | 'private'>('soap');

  // Dados SOAP
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [homework, setHomework] = useState('');
  const [modality, setModality] = useState<SessionModality>('online');

  // Notas Privadas do Psicólogo
  const [privateHypothesis, setPrivateHypothesis] = useState('');
  const [supervisionNotes, setSupervisionNotes] = useState('');

  // Quadro de Conceituação Cognitiva (TCC)
  const [situation, setSituation] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [emotion, setEmotion] = useState('Ansiedade');
  const [emotionIntensity, setEmotionIntensity] = useState(80);
  const [physiologicalReaction, setPhysiologicalReaction] = useState('');
  const [behavior, setBehavior] = useState('');
  const [alternativeThought, setAlternativeThought] = useState('');
  const [outcomeIntensity, setOutcomeIntensity] = useState(40);

  // Termômetro SUDS
  const [sudsValue, setSudsValue] = useState(50);
  const [sudsNotes, setSudsNotes] = useState('');

  // Gravação de Âncora de Voz
  const [isRecording, setIsRecording] = useState(false);
  const [anchorTitle, setAnchorTitle] = useState('Âncora de Regulação e Desfusão');
  const [anchorTranscript, setAnchorTranscript] = useState('');
  const [isVoiceSaved, setIsVoiceSaved] = useState(false);
  const [isDiagramSaved, setIsDiagramSaved] = useState(false);

  // Ditado de Áudio / Assistente IA
  const [isDictating, setIsDictating] = useState(false);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);

  // Alertas de Tempo
  const hasAlerted40 = useRef(false);
  const hasAlerted48 = useRef(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;
          // Alerta aos 40 minutos (faltando 10 min)
          if (next === 10 * 60 && !hasAlerted40.current) {
            hasAlerted40.current = true;
          }
          // Alerta aos 48 minutos (faltando 2 min)
          if (next === 2 * 60 && !hasAlerted48.current) {
            hasAlerted48.current = true;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(50 * 60);
      setIsTimerRunning(true);
      hasAlerted40.current = false;
      hasAlerted48.current = false;
    }
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsLeft(50 * 60);
  };

  const handleSaveCognitiveDiagram = () => {
    if (!situation || !automaticThought) return;
    addCognitiveDiagram({
      patient_id: patient.id,
      psychologist_id: currentPsychologist.id,
      situation,
      automatic_thought: automaticThought,
      emotions: [emotion],
      emotion_intensity: emotionIntensity,
      physiological_reaction: physiologicalReaction,
      behavior,
      alternative_thought: alternativeThought,
      outcome_emotion_intensity: outcomeIntensity
    });
    setIsDiagramSaved(true);
    setTimeout(() => setIsDiagramSaved(false), 3000);
  };

  const handleSaveVoiceAnchor = () => {
    if (!anchorTranscript) return;
    addVoiceAnchor({
      patient_id: patient.id,
      psychologist_id: currentPsychologist.id,
      title: anchorTitle,
      category: 'Regulação Terapêutica',
      duration_seconds: 60,
      transcript: anchorTranscript
    });
    setIsVoiceSaved(true);
    setTimeout(() => setIsVoiceSaved(false), 3000);
  };

  const handleGenerateAiSoapDraft = async () => {
    setIsGeneratingAiDraft(true);
    try {
      const clinicalNotes = `Situação trabalhada: ${situation || 'Não especificada'}. Pensamento automático: "${automaticThought || 'Não relatado'}". Emoção predominante: ${emotion} (${emotionIntensity}/10). Reação fisiológica: ${physiologicalReaction}. Comportamento: ${behavior}. Reestruturação/Pensamento alternativo: ${alternativeThought}.`;
      
      const soap = await AIService.generateSOAPDraft(clinicalNotes, patient.full_name, currentPsychologist.approach || 'TCC');
      
      setSubjective(soap.subjective);
      setObjective(soap.objective);
      setAssessment(soap.assessment);
      setPlan(soap.plan);
      setHomework('Realizar o exercício de RPD (Registro de Pensamentos Disfuncionais) pelo menos 2x na semana.');
    } catch (err) {
      console.error('Erro ao gerar SOAP com IA:', err);
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleFinishSession = () => {
    const elapsedMinutes = Math.max(1, Math.round((50 * 60 - secondsLeft) / 60));
    
    // Salvar sessão oficial
    addSession(
      {
        psychologist_id: currentPsychologist.id,
        patient_id: patient.id,
        session_number: 1,
        session_date: new Date().toISOString(),
        duration_minutes: elapsedMinutes,
        modality,
        main_topics: [situation || 'Acompanhamento Clínico', emotion],
        summary: subjective ? `${subjective}\n\n${assessment}` : 'Sessão clínica realizada.',
        soap_subjective: subjective,
        soap_objective: objective,
        soap_assessment: assessment,
        soap_plan: plan,
        homework_assigned: homework,
        status: 'finalized',
      },
      privateHypothesis || supervisionNotes ? {
        private_clinical_hypothesis: privateHypothesis,
        supervision_notes: supervisionNotes,
      } : undefined
    );

    addNotification({
      recipient_role: 'psychologist',
      title: 'Sessão Finalizada com Sucesso',
      message: `Prontuário da sessão com ${patient.full_name} foi salvo e registrado com sigilo profissional.`,
      type: 'feedback_received',
      read: false,
    });

    if (onSessionFinished) onSessionFinished();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header com Cronômetro Clínico & Identificação */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              {patient.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Sessão ao Vivo — {patient.full_name}
                </h3>
                <Badge variant="success">Em Atendimento</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Psicóloga: {currentPsychologist.profile?.display_name || 'Dra. Ana Martins'} ({currentPsychologist.crp_number}/{currentPsychologist.crp_state})
              </p>
            </div>
          </div>

          {/* Cronômetro Clínico */}
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-md border border-slate-800">
            <Clock className={`w-5 h-5 ${secondsLeft <= 10 * 60 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="font-mono text-xl font-bold tracking-wider">
              {formatTime(secondsLeft)}
            </span>
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
              <button
                onClick={handleToggleTimer}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                title={isTimerRunning ? 'Pausar' : 'Iniciar'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Reiniciar tempo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Alerta Visual de Encerramento aos 40min e 48min */}
        {secondsLeft <= 10 * 60 && secondsLeft > 2 * 60 && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>Aviso Clínico (40 min):</strong> Faltam 10 minutos para o término. Bom momento para iniciar o debriefing e síntese final com o paciente.</span>
          </div>
        )}
        {secondsLeft <= 2 * 60 && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 px-4 py-2 rounded-xl flex items-center gap-2 text-xs animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>Aviso Clínico (48 min):</strong> Faltam 2 minutos. Finalize as intervenções e alinhe a próxima consulta.</span>
          </div>
        )}

        {/* Navegação de Ferramentas da Sessão */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-2 overflow-x-auto pb-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('soap')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'soap'
                ? 'bg-emerald-500/10 text-emerald-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Evolução SOAP
          </button>
          <button
            onClick={() => setActiveTab('diagram')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'diagram'
                ? 'bg-emerald-500/10 text-emerald-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            Quadro de Conceituação TCC
          </button>
          <button
            onClick={() => setActiveTab('suds')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'suds'
                ? 'bg-emerald-500/10 text-emerald-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Termômetro SUDS (0-100)
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-emerald-500/10 text-emerald-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            Âncora de Voz
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'private'
                ? 'bg-purple-500/10 text-purple-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            Notas Privadas (Sigilo)
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* ABA 1: SOAP */}
          {activeTab === 'soap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Copiloto de IA: Gere uma minuta estruturada baseada no relato clínico.</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAiSoapDraft}
                  disabled={isGeneratingAiDraft}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {isGeneratingAiDraft ? 'Gerando Minuta...' : 'Gerar Rascunho IA'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    [S] Subjetivo (Relato do Paciente)
                  </label>
                  <textarea
                    rows={4}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    placeholder="Queixas trazidas, acontecimentos da semana, sentimentos verbalizados..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    [O] Objetivo (Observações do Terapeuta)
                  </label>
                  <textarea
                    rows={4}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Comportamento não-verbal, postura, tom de voz, congruência afetiva..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    [A] Análise / Avaliação Clínica
                  </label>
                  <textarea
                    rows={4}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Conceituação diagnóstica, conexões cognitivas, resposta às intervenções..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    [P] Plano Terapêutico & Tarefas de Casa
                  </label>
                  <textarea
                    rows={4}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Próximos passos, experimentos comportamentais e tarefas combinadas..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Tarefa Prescrita para o Paciente ("Entre Sessões")
                </label>
                <input
                  type="text"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="Ex: Preencher 2x o formulário de RPD e praticar a respiração 4-7-8."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* ABA 2: QUADRO DE CONCEITUAÇÃO COGNITIVA */}
          {activeTab === 'diagram' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-500" />
                    Quadro Interativo de Conceituação Cognitiva (TCC)
                  </h4>
                  <p className="text-xs text-slate-500">Mapeie ao vivo com o paciente a cadeia Situação ➔ Pensamento ➔ Emoção ➔ Comportamento</p>
                </div>
                <Button size="sm" onClick={handleSaveCognitiveDiagram} className={`text-xs ${isDiagramSaved ? 'bg-emerald-600 text-white' : ''}`}>
                  {isDiagramSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Diagrama Salvo!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1" /> Salvar no Prontuário
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    1. Situação Ativadora (Gatilho)
                  </label>
                  <input
                    type="text"
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="O que aconteceu? Onde, com quem, quando?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    2. Pensamento Automático
                  </label>
                  <input
                    type="text"
                    value={automaticThought}
                    onChange={(e) => setAutomaticThought(e.target.value)}
                    placeholder="O que passou pela sua cabeça naquele exato instante?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    3. Emoção Predominante & Intensidade ({emotionIntensity}%)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                      <option value="Ansiedade">Ansiedade</option>
                      <option value="Medo">Medo</option>
                      <option value="Tristeza">Tristeza</option>
                      <option value="Raiva">Raiva</option>
                      <option value="Vergonha">Vergonha</option>
                      <option value="Culpa">Culpa</option>
                    </select>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={emotionIntensity}
                      onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    4. Reação Fisiológica / Corporal
                  </label>
                  <input
                    type="text"
                    value={physiologicalReaction}
                    onChange={(e) => setPhysiologicalReaction(e.target.value)}
                    placeholder="Taquicardia, aperto no peito, tremor, falta de ar..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    5. Comportamento / Reação
                  </label>
                  <input
                    type="text"
                    value={behavior}
                    onChange={(e) => setBehavior(e.target.value)}
                    placeholder="Evitação, fuga, isolamento, paralisia..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6. Pensamento Alternativo / Reestruturado
                  </label>
                  <input
                    type="text"
                    value={alternativeThought}
                    onChange={(e) => setAlternativeThought(e.target.value)}
                    placeholder="Qual uma forma mais realista e equilibrada de enxergar isso?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: TERMÔMETRO SUDS */}
          {activeTab === 'suds' && (
            <div className="space-y-6 text-center py-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Escala Subjetiva de Unidades de Desconforto (SUDS 0–100)
              </h4>
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                Avalie o nível de ativação emocional e ansiedade do paciente antes, durante ou após uma exposição/intervenção.
              </p>

              <div className="max-w-md mx-auto space-y-4">
                <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {sudsValue} / 100
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={sudsValue}
                  onChange={(e) => setSudsValue(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-xs text-slate-400">
                  <span>0 - Calma Absoluta</span>
                  <span>50 - Desconforto Médio</span>
                  <span>100 - Pânico / Desespero</span>
                </div>

                <textarea
                  rows={2}
                  value={sudsNotes}
                  onChange={(e) => setSudsNotes(e.target.value)}
                  placeholder="Anotações contextuais (ex: 'Durante a rememoração do evento estressor')..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          {/* ABA 4: ÂNCORA DE VOZ */}
          {activeTab === 'voice' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Gravação de Âncora Terapêutica de Voz
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Grave ou digite uma instrução de voz personalizada para o paciente ouvir quando sentir ansiedade durante a semana.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Título do Lembrete de Voz
                  </label>
                  <input
                    type="text"
                    value={anchorTitle}
                    onChange={(e) => setAnchorTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mensagem / Transcrição da Âncora Terapêutica
                  </label>
                  <textarea
                    rows={4}
                    value={anchorTranscript}
                    onChange={(e) => setAnchorTranscript(e.target.value)}
                    placeholder="Ex: 'Mariana, respire fundo 3 vezes. Lembre-se que sensações corporais não são perigos reais...'"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Ficará disponível imediatamente na "Caixa de Ferramentas" do paciente.
                  </span>
                  <Button size="sm" onClick={handleSaveVoiceAnchor} className="text-xs">
                    {isVoiceSaved ? (
                      <span className="flex items-center gap-1 text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enviado ao Paciente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" /> Salvar Âncora de Voz
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 5: NOTAS PRIVADAS */}
          {activeTab === 'private' && (
            <div className="space-y-4 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-bold text-sm">
                  Segregação Rigorosa de Sigilo Profissional (CFP)
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Estas notas <strong>NUNCA</strong> são compartilhadas com o paciente ou exibidas no aplicativo dele.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hipóteses Clínicas & Transferência / Contratransferência
                  </label>
                  <textarea
                    rows={4}
                    value={privateHypothesis}
                    onChange={(e) => setPrivateHypothesis(e.target.value)}
                    placeholder="Anotações estritamente confessionais do terapeuta, intuições clínicas..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pontos para Discutir em Supervisão Clínica
                  </label>
                  <textarea
                    rows={3}
                    value={supervisionNotes}
                    onChange={(e) => setSupervisionNotes(e.target.value)}
                    placeholder="Dúvidas técnicas, impasses terapêuticos ou manejo de aliança..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} size="sm">
            Minimizar / Cancelar
          </Button>

          <Button
            onClick={handleFinishSession}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar Sessão & Registrar no Prontuário
          </Button>
        </div>
      </div>
    </Modal>
  );
};
