'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { MoodScore } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Heart, Sparkles, Smile, Frown, Meh, SmilePlus, Angry, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOOD_SCORES: { score: MoodScore; label: string; icon: string; bg: string; border: string; text: string }[] = [
  { score: 5, label: 'Muito bem', icon: '😄', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  { score: 4, label: 'Bem', icon: '🙂', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800' },
  { score: 3, label: 'Neutro', icon: '😐', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  { score: 2, label: 'Mal', icon: '🙁', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
  { score: 1, label: 'Muito mal', icon: '😞', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800' },
];

const EMOTION_TAGS = [
  'Feliz',
  'Tranquilo',
  'Confiante',
  'Motivado',
  'Ansioso',
  'Preocupado',
  'Cansado',
  'Triste',
  'Irritado',
  'Frustrado',
  'Grato',
  'Esperançoso',
  'Inseguro',
  'Aliviado',
];

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({ isOpen, onClose }) => {
  const { addMoodLog, currentPsychologist } = usePsi();

  const [selectedScore, setSelectedScore] = useState<MoodScore>(4);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Tranquilo']);
  const [intensity, setIntensity] = useState<number>(6);
  const [notes, setNotes] = useState('');

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMoodLog({
      mood_score: selectedScore,
      emotions: selectedEmotions.length > 0 ? selectedEmotions : ['Neutro'],
      intensity,
      notes: notes.trim() || undefined,
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignorar caso confetti não inicialize no ambiente
    }

    onClose();
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Como você está se sentindo hoje?"
      description="Reserve alguns instantes para se conectar com suas emoções."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Escolha de Estado Geral */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            1. Qual é o seu estado emocional predominante?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_SCORES.map(m => {
              const isSelected = selectedScore === m.score;
              return (
                <button
                  key={m.score}
                  type="button"
                  onClick={() => setSelectedScore(m.score)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? `${m.bg} ${m.border} ring-2 ring-teal-500 scale-105 shadow-sm`
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1">{m.icon}</span>
                  <span className={`text-[10px] sm:text-xs font-medium text-center ${isSelected ? m.text : 'text-slate-600'}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Seleção de Emoções Específicas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            2. Quais emoções descrevem este momento? (Selecione uma ou mais)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
            {EMOTION_TAGS.map(tag => {
              const isSelected = selectedEmotions.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleEmotion(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Intensidade 0 a 10 */}
        <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">3. Intensidade Emocional (0 a 10)</span>
            <span className="font-bold text-teal-700 text-sm">{intensity}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={intensity}
            onChange={e => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0 = Muito leve</span>
            <span>5 = Moderado</span>
            <span>10 = Muito intenso</span>
          </div>
        </div>

        {/* 4. Quer registrar o que aconteceu? */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            4. Quer registrar o que aconteceu ou o que está pensando? (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Consegui concluir uma tarefa importante, ou senti ansiedade com uma mensagem..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" className="font-semibold">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Salvar Registro de Humor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
