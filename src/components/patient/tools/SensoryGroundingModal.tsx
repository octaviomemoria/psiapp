'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Eye,
  Hand,
  Volume2,
  Flower2,
  Apple,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SensoryGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensoryGroundingModal: React.FC<SensoryGroundingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [itemsFound, setItemsFound] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const steps = [
    {
      count: 5,
      sense: 'Visão',
      icon: Eye,
      title: '5 Coisas que você pode VER',
      prompt: 'Olhe ao redor do seu espaço agora. Encontre 5 objetos, cores ou detalhes que você não havia reparado.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      examples: 'Ex: A textura da parede, o ponteiro do relógio, o reflexo na janela, a cor da caneta, a sombra na mesa...'
    },
    {
      count: 4,
      sense: 'Tato',
      icon: Hand,
      title: '4 Coisas que você pode TOCAR ou sentir no corpo',
      prompt: 'Toque em 4 texturas diferentes ou sinta os pontos de contato do seu corpo.',
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      badgeColor: 'bg-sky-100 text-sky-800',
      examples: 'Ex: O tecido da sua roupa, os pés firmes no chão, a temperatura das mãos, a superfície da mesa...'
    },
    {
      count: 3,
      sense: 'Audição',
      icon: Volume2,
      title: '3 Sons que você pode OUVIR',
      prompt: 'Feche os olhos por alguns segundos e escute atentamente os sons ao fundo.',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
      examples: 'Ex: O vento lá fora, o barulho do trânsito distante, o som da sua própria respiração...'
    },
    {
      count: 2,
      sense: 'Olfato',
      icon: Flower2,
      title: '2 Aromas que você pode CHEIRAR',
      prompt: 'Inspire profundamente pelo nariz e note os aromas presentes no ar ou perto de você.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      examples: 'Ex: O cheiro de café, o sabonete nas mãos, o perfume, o frescor do ar...'
    },
    {
      count: 1,
      sense: 'Paladar',
      icon: Apple,
      title: '1 Sabor que você pode NOTAR',
      prompt: 'Foque no sabor presente na sua boca ou tome um pequeno gole de água consciente.',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800',
      examples: 'Ex: O gosto da pasta de dente, um gole d\'água fresca, um chá, ou simplesmente a sensação na língua...'
    }
  ];

  const currentSense = steps[currentStep];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Concluiu
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setCurrentStep(steps.length);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ancoragem Sensorial 5-4-3-2-1 (Grounding)"
      description="Técnica de atenção plena para trazer sua mente de volta ao momento presente e acalmar a ansiedade."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Barra de Progresso das 5 Etapas */}
        <div className="flex items-center justify-between gap-1.5 px-2">
          {steps.map((s, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-2 rounded-full transition-all ${
                  idx < currentStep
                    ? 'bg-teal-600'
                    : idx === currentStep
                    ? 'bg-teal-400 animate-pulse'
                    : 'bg-slate-200'
                }`}
              />
              <span className="text-[10px] text-slate-400 font-bold">{s.count}</span>
            </div>
          ))}
        </div>

        {currentStep < steps.length ? (
          <div className="space-y-5">
            {/* Card da Etapa Atual */}
            <div className={`p-6 rounded-2xl border ${currentSense.color} space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    <currentSense.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${currentSense.badgeColor}`}>
                      Etapa {currentStep + 1} de 5 • {currentSense.sense}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{currentSense.title}</h3>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {currentSense.prompt}
              </p>

              <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 text-xs text-slate-600 italic">
                {currentSense.examples}
              </div>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center gap-3 text-xs text-teal-800">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Não tenha pressa. Respire com calma enquanto observa cada um dos elementos.</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
                className="font-bold shadow-sm"
              >
                <span>Concluir {currentSense.count} {currentSense.sense}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          /* Tela de Conclusão Acolhedora */
          <div className="text-center py-6 space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Você completou a Ancoragem Sensorial!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Sua mente e seu corpo voltaram ao presente. Perceba como a respiração está mais assentada e você está seguro(a) aqui e agora.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-4">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Fazer Novamente
              </Button>
              <Button type="button" variant="primary" size="md" onClick={onClose} className="font-semibold">
                Estou Bem / Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
