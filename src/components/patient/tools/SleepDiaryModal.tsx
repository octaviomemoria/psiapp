'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Moon,
  Sun,
  Bed,
  Sparkles,
  CheckCircle2,
  Clock,
  Coffee,
  Tv,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SleepDiaryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addMoodLog, currentPatient } = usePsi();

  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [latency, setLatency] = useState('15 a 30 min');
  const [awakenings, setAwakenings] = useState('Nenhum');
  const [qualityScore, setQualityScore] = useState<number>(7);
  const [factors, setFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const factorOptions = [
    'Celular/Telas na cama',
    'Cafeína à tarde/noite',
    'Pensamentos acelerados',
    'Ruído ou calor no quarto',
    'Jantar pesado tardio',
    'Atividade física no dia'
  ];

  const toggleFactor = (f: string) => {
    setFactors(prev => prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Registra como nota de contexto / humor para histórico
    addMoodLog({
      mood_score: qualityScore >= 7 ? 4 : qualityScore >= 5 ? 3 : 2,
      emotions: ['Descanso', 'Sono', qualityScore >= 7 ? 'Disposto' : 'Cansado'],
      intensity: qualityScore,
      notes: `🌙 Registro do Sono: Dormiu às ${bedTime}, acordou às ${wakeTime}. Latência: ${latency}. Despertares: ${awakenings}. Fatores: ${factors.join(', ') || 'Nenhum'}. ${notes ? `Obs: ${notes}` : ''}`,
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 }
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Diário do Sono & Higiene Circadiana"
      description="Acompanhe o descanso noturno e identifique hábitos que influenciam sua energia e ansiedade."
      maxWidth="xl"
    >
      {isSaved ? (
        <div className="py-8 text-center space-y-3 animate-scale-up">
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Registro do Sono Salvo com Sucesso!</h4>
          <p className="text-xs text-slate-500">Seus dados de descanso foram atualizados no seu histórico.</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                Horário que foi para a cama
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={e => setBedTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Horário que levantou
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tempo para pegar no sono</label>
              <select
                value={latency}
                onChange={e => setLatency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Menos de 15 min">Rápido (&lt; 15 min)</option>
                <option value="15 a 30 min">Normal (15 a 30 min)</option>
                <option value="30 a 60 min">Demorado (30 a 60 min)</option>
                <option value="Mais de 1 hora">Insônia (&gt; 1 hora)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Despertares durante a noite</label>
              <select
                value={awakenings}
                onChange={e => setAwakenings(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Nenhum">Nenhum (Direto)</option>
                <option value="1 a 2 vezes">1 a 2 vezes</option>
                <option value="3 ou mais vezes">3 ou mais vezes</option>
                <option value="Acordou de madrugada e não dormiu mais">Acordou antes da hora</option>
              </select>
            </div>
          </div>

          {/* Qualidade do Descanso 0 a 10 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Qualidade percebida do descanso (0 a 10)</label>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                {qualityScore} / 10 ({qualityScore >= 8 ? 'Excelente' : qualityScore >= 6 ? 'Bom' : 'Cansado'})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={qualityScore}
              onChange={e => setQualityScore(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Fatores Interferentes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fatores presentes antes de dormir:</label>
            <div className="flex flex-wrap gap-1.5">
              {factorOptions.map(opt => {
                const isSelected = factors.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleFactor(opt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações / Sonhos (Opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Acordei com dor de cabeça ou tive pesadelos..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" className="font-semibold">
              Salvar Registro
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
