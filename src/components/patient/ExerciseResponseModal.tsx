'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { AssignedExercise } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Send, Sparkles, HelpCircle, Heart, Printer, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExerciseResponseModalProps {
  exercise: AssignedExercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseResponseModal: React.FC<ExerciseResponseModalProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  const { submitExerciseResponse, currentPsychologist } = usePsi();

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [patientNotes, setPatientNotes] = useState('');

  if (!exercise) return null;

  const handleResponseChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const currentList: string[] = responses[fieldId] || [];
    if (currentList.includes(option)) {
      handleResponseChange(fieldId, currentList.filter(o => o !== option));
    } else {
      handleResponseChange(fieldId, [...currentList, option]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitExerciseResponse(exercise.id, responses, patientNotes);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {
      // Confetti fallback
    }

    onClose();
  };

  const isAlreadyCompleted = exercise.status === 'completed' || exercise.status === 'reviewed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise.title}
      description={`Atividade orientada por ${currentPsychologist.profile?.display_name || 'Dra. Ana'}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Orientações do Terapeuta */}
        {exercise.instructions && (
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100/70 text-xs sm:text-sm text-teal-900 leading-relaxed">
            <strong className="block font-bold text-teal-950 mb-1">Orientações para esta atividade:</strong>
            {exercise.instructions}
          </div>
        )}

        {/* Campos Dinâmicos do Exercício */}
        <div className="space-y-5">
          {exercise.schema_fields.map((field, index) => {
            const currentValue = isAlreadyCompleted && exercise.answer
              ? exercise.answer.responses[field.id]
              : responses[field.id];

            return (
              <div
                key={field.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2"
              >
                <label className="block text-xs sm:text-sm font-bold text-slate-800">
                  {index + 1}. {field.label} {field.required && <span className="text-teal-600">*</span>}
                </label>

                {field.description && (
                  <p className="text-xs text-slate-500">{field.description}</p>
                )}

                {/* TEXTAREA */}
                {field.type === 'textarea' && (
                  <textarea
                    value={currentValue || ''}
                    onChange={e => handleResponseChange(field.id, e.target.value)}
                    disabled={isAlreadyCompleted}
                    rows={3}
                    placeholder={field.placeholder || 'Sua resposta detalhada...'}
                    required={field.required}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-700"
                  />
                )}

                {/* TEXT */}
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={currentValue || ''}
                    onChange={e => handleResponseChange(field.id, e.target.value)}
                    disabled={isAlreadyCompleted}
                    placeholder={field.placeholder || 'Sua resposta...'}
                    required={field.required}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-50"
                  />
                )}

                {/* ESCALA 0 A 10 */}
                {field.type === 'scale_10' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-800">
                      <span>Nível selecionado:</span>
                      <span className="text-sm bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        {currentValue !== undefined ? currentValue : 5}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={field.min ?? 0}
                      max={field.max ?? 10}
                      step={field.step ?? 1}
                      disabled={isAlreadyCompleted}
                      value={currentValue !== undefined ? currentValue : 5}
                      onChange={e => handleResponseChange(field.id, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 disabled:opacity-75"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0 (Mínimo)</span>
                      <span>5 (Moderado)</span>
                      <span>10 (Máximo)</span>
                    </div>
                  </div>
                )}

                {/* RADIO / SELEÇÃO ÚNICA */}
                {field.type === 'radio' && field.options && (
                  <div className="space-y-1.5 pt-1">
                    {field.options.map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                          currentValue === opt
                            ? 'bg-teal-50/70 border-teal-300 font-semibold text-teal-900'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          disabled={isAlreadyCompleted}
                          checked={currentValue === opt}
                          onChange={() => handleResponseChange(field.id, opt)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* CHECKBOX / MÚLTIPLA ESCOLHA */}
                {field.type === 'checkbox' && field.options && (
                  <div className="space-y-1.5 pt-1">
                    {field.options.map((opt, i) => {
                      const isChecked = Array.isArray(currentValue) && currentValue.includes(opt);
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-teal-50/70 border-teal-300 font-semibold text-teal-900'
                              : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isAlreadyCompleted}
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(field.id, opt)}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* MOOD SCALE */}
                {field.type === 'mood_scale' && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {['Muito calmo(a)', 'Aliviado(a)', 'Neutro', 'Reflexivo(a)'].map(m => (
                      <button
                        key={m}
                        type="button"
                        disabled={isAlreadyCompleted}
                        onClick={() => handleResponseChange(field.id, m)}
                        className={`p-2 rounded-xl text-xs border font-medium transition-all ${
                          currentValue === m
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nota / Percepção do Paciente */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alguma observação, dúvida ou sensação ao preencher? (Opcional)
          </label>
          <textarea
            value={isAlreadyCompleted && exercise.answer ? exercise.answer.patient_notes || '' : patientNotes}
            onChange={e => setPatientNotes(e.target.value)}
            disabled={isAlreadyCompleted}
            rows={2}
            placeholder="Compartilhe como foi fazer este exercício..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-50"
          />
        </div>

        {/* Feedback do Psicólogo, se já houver */}
        {exercise.feedback && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Feedback da {currentPsychologist.profile?.display_name || 'Dra. Ana'}:
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              {exercise.feedback.feedback_text}
            </p>
          </div>
        )}

        {/* Rodapé e Botões */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {isAlreadyCompleted ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs text-slate-600 border-slate-300 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Salvar PDF
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {isAlreadyCompleted ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isAlreadyCompleted && (
              <Button type="submit" variant="primary" size="md" className="font-semibold shadow-sm">
                <Send className="w-4 h-4 mr-1.5" />
                Enviar Exercício Concluído
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
