'use client';

import React, { useState, useEffect } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { TherapySession, SessionModality } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';
import { Lock, FileText, CheckCircle, Sparkles, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { toLocalDateTimeInput } from '@/lib/utils';
import { loadDraft, saveDraft, clearDraft } from '@/lib/utils/draft';

interface SessionFormDraft {
  selectedPatientId: string;
  sessionDate: string;
  durationMinutes: number;
  modality: SessionModality;
  mainTopics: string;
  summary: string;
  interventionsUsed: string;
  evolutionObserved: string;
  homeworkAssigned: string;
  nextSessionPlan: string;
  privateClinicalHypothesis: string;
  supervisionNotes: string;
  transferenceNotes: string;
  riskAssessmentNotes: string;
}

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  sessionToEdit?: TherapySession | null;
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  patientId,
  sessionToEdit,
}) => {
  const { patients, currentPsychologist, addSession, updateSession, sessions, addNotification } = usePsi();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || patients[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(toLocalDateTimeInput());
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [modality, setModality] = useState<SessionModality>('online');
  const [mainTopics, setMainTopics] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [interventionsUsed, setInterventionsUsed] = useState<string>('');
  const [evolutionObserved, setEvolutionObserved] = useState<string>('');
  const [homeworkAssigned, setHomeworkAssigned] = useState<string>('');
  const [nextSessionPlan, setNextSessionPlan] = useState<string>('');

  // Anotações Privadas do Psicólogo
  const [privateClinicalHypothesis, setPrivateClinicalHypothesis] = useState<string>('');
  const [supervisionNotes, setSupervisionNotes] = useState<string>('');
  const [transferenceNotes, setTransferenceNotes] = useState<string>('');
  const [riskAssessmentNotes, setRiskAssessmentNotes] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const draftKey = `psi_draft_form_${sessionToEdit?.id || 'new'}`;

  // Só reinicializa o formulário ao ABRIR ou trocar de sessão. Antes, dependia de `patients`/`sessions`,
  // então qualquer atualização em tempo real (ex.: paciente respondendo um exercício) apagava o texto digitado.
  const latestPatientsRef = React.useRef(patients);
  latestPatientsRef.current = patients;

  useEffect(() => {
    if (!isOpen) {
      setDraftReady(false);
      return;
    }
    setSaveError(null);
    setDraftNotice(null);

    if (!sessionToEdit) {
      const draft = loadDraft<SessionFormDraft>(draftKey);
      if (draft) {
        const d = draft.data;
        setSelectedPatientId(d.selectedPatientId || patientId || latestPatientsRef.current[0]?.id || '');
        setSessionDate(d.sessionDate || toLocalDateTimeInput());
        setDurationMinutes(d.durationMinutes || 50);
        setModality(d.modality || 'online');
        setMainTopics(d.mainTopics || '');
        setSummary(d.summary || '');
        setInterventionsUsed(d.interventionsUsed || '');
        setEvolutionObserved(d.evolutionObserved || '');
        setHomeworkAssigned(d.homeworkAssigned || '');
        setNextSessionPlan(d.nextSessionPlan || '');
        setPrivateClinicalHypothesis(d.privateClinicalHypothesis || '');
        setSupervisionNotes(d.supervisionNotes || '');
        setTransferenceNotes(d.transferenceNotes || '');
        setRiskAssessmentNotes(d.riskAssessmentNotes || '');
        setDraftNotice(`Rascunho recuperado (salvo em ${new Date(draft.savedAt).toLocaleString('pt-BR')}).`);
        setDraftReady(true);
        return;
      }
    }

    if (sessionToEdit) {
      setSelectedPatientId(sessionToEdit.patient_id);
      setSessionDate(toLocalDateTimeInput(sessionToEdit.session_date));
      setDurationMinutes(sessionToEdit.duration_minutes);
      setModality(sessionToEdit.modality);
      setMainTopics(sessionToEdit.main_topics?.join(', ') || '');
      setSummary(sessionToEdit.summary || '');
      setInterventionsUsed(sessionToEdit.interventions_used || '');
      setEvolutionObserved(sessionToEdit.evolution_observed || '');
      setHomeworkAssigned(sessionToEdit.homework_assigned || '');
      setNextSessionPlan(sessionToEdit.next_session_plan || '');

      if (sessionToEdit.private_notes) {
        setPrivateClinicalHypothesis(sessionToEdit.private_notes.private_clinical_hypothesis || '');
        setSupervisionNotes(sessionToEdit.private_notes.supervision_notes || '');
        setTransferenceNotes(sessionToEdit.private_notes.transference_countertransference_notes || '');
        setRiskAssessmentNotes(sessionToEdit.private_notes.risk_assessment_notes || '');
      }
    } else {
      setSelectedPatientId(patientId || latestPatientsRef.current[0]?.id || '');
      setSessionDate(toLocalDateTimeInput());
      setDurationMinutes(50);
      setModality('online');
      setMainTopics('');
      setSummary('');
      setInterventionsUsed('');
      setEvolutionObserved('');
      setHomeworkAssigned('');
      setNextSessionPlan('');
      setPrivateClinicalHypothesis('');
      setSupervisionNotes('');
      setTransferenceNotes('');
      setRiskAssessmentNotes('');
    }
    setDraftReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToEdit?.id, patientId, isOpen]);

  // Autosave do rascunho (apenas para novos registros)
  useEffect(() => {
    if (!isOpen || !draftReady || sessionToEdit) return;
    const hasContent = [summary, mainTopics, interventionsUsed, evolutionObserved, homeworkAssigned, nextSessionPlan,
      privateClinicalHypothesis, supervisionNotes, transferenceNotes, riskAssessmentNotes].some(v => v.trim().length > 0);
    if (!hasContent) {
      clearDraft(draftKey);
      return;
    }
    saveDraft<SessionFormDraft>(draftKey, {
      selectedPatientId, sessionDate, durationMinutes, modality, mainTopics, summary, interventionsUsed,
      evolutionObserved, homeworkAssigned, nextSessionPlan, privateClinicalHypothesis, supervisionNotes,
      transferenceNotes, riskAssessmentNotes,
    });
  }, [isOpen, draftReady, sessionToEdit, draftKey, selectedPatientId, sessionDate, durationMinutes, modality, mainTopics,
    summary, interventionsUsed, evolutionObserved, homeworkAssigned, nextSessionPlan, privateClinicalHypothesis,
    supervisionNotes, transferenceNotes, riskAssessmentNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!selectedPatientId) {
      setSaveError('Selecione o paciente.');
      return;
    }
    if (!summary.trim()) {
      setSaveError('O resumo da sessão é obrigatório.');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    const patientSessions = sessions.filter(s => s.patient_id === selectedPatientId);
    const sessionNumber = sessionToEdit
      ? sessionToEdit.session_number
      : Math.max(0, ...patientSessions.map(s => s.session_number || 0)) + 1;

    const topicsArray = mainTopics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const sessionData = {
      psychologist_id: currentPsychologist.id,
      patient_id: selectedPatientId,
      session_number: sessionNumber,
      session_date: new Date(sessionDate).toISOString(),
      duration_minutes: Number(durationMinutes),
      modality,
      main_topics: topicsArray,
      summary,
      interventions_used: interventionsUsed,
      evolution_observed: evolutionObserved,
      homework_assigned: homeworkAssigned,
      next_session_plan: nextSessionPlan,
      status: 'finalized' as const,
    };

    const privateNotesData = {
      private_clinical_hypothesis: privateClinicalHypothesis,
      supervision_notes: supervisionNotes,
      transference_countertransference_notes: transferenceNotes,
      risk_assessment_notes: riskAssessmentNotes,
    };

    setIsSaving(true);
    setSaveError(null);

    let result;
    try {
      result = sessionToEdit
        ? await updateSession(sessionToEdit.id, sessionData, privateNotesData)
        : await addSession(sessionData, privateNotesData);
    } catch (err: any) {
      result = { ok: false, error: `Erro inesperado ao gravar: ${err?.message || err}` };
    }
    setIsSaving(false);

    if (!result.ok) {
      // O formulário permanece aberto com todo o texto; nada foi descartado.
      setSaveError(result.error || 'Não foi possível gravar o registro. Tente novamente.');
      return;
    }

    if (sessionToEdit) {
      addNotification({
        recipient_role: 'psychologist',
        title: 'Sessão Atualizada com Sucesso',
        message: `O registro da sessão com ${patient?.full_name || 'o paciente'} foi atualizado no prontuário.`,
        type: 'session_scheduled',
        read: false,
      });
    } else {
      clearDraft(draftKey);
      addNotification({
        recipient_role: 'psychologist',
        title: 'Nova Sessão Registrada',
        message: `Sessão #${sessionNumber} com ${patient?.full_name || 'o paciente'} foi registrada e arquivada com sigilo.`,
        type: 'session_scheduled',
        read: false,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionToEdit ? 'Editar Registro de Sessão' : 'Registrar Nova Sessão Clínica'}
      description="Documentação do atendimento, evolução observada e anotações privativas."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Dados Gerais da Sessão */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paciente *
            </label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              disabled={Boolean(patientId || sessionToEdit)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.status === 'active' ? 'Ativo' : 'Inativo'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data e Horário *
            </label>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duração (minutos)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              min="15"
              max="180"
              step="5"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Modalidade
            </label>
            <select
              value={modality}
              onChange={e => setModality(e.target.value as SessionModality)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="online">Online (TDIC)</option>
              <option value="presencial">Presencial no Consultório</option>
              <option value="domiciliar">Domiciliar</option>
            </select>
          </div>
        </div>

        {/* Bloco 2: Registro Clínico Geral */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Registro do Atendimento
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Principais Assuntos Abordados (separados por vírgula)
            </label>
            <input
              type="text"
              value={mainTopics}
              onChange={e => setMainTopics(e.target.value)}
              placeholder="Ex: Ansiedade de desempenho, Gatilhos no trabalho, Técnicas de respiração..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resumo da Sessão *
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={3}
              placeholder="Descreva os acontecimentos relevantes, demandas trazidas pelo paciente e o direcionamento da consulta..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intervenções e Técnicas Utilizadas
              </label>
              <textarea
                value={interventionsUsed}
                onChange={e => setInterventionsUsed(e.target.value)}
                rows={2}
                placeholder="Ex: Psicoeducação, Reestruturação cognitiva, Role-play..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evolução Terapêutica Observada
              </label>
              <textarea
                value={evolutionObserved}
                onChange={e => setEvolutionObserved(e.target.value)}
                rows={2}
                placeholder="Progresso em relação às sessões anteriores, postura e engajamento..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Atividades / Exercícios Recomendados para Casa
              </label>
              <input
                type="text"
                value={homeworkAssigned}
                onChange={e => setHomeworkAssigned(e.target.value)}
                placeholder="Ex: RPD em momentos de ansiedade, Respiração 4-7-8 diária..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Planejamento para a Próxima Sessão
              </label>
              <input
                type="text"
                value={nextSessionPlan}
                onChange={e => setNextSessionPlan(e.target.value)}
                placeholder="Ex: Revisar tarefas de casa, aprofundar assertividade..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Anotações Privadas do Psicólogo (Sigilo Rigoroso) */}
        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-700" />
              <h4 className="text-sm font-bold text-purple-900">
                Anotações Privadas do Psicólogo (Sigilo Profissional)
              </h4>
            </div>
            <PrivacyBadge type="psychologist_private" size="sm" />
          </div>
          <p className="text-xs text-purple-800/80">
            Estas informações são de uso estritamente privativo do terapeuta (hipóteses diagnósticas em formulação, notas para supervisão clínica e contratransferência). Elas <strong>nunca</strong> são compartilhadas ou exibidas ao paciente.
          </p>

          <div>
            <label className="block text-xs font-semibold text-purple-900 mb-1">
              Hipóteses Clínicas & Dinâmica Psíquica
            </label>
            <textarea
              value={privateClinicalHypothesis}
              onChange={e => setPrivateClinicalHypothesis(e.target.value)}
              rows={2}
              placeholder="Formulações diagnósticas, esquemas cognitivos, resistências, mecanismos de defesa..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-900 mb-1">
                Supervisão Clínica
              </label>
              <input
                type="text"
                value={supervisionNotes}
                onChange={e => setSupervisionNotes(e.target.value)}
                placeholder="Pontos para levar à supervisão..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-900 mb-1">
                Transferência / Contratransferência
              </label>
              <input
                type="text"
                value={transferenceNotes}
                onChange={e => setTransferenceNotes(e.target.value)}
                placeholder="Percepções sobre o vínculo terapêutico..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-900 mb-1">
                Avaliação de Risco
              </label>
              <input
                type="text"
                value={riskAssessmentNotes}
                onChange={e => setRiskAssessmentNotes(e.target.value)}
                placeholder="Ex: Risco baixo, sem ideação..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {saveError && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>O registro NÃO foi gravado.</strong> {saveError} Seu texto continua preservado.</span>
          </div>
        )}
        {draftNotice && !saveError && (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 px-4 py-2 rounded-xl text-xs">
            {draftNotice} O texto é salvo automaticamente neste navegador enquanto você digita.
          </div>
        )}

        {/* Rodapé e Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            {sessionToEdit ? 'Cancelar' : 'Fechar (mantém rascunho)'}
          </Button>
          <Button type="submit" variant="primary" size="md" className="font-semibold" isLoading={isSaving}>
            {!isSaving && <CheckCircle className="w-4 h-4 mr-1.5" />}
            {isSaving ? 'Gravando...' : sessionToEdit ? 'Atualizar Sessão' : 'Salvar Registro de Sessão'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
