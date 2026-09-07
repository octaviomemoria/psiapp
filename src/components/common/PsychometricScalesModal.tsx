'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  BarChart3,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { calculatePHQ9, calculateGAD7 } from '@/lib/utils/psychometrics';

interface PsychometricScalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

type ScaleId = 'phq9' | 'gad7' | 'dass21';

interface ScaleQuestion {
  id: string;
  text: string;
}

const PHQ9_QUESTIONS: ScaleQuestion[] = [
  { id: 'q1', text: '1. Pouco interesse ou prazer em fazer as coisas.' },
  { id: 'q2', text: '2. Sentir-se para baixo, deprimido(a) ou sem perspectiva.' },
  { id: 'q3', text: '3. Dificuldade para pegar no sono, acordar no meio da noite ou dormir demais.' },
  { id: 'q4', text: '4. Sentir-se cansado(a) ou com pouca energia.' },
  { id: 'q5', text: '5. Falta de apetite ou comer em excesso.' },
  { id: 'q6', text: '6. Sentir-se mal consigo mesmo(a) — ou achar que é um fracasso ou decepcionou a família.' },
  { id: 'q7', text: '7. Dificuldade de concentração nas atividades cotidianas (ler notícias, ver TV, trabalhar).' },
  { id: 'q8', text: '8. Movimentar-se ou falar tão devagar que os outros notaram, ou o oposto (muito inquieto).' },
  { id: 'q9', text: '9. Pensamentos de que seria melhor estar morto(a) ou de se ferir de alguma forma.' },
];

const GAD7_QUESTIONS: ScaleQuestion[] = [
  { id: 'q1', text: '1. Sentir-se nervoso(a), ansioso(a) ou muito tenso(a).' },
  { id: 'q2', text: '2. Não conseguir parar ou controlar as preocupações.' },
  { id: 'q3', text: '3. Preocupar-se demais com diferentes tipos de coisas.' },
  { id: 'q4', text: '4. Dificuldade para relaxar.' },
  { id: 'q5', text: '5. Ficar tão inquieto(a) que é difícil ficar sentado(a) quieto(a).' },
  { id: 'q6', text: '6. Ficar facilmente irritado(a) ou chateado(a).' },
  { id: 'q7', text: '7. Sentir medo como se algo horrível fosse acontecer.' },
];

const FREQUENCY_OPTIONS = [
  { value: 0, label: 'Nenhum dia' },
  { value: 1, label: 'Vários dias' },
  { value: 2, label: 'Mais da metade dos dias' },
  { value: 3, label: 'Quase todos os dias' },
];

export const PsychometricScalesModal: React.FC<PsychometricScalesModalProps> = ({
  isOpen,
  onClose,
  patientId
}) => {
  const { currentPsychologist, addPsychometricResult } = usePsi();
  const [selectedScale, setSelectedScale] = useState<ScaleId>('phq9');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<{
    score: number;
    severity: 'Mínima' | 'Leve' | 'Moderada' | 'Moderadamente Grave' | 'Grave' | 'Extremamente Severa';
    interpretation: string;
    hasRisk: boolean;
  } | null>(null);

  const questions = selectedScale === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const handleSelectOption = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleCalculateAndSubmit = () => {
    const result = selectedScale === 'phq9' 
      ? calculatePHQ9(answers) 
      : calculateGAD7(answers);

    const resultObj = {
      score: result.score,
      severity: result.severity,
      interpretation: result.interpretation,
      hasRisk: result.hasRisk
    };

    setCalculatedResult(resultObj);
    setIsCompleted(true);

    // Salvar no contexto
    addPsychometricResult({
      patient_id: patientId,
      psychologist_id: currentPsychologist.id,
      scale_id: selectedScale,
      scale_name: selectedScale === 'phq9' ? 'PHQ-9 (Rastreio de Depressão)' : 'GAD-7 (Rastreio de Ansiedade)',
      total_score: result.score,
      severity_level: result.severity,
      risk_flag: result.hasRisk,
      answers,
      clinical_interpretation: result.interpretation
    });
  };

  const handleReset = () => {
    setAnswers({});
    setIsCompleted(false);
    setCalculatedResult(null);
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-500" />
              Escalas Psicométricas Digitais Validadas
            </h3>
            <p className="text-xs text-slate-500">
              Instrumentos padronizados com cálculo automatizado de gravidade clínica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedScale('phq9'); handleReset(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedScale === 'phq9'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              PHQ-9 (Depressão)
            </button>
            <button
              onClick={() => { setSelectedScale('gad7'); handleReset(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedScale === 'gad7'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              GAD-7 (Ansiedade)
            </button>
          </div>
        </div>

        {/* Formulário de Perguntas */}
        {!isCompleted ? (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-xl text-xs">
              <strong>Instrução ao Paciente:</strong> Nas últimas 2 semanas, com que frequência você foi incomodado(a) por qualquer um dos problemas abaixo?
            </div>

            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <p className={`text-sm font-medium ${q.id === 'q9' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                  {q.text}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.value)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all text-center border ${
                        answers[q.id] === opt.value
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {opt.label} ({opt.value})
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                {Object.keys(answers).length} de {questions.length} respondidas
              </span>
              <Button
                onClick={handleCalculateAndSubmit}
                disabled={!allAnswered}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Calcular Escore e Salvar no Prontuário
              </Button>
            </div>
          </div>
        ) : (
          /* Visualização de Resultado Concluído */
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <FileCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Resultado do Teste</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Escore Total: {calculatedResult?.score} pontos
              </h4>
              <div className="inline-block mt-2">
                <Badge
                  variant={
                    calculatedResult?.severity === 'Mínima'
                      ? 'success'
                      : calculatedResult?.severity === 'Leve'
                      ? 'info'
                      : calculatedResult?.severity === 'Moderada'
                      ? 'warning'
                      : 'danger'
                  }
                  className="text-sm px-3 py-1 font-bold"
                >
                  Classificação: {calculatedResult?.severity}
                </Badge>
              </div>
            </div>

            {calculatedResult?.hasRisk && (
              <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 p-4 rounded-xl text-left text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Alerta de Risco (Item 9 Positivo)
                </div>
                <p>O paciente pontuou positivamente no item sobre pensamentos de autoflagelação/morte. Proceda com a avaliação formal de risco conforme protocolo de segurança clínica.</p>
              </div>
            )}

            <div className="max-w-lg mx-auto bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-sm">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block mb-1">
                Interpretação Clínica Automática:
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                {calculatedResult?.interpretation}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={handleReset} size="sm">
                <RotateCcw className="w-4 h-4 mr-1.5" /> Reaplicar Teste
              </Button>
              <Button onClick={onClose} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Concluir e Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
