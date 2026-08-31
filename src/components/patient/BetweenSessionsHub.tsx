'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { AssignedExercise } from '@/types/database';
import {
  Sparkles,
  Heart,
  ClipboardList,
  BookOpen,
  Target,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  SmilePlus,
  Lock,
  Share2,
  Video,
  Headphones,
  File,
  Anchor,
  ThermometerSnowflake,
  Bookmark,
  Moon,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MoodCheckInModal } from './MoodCheckInModal';
import { ExerciseResponseModal } from './ExerciseResponseModal';
import { SensoryGroundingModal } from './tools/SensoryGroundingModal';
import { TippEmergencyModal } from './tools/TippEmergencyModal';
import { CopingCardsModal } from './tools/CopingCardsModal';
import { SleepDiaryModal } from './tools/SleepDiaryModal';
import { PsychometricScalesModal } from '@/components/common/PsychometricScalesModal';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { Volume2, Play, Brain } from 'lucide-react';

interface BetweenSessionsHubProps {
  onNavigateTab: (tab: string) => void;
}

export const BetweenSessionsHub: React.FC<BetweenSessionsHubProps> = ({ onNavigateTab }) => {
  const {
    currentPatient,
    currentPsychologist,
    getPatientAssignedExercises,
    getPatientDiaryEntries,
    getPatientGoals,
    getPatientMoodLogs,
    getPatientContents,
    getPatientVoiceAnchors,
    getPatientPsychometricResults,
    updatePatientContentStatus,
  } = usePsi();

  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<AssignedExercise | null>(null);

  // Modais de Ferramentas Especializadas
  const [isGroundingModalOpen, setIsGroundingModalOpen] = useState(false);
  const [isTippModalOpen, setIsTippModalOpen] = useState(false);
  const [isCopingCardsOpen, setIsCopingCardsOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isScalesModalOpen, setIsScalesModalOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const exercises = getPatientAssignedExercises();
  const diaryEntries = getPatientDiaryEntries();
  const goals = getPatientGoals();
  const moodLogs = getPatientMoodLogs();
  const contents = getPatientContents();
  const voiceAnchors = getPatientVoiceAnchors(currentPatient.id);
  const psychometrics = getPatientPsychometricResults(currentPatient.id);

  const pendingExercises = exercises.filter(e => e.status === 'pending');
  const completedExercises = exercises.filter(e => e.status === 'completed' || e.status === 'reviewed');
  const latestMood = moodLogs[moodLogs.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Acolhedor da Central Entre Sessões */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-medium border border-teal-300/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seu Espaço Terapêutico Contínuo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Área Entre Sessões
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            Aqui você encontra suas atividades, ferramentas de bolso, diário e conteúdos recomendados por{' '}
            <span className="font-semibold">{currentPsychologist.profile?.display_name || 'sua psicóloga'}</span> para praticar entre as consultas.
          </p>
        </div>
      </div>

      {/* 1. SEÇÃO: COMO ESTOU HOJE? (CHECK-IN DE HUMOR) */}
      <Card className="border-teal-100 bg-gradient-to-r from-teal-50/50 via-white to-sky-50/40">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-teal-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">Como você está se sentindo hoje?</h3>
                {latestMood && (
                  <Badge variant="success" size="sm">
                    Registrado {formatRelativeDate(latestMood.logged_at)}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {latestMood
                  ? `Último registro: ${latestMood.emotions.join(', ')} (Intensidade ${latestMood.intensity}/10)`
                  : 'Faça um check-in rápido de humor para registrar seu estado emocional.'}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsMoodModalOpen(true)}
            className="font-semibold flex-shrink-0 shadow-sm"
          >
            <SmilePlus className="w-4 h-4 mr-1.5" />
            {latestMood ? 'Atualizar Meu Humor' : 'Registrar Meu Humor'}
          </Button>
        </CardContent>
      </Card>

      {/* 2. CAIXA DE FERRAMENTAS RÁPIDAS DE BOLSO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Caixa de Ferramentas de Bolso
            </h3>
          </div>
          <span className="text-xs text-slate-400">Práticas rápidas e apoio para momentos difíceis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Ancoragem 5-4-3-2-1 */}
          <button
            type="button"
            onClick={() => setIsGroundingModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">Ancoragem 5-4-3-2-1</h4>
              <p className="text-[11px] text-slate-500 mt-1">Acalmar a mente com os 5 sentidos</p>
            </div>
          </button>

          {/* Protocolo TIPP / STOP */}
          <button
            type="button"
            onClick={() => setIsTippModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">Crise TIPP & STOP</h4>
              <p className="text-[11px] text-slate-500 mt-1">Regulação física rápida DBT</p>
            </div>
          </button>

          {/* Cartões de Enfrentamento */}
          <button
            type="button"
            onClick={() => setIsCopingCardsOpen(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">Coping Cards</h4>
              <p className="text-[11px] text-slate-500 mt-1">Meus lembretes e frases-âncora</p>
            </div>
          </button>

          {/* Diário do Sono */}
          <button
            type="button"
            onClick={() => setIsSleepModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">Diário do Sono</h4>
              <p className="text-[11px] text-slate-500 mt-1">Registro matinal de descanso</p>
            </div>
          </button>
        </div>
      </div>

      {/* Grid Principal: 4 Pilares da Área Entre Sessões */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PILAR 1: MEUS EXERCÍCIOS */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-teal-600" />
                  Meus Exercícios Terapêuticos
                </CardTitle>
                <CardDescription>Atividades orientadas pela psicóloga</CardDescription>
              </div>
              <Badge variant={pendingExercises.length > 0 ? 'warning' : 'success'} size="sm">
                {pendingExercises.length} pendente(s)
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {exercises.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum exercício atribuído no momento.</p>
              ) : (
                exercises.slice(0, 3).map(exercise => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50/40 hover:border-teal-200 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{exercise.title}</h4>
                      <Badge
                        variant={
                          exercise.status === 'completed' || exercise.status === 'reviewed'
                            ? 'success'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {exercise.status === 'reviewed'
                          ? 'Avaliado com Feedback'
                          : exercise.status === 'completed'
                          ? 'Concluído'
                          : 'Pendente'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">{exercise.instructions}</p>

                    {exercise.feedback && (
                      <div className="mt-2 p-2 bg-teal-100/60 rounded-lg text-[11px] text-teal-900 border border-teal-200 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-700 mt-0.5 flex-shrink-0" />
                        <span><strong>Feedback da psicóloga:</strong> {exercise.feedback.feedback_text}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* PILAR 2: MEU DIÁRIO */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  Meu Diário Emocional
                </CardTitle>
                <CardDescription>Suas anotações e reflexões privadas</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('diario')}
                className="text-xs text-teal-700"
              >
                Ver Diário Completo
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {diaryEntries.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500 mb-2">Você ainda não escreveu no diário.</p>
                  <Button variant="outline" size="sm" onClick={() => onNavigateTab('diario')}>
                    Escrever Primeira Entrada
                  </Button>
                </div>
              ) : (
                diaryEntries.slice(0, 2).map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => onNavigateTab('diario')}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50/40 hover:border-teal-200 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {entry.title || 'Reflexão Pessoal'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {entry.is_shared_with_psychologist ? (
                          <Badge variant="default" size="sm" className="bg-teal-50 text-teal-700">
                            <Share2 className="w-3 h-3 mr-1" />
                            Compartilhado
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm" className="text-slate-500">
                            <Lock className="w-3 h-3 mr-1" />
                            Privado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      {formatDate(entry.entry_date)} • {entry.predominant_emotion} ({entry.intensity}/10)
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* PILAR 3: MINHAS METAS */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-600" />
                  Minhas Metas & Objetivos
                </CardTitle>
                <CardDescription>O que estamos construindo juntos</CardDescription>
              </div>
              <Badge variant="default" size="sm" className="bg-teal-50 text-teal-700">
                {goals.length} meta(s)
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhuma meta ativa no momento.</p>
              ) : (
                goals.slice(0, 3).map(goal => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{goal.title}</span>
                      <span className="font-bold text-teal-700">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* PILAR 4: CONTEÚDOS RECOMENDADOS */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Materiais Psicoeducativos
                </CardTitle>
                <CardDescription>Artigos, áudios e vídeos indicados</CardDescription>
              </div>
              <Badge variant="outline" size="sm">
                {contents.length} material(is)
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {contents.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum conteúdo recomendado no momento.</p>
              ) : (
                contents.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.content?.title || 'Material Psicoeducativo'}
                      </p>
                      {item.personalized_note && (
                        <p className="text-[11px] text-teal-700 italic truncate">
                          "{item.personalized_note}"
                        </p>
                      )}
                    </div>

                    <Button
                      variant={item.status === 'completed' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => updatePatientContentStatus(item.id, 'completed')}
                      className="text-xs flex-shrink-0"
                    >
                      {item.status === 'completed' ? 'Concluído' : 'Ler / Ouvir'}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* SEÇÃO EXTRA: ÂNCORAS DE VOZ & ESCALAS DE AUTOAVALIAÇÃO */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Âncoras de Voz */}
        <Card className="p-5 space-y-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Âncoras de Voz do Terapeuta</span>
            </div>
            <Badge variant="success" size="sm">
              {voiceAnchors.length} áudio(s)
            </Badge>
          </div>
          <p className="text-xs text-slate-600">
            Mensagens de voz e orientações breves gravadas pela sua psicóloga para você ouvir quando precisar de regulação.
          </p>

          {voiceAnchors.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Nenhum áudio de âncora gravado ainda.</p>
          ) : (
            <div className="space-y-2 pt-1">
              {voiceAnchors.map(va => {
                const isPlaying = playingAudioId === va.id;
                return (
                  <div key={va.id} className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">{va.title}</p>
                      <p className="text-[11px] text-slate-500">{va.instruction || 'Ouça respirando profundamente.'}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setPlayingAudioId(isPlaying ? null : va.id)}
                      className={`text-xs flex items-center gap-1 shrink-0 ${isPlaying ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isPlaying ? 'Pausar' : 'Ouvir (2m)'}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Escalas Psicométricas */}
        <Card className="p-5 space-y-3 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Autoavaliação Psicométrica</span>
            </div>
            <Button
              size="sm"
              onClick={() => setIsScalesModalOpen(true)}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1"
            >
              <Brain className="w-3.5 h-3.5" />
              Responder Escala
            </Button>
          </div>
          <p className="text-xs text-slate-600">
            Escalas padronizadas de saúde emocional (PHQ-9 e GAD-7) para acompanhar sua evolução de forma segura.
          </p>

          <div className="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">Última aplicação:</span>
              <p className="text-[11px] text-slate-500">
                {psychometrics.length > 0
                  ? `${psychometrics[psychometrics.length - 1].scale_name} • Score: ${psychometrics[psychometrics.length - 1].total_score} pts (${psychometrics[psychometrics.length - 1].severity_level})`
                  : 'Nenhuma escala realizada recentemente.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modais de Exercício e Humor */}
      <MoodCheckInModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
      />

      <ExerciseResponseModal
        exercise={selectedExercise}
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
      />

      {/* Modais das Ferramentas Especializadas */}
      <SensoryGroundingModal
        isOpen={isGroundingModalOpen}
        onClose={() => setIsGroundingModalOpen(false)}
      />

      <TippEmergencyModal
        isOpen={isTippModalOpen}
        onClose={() => setIsTippModalOpen(false)}
      />

      <CopingCardsModal
        isOpen={isCopingCardsOpen}
        onClose={() => setIsCopingCardsOpen(false)}
      />

      <SleepDiaryModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />

      <PsychometricScalesModal
        patientId={currentPatient.id}
        isOpen={isScalesModalOpen}
        onClose={() => setIsScalesModalOpen(false)}
      />
    </div>
  );
};
