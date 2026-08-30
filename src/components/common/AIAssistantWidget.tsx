'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Sparkles,
  Bot,
  Brain,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  RefreshCw,
  Lightbulb,
  X,
  FileText
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const AIAssistantWidget: React.FC = () => {
  const { currentRole, currentPatient, currentPsychologist, exerciseTemplates } = usePsi();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'summarize' | 'suggest_exercise' | 'diary_prompt'>('summarize');

  const handleGenerate = (mode: 'summarize' | 'suggest_exercise' | 'diary_prompt', query?: string) => {
    setActiveMode(mode);
    setIsGenerating(true);
    setAiOutput(null);

    setTimeout(() => {
      setIsGenerating(false);
      if (mode === 'summarize') {
        setAiOutput(
          `📋 Estrutura Sugerida de Anotação Clínica (TCC):\n\n` +
          `• Demanda Central: Ansiedade antecipatória vinculada a situações de avaliação de desempenho corporativo.\n` +
          `• Distorções Cognitivas Identificadas: Catastrofização ("vou falhar e ser demitida") e Leitura Mental.\n` +
          `• Intervenções Aplicadas: Questionamento socrático sobre evidências reais e treino de desfusão cognitiva.\n` +
          `• Tarefa Recomendada: Preenchimento de RPD no próximo episódio de insegurança no trabalho.\n` +
          `• Plano Próxima Consulta: Revisão dos pensamentos alternativos e treino de assertividade.`
        );
      } else if (mode === 'suggest_exercise') {
        setAiOutput(
          `💡 Exercícios Recomendados da Biblioteca com base na queixa:\n\n` +
          `1. Registro de Pensamentos Disfuncionais (RPD)\n` +
          `   → Motivo: Alta eficácia na identificação e reestruturação de pensamentos automáticos de medo.\n\n` +
          `2. Check-in de Atenção Plena e Respiração 4-7-8\n` +
          `   → Motivo: Redução da reatividade fisiológica (taquicardia e hiperventilação) no momento de pico.\n\n` +
          `3. Planejador de Conversas Difíceis (DEAR MAN)\n` +
          `   → Motivo: Treino de habilidades assertivas para diálogo com figuras de autoridade.`
        );
      } else if (mode === 'diary_prompt') {
        setAiOutput(
          `✨ Perguntas Acolhedoras para Estimular sua Reflexão:\n\n` +
          `1. O que aconteceu hoje que mais chamou sua atenção ou despertou sentimentos fortes?\n` +
          `2. Qual foi o momento em que você se sentiu mais confortável ou em paz durante o dia?\n` +
          `3. Se você pudesse dar um conselho gentil a si mesmo(a) agora, o que você diria?`
        );
      }
    }, 800);
  };

  return (
    <>
      {/* Botão Flutuante Discreto */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (currentRole === 'psychologist') {
              handleGenerate('summarize');
            } else {
              handleGenerate('diary_prompt');
            }
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs font-semibold border border-teal-300/40"
          title="Assistente de IA Ética"
        >
          <Sparkles className="w-4 h-4 text-teal-200 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Assistente IA</span>
        </button>
      </div>

      {/* Modal do Assistente IA */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={currentRole === 'psychologist' ? 'Assistente IA do Psicólogo (Supervisionada)' : 'Apoio de Reflexão com IA'}
        description="Ferramenta auxiliar com supervisão e conformidade ética (CFP e LGPD)."
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Disclaimer Ético */}
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-start gap-2.5 text-xs text-teal-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Governança de IA:</strong> Esta ferramenta atua exclusivamente como apoio organizativo sob supervisão humana. Ela não realiza diagnósticos, não prescreve tratamentos e qualquer texto gerado deve ser revisado e validado pelo profissional.
            </p>
          </div>

          {/* Atalhos Rápidos */}
          <div className="flex flex-wrap gap-2">
            {currentRole === 'psychologist' ? (
              <>
                <Button
                  type="button"
                  variant={activeMode === 'summarize' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleGenerate('summarize')}
                  className="text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Estruturar Resumo Clínico TCC
                </Button>

                <Button
                  type="button"
                  variant={activeMode === 'suggest_exercise' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleGenerate('suggest_exercise')}
                  className="text-xs"
                >
                  <Lightbulb className="w-3.5 h-3.5 mr-1" />
                  Sugerir Exercício da Biblioteca
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant={activeMode === 'diary_prompt' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleGenerate('diary_prompt')}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Perguntas para Escrever no Diário
              </Button>
            )}
          </div>

          {/* Área de Resposta Gerada */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 min-h-[160px] text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                <p className="text-xs">Processando sugestão estruturada...</p>
              </div>
            ) : aiOutput ? (
              aiOutput
            ) : (
              <p className="text-slate-400 text-center py-8">Selecione uma opção acima para gerar sugestões.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="primary" size="sm" onClick={() => setIsOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
