'use client';

import React, { useState } from 'react';
import { AssignedExercise } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Send,
  Lock,
  Sparkles,
  Printer,
  CheckCircle2,
  HelpCircle,
  Clock,
  User,
  Heart,
  MessageSquare,
  FileText
} from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { formatDate, formatDateTime } from '@/lib/utils';
import { AIService } from '@/lib/ai/ai-service';

interface ExerciseReviewModalProps {
  exercise: AssignedExercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseReviewModal: React.FC<ExerciseReviewModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  const { addExerciseFeedback, currentPsychologist, patients } = usePsi();

  const [feedbackText, setFeedbackText] = useState(exercise?.feedback?.feedback_text || '');
  const [clinicalObservations, setClinicalObservations] = useState(exercise?.feedback?.clinical_observations || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincroniza estado quando muda o exercício
  React.useEffect(() => {
    if (exercise) {
      setFeedbackText(exercise.feedback?.feedback_text || '');
      setClinicalObservations(exercise.feedback?.clinical_observations || '');
      setSavedSuccess(false);
    }
  }, [exercise]);

  if (!exercise) return null;

  const patient = patients.find(p => p.id === exercise.patient_id);

  const handleGenerateAIFeedback = async () => {
    setIsGeneratingAI(true);
    try {
      const answersSummary = Object.entries(exercise.answer?.responses || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

      const draft = await AIService.generateExerciseFeedbackDraft(
        exercise.title,
        patient?.full_name || 'Paciente',
        answersSummary,
        exercise.answer?.patient_notes
      );

      setFeedbackText(draft);
    } catch (err) {
      console.error('Erro ao gerar feedback com IA:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    addExerciseFeedback(exercise.id, feedbackText, clinicalObservations);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Avaliação & Devolutiva: ${exercise.title}`}
      description={`Paciente: ${patient?.full_name || exercise.patient_name} • Concluído em ${exercise.completed_at ? formatDateTime(exercise.completed_at) : 'Pendente'}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSaveFeedback} className="space-y-5 text-xs">
        {/* Banner de Status */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-800 text-sm">{patient?.full_name || exercise.patient_name}</span>
            <Badge
              variant={exercise.status === 'reviewed' ? 'info' : exercise.status === 'completed' ? 'success' : 'warning'}
              size="sm"
            >
              {exercise.status === 'reviewed'
                ? 'Feedback Enviado'
                : exercise.status === 'completed'
                ? 'Respondido (Aguardando Feedback)'
                : 'Pendente'}
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs text-slate-600 border-slate-300"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Imprimir
          </Button>
        </div>

        {/* Respostas do Paciente */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Respostas Preenchidas pelo Paciente:
            </h4>
            <span className="text-[10px] text-slate-400">
              {exercise.completed_at ? formatDate(exercise.completed_at) : ''}
            </span>
          </div>

          {exercise.schema_fields.map((field, idx) => {
            const val = exercise.answer?.responses?.[field.id];
            return (
              <div key={field.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">
                  {idx + 1}. {field.label}
                </span>

                {field.type === 'scale_10' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold border border-teal-200 text-xs">
                      {val !== undefined ? `${val} / 10` : 'Não informado'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {Number(val) <= 3 ? '(Baixa intensidade)' : Number(val) >= 7 ? '(Alta intensidade)' : '(Moderada)'}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-800 font-medium whitespace-pre-wrap bg-slate-50/60 p-2 rounded-lg border border-slate-100 leading-relaxed text-xs">
                    {val !== undefined ? String(val) : 'Não preenchido'}
                  </p>
                )}
              </div>
            );
          })}

          {exercise.answer?.patient_notes && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <span className="text-amber-900 font-bold block text-[11px] mb-0.5">
                Comentário Adicional do Paciente:
              </span>
              <p className="text-amber-800 italic">"{exercise.answer.patient_notes}"</p>
            </div>
          )}
        </div>

        {/* Campo de Devolutiva Terapêutica (Visível ao Paciente) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              Devolutiva & Feedback Terapêutico (Visível para o Paciente) *
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateAIFeedback}
              disabled={isGeneratingAI}
              className="text-[11px] text-teal-800 border-teal-200 bg-teal-50/50 hover:bg-teal-100 flex items-center gap-1 font-semibold"
              title="Gerar rascunho de devolutiva acolhedora via IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin-slow" />
              {isGeneratingAI ? 'Gerando...' : 'Sugerir com IA'}
            </Button>
          </div>

          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            rows={4}
            placeholder="Escreva uma mensagem acolhedora validando os esforços do paciente e destacando os insights obtidos para a próxima consulta..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            required
          />
        </div>

        {/* Anotação Clínica Privativa (Sigilo CFP - Apenas Terapeuta) */}
        <div className="space-y-1.5 p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100">
          <label className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
            <Lock className="w-3.5 h-3.5 text-purple-700" />
            Hipótese Clínica & Anotações de Supervisão (Segredo Profissional - CFP)
          </label>
          <p className="text-[11px] text-purple-800/80">
            Esta anotação fica armazenada de forma privativa e <strong>nunca</strong> é compartilhada com o paciente.
          </p>
          <textarea
            value={clinicalObservations}
            onChange={e => setClinicalObservations(e.target.value)}
            rows={2}
            placeholder="Ex: Paciente demonstra evolução na identificação de distorções de catastrofização. Trabalhar desfusão na sessão 12..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="font-bold bg-teal-600 hover:bg-teal-700 flex items-center gap-1.5 shadow-sm"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Salvar & Enviar Feedback</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};