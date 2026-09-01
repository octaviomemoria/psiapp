'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Wind,
  Brain,
  CheckCircle2,
  Heart
} from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  description: string;
  guidanceText: string;
  icon: any;
  color: string;
}

const TRACKS: AudioTrack[] = [
  {
    id: 'mindfulness-5m',
    title: 'Mindfulness: Aterrisando no Momento Presente',
    category: 'Atenção Plena',
    durationMinutes: 5,
    description: 'Conecte-se com sua respiração e com os apoios do seu corpo para reduzir a aceleração mental.',
    guidanceText: 'Feche suavemente os olhos. Sinta o peso dos seus pés no chão e as mãos sobre as pernas. Inspire profundamente pelo nariz, percebendo o ar fresco entrar, e expire soltando todo o ar pela boca...',
    icon: Sparkles,
    color: 'teal'
  },
  {
    id: 'breathing-478',
    title: 'Respiração Reguladora 4-7-8',
    category: 'Regulação Fisiológica',
    durationMinutes: 3,
    description: 'Técnica neurofisiológica para desativar o sistema simpático e desacelerar os batimentos cardíacos.',
    guidanceText: 'Inspire pelo nariz contando até 4... Segure o ar nos pulmões contando até 7... E solte lentamente pela boca fazendo um som de sopro suave contando até 8...',
    icon: Wind,
    color: 'indigo'
  },
  {
    id: 'jacobson-8m',
    title: 'Relaxamento Muscular Progressivo (Jacobson)',
    category: 'Tensão Corporal',
    durationMinutes: 8,
    description: 'Contração e relaxamento intencional dos grupos musculares (ombros, mandíbula, mãos e pernas).',
    guidanceText: 'Contraia os ombros em direção às orelhas por 5 segundos... agora solte completamente, sentindo o calor e o alívio da musculatura relaxando...',
    icon: Brain,
    color: 'purple'
  },
  {
    id: 'defusion-clouds',
    title: 'Desfusão Cognitiva: Pensamentos como Nuvens',
    category: 'ACT / Aceitação',
    durationMinutes: 6,
    description: 'Aprenda a observar seus pensamentos difíceis passando no céu da sua mente sem se fundir a eles.',
    guidanceText: 'Imagine um céu azul aberto. Cada pensamento que surgir na sua mente — seja uma preocupação ou uma crítica —, coloque-o suavemente sobre uma nuvem passageira e deixe-a seguir viagem...',
    icon: Heart,
    color: 'amber'
  }
];

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ isOpen, onClose }) => {
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const totalSeconds = selectedTrack.durationMinutes * 60;
  const progressPercent = (elapsedSeconds / totalSeconds) * 100;

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds]);

  const handleSelectTrack = (track: AudioTrack) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    setElapsedSeconds(0);
  };

  const handleTogglePlay = () => {
    if (elapsedSeconds >= totalSeconds) {
      setElapsedSeconds(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsPlaying(false);
        onClose();
      }}
      title="Biblioteca de Áudios Terapêuticos Guiados"
      description="Práticas auditivas guiadas para relaxamento, ancoragem no presente e desfusão de pensamentos."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Player Principal em Destaque */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-card space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 flex items-center justify-center">
                <Headphones className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <Badge variant="purple" size="sm" className="bg-indigo-500/40 text-indigo-200 mb-1">
                  {selectedTrack.category} • {selectedTrack.durationMinutes} min
                </Badge>
                <h3 className="font-bold text-base text-white">{selectedTrack.title}</h3>
              </div>
            </div>
          </div>

          {/* Guia Falado / Roteiro da Técnica */}
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs text-indigo-100 leading-relaxed italic">
            "{selectedTrack.guidanceText}"
          </div>

          {/* Barra de Progresso do Áudio */}
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-indigo-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span>{formatTimer(elapsedSeconds)}</span>
              <span>{formatTimer(totalSeconds)}</span>
            </div>
          </div>

          {/* Controles do Player */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <div className="p-2.5 rounded-full bg-white/10 text-slate-300">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Lista de Outros Áudios Disponíveis */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Outros Exercícios Guiados:</span>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {TRACKS.map(track => {
              const isSelected = track.id === selectedTrack.id;
              const Icon = track.icon;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(track)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{track.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{track.description}</p>
                    <span className="text-[10px] font-bold text-indigo-600 mt-1 block">
                      {track.durationMinutes} minutos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
