'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import { AssignedExercise } from '@/types/database';
import {
  Heart,
  Calendar,
  ClipboardList,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  SmilePlus,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  Lock,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, formatRelativeDate } from '@/lib/utils';
import { MoodCheckInModal } from './MoodCheckInModal';
import { ExerciseResponseModal } from './ExerciseResponseModal';

interface PatientHomeViewProps {
  onNavigateTab: (tab: string) => void;
}

export const PatientHomeView: React.FC<PatientHomeViewProps> = ({ onNavigateTab }) => {
  const {
    currentPatient,
    currentPsychologist,
    getPatientAppointments,
    getPatientAssignedExercises,
    getPatientGoals,
    getPatientDiaryEntries,
    getPatientMoodLogs,
  } = usePsi();

  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<AssignedExercise | null>(null);

  const appointments = getPatientAppointments();
  const exercises = getPatientAssignedExercises();
  const goals = getPatientGoals();
  const diaryEntries = getPatientDiaryEntries();
  const moodLogs = getPatientMoodLogs();

  const pendingExercises = exercises.filter(e => e.status === 'pending');
  const nextAppointment = appointments
    .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];

  const latestMood = moodLogs[moodLogs.length - 1];

  return (
    <div className="space-y-6 animate-fade-in pb-12 sm:pb-0">
      {/* 1. SAUDAÇÃO E BLOCO "COMO VOCÊ ESTÁ HOJE?" */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/60 text-teal-100 text-xs font-medium border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seu Acompanhamento Psicológico</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Olá, {currentPatient.social_name || currentPatient.full_name.split(' ')[0]}
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              Acompanhamento com a <strong>{currentPsychologist.profile?.display_name || 'Dra. Ana Martins'}</strong>
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsMoodModalOpen(true)}
              className="bg-white text-teal-800 hover:bg-teal-50 shadow-md font-bold text-sm"
            >
              <Heart className="w-4 h-4 mr-2 text-rose-500 fill-rose-500 animate-pulse" />
              {latestMood ? 'Atualizar Como Estou Hoje' : 'Como você está hoje?'}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. PRÓXIMA SESSÃO & BLOCO "PARA VOCÊ FAZER" */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Próxima Sessão */}
        <Card className="border-teal-100/80 bg-gradient-to-br from-teal-50/40 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Sua Próxima Sessão
            </CardTitle>
            <CardDescription>Horário e modalidade do seu próximo encontro</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {nextAppointment ? (
              <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                      Consulta Confirmada
                    </span>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">
                      {formatDateTime(nextAppointment.starts_at)}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {nextAppointment.modality === 'online' ? 'Online' : 'Presencial'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  {nextAppointment.modality === 'online' ? (
                    <Video className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span className="truncate">
                    {nextAppointment.location_or_link || 'Link será disponibilizado antes do início'}
                  </span>
                </div>

                {nextAppointment.location_or_link?.startsWith('http') && (
                  <a
                    href={nextAppointment.location_or_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
                  >
                    Entrar na Sala Virtual
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">Nenhuma sessão agendada no momento.</p>
                <span className="text-[11px] text-teal-700 font-medium">Sua psicóloga entrará em contato para agendar o próximo encontro.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Para Você Fazer (Exercícios Pendentes) */}
        <Card className="hover:border-teal-200 transition-all">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                Para Você Fazer
              </CardTitle>
              <CardDescription>Atividades combinadas para realizar entre sessões</CardDescription>
            </div>
            <Badge variant={pendingExercises.length > 0 ? 'warning' : 'success'} size="sm">
              {pendingExercises.length} pendente(s)
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {pendingExercises.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-xs text-slate-800">Tudo em dia!</p>
                <p className="text-[11px] text-slate-500">Você não tem exercícios pendentes no momento.</p>
              </div>
            ) : (
              pendingExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{ex.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ex.instructions}</p>
                    {ex.due_date && (
                      <p className="text-[10px] text-amber-800 font-medium mt-1">
                        Prazo: {formatDate(ex.due_date)}
                      </p>
                    )}
                  </div>
                  <Button variant="primary" size="sm" className="text-xs font-semibold flex-shrink-0">
                    Responder
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. SUA EVOLUÇÃO E ÚLTIMOS REGISTROS DO DIÁRIO */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Metas em Destaque */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-600" />
                Seus Objetivos Terapêuticos
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('entre_sessoes')}
              className="text-xs text-teal-700"
            >
              Ver todos
            </Button>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Nenhum objetivo cadastrado.</p>
            ) : (
              goals.slice(0, 3).map(goal => (
                <div key={goal.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{goal.title}</span>
                    <span className="font-bold text-teal-700">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Últimas Entradas no Diário */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Últimas Anotações no Diário
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('diario')}
              className="text-xs text-teal-700"
            >
              Abrir diário
            </Button>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {diaryEntries.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Você ainda não escreveu no diário.</p>
            ) : (
              diaryEntries.slice(0, 2).map(entry => (
                <div key={entry.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{entry.title || 'Reflexão'}</span>
                    <span className="text-[10px] text-slate-400">{formatRelativeDate(entry.entry_date)}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{entry.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <MoodCheckInModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
      />

      <ExerciseResponseModal
        exercise={selectedExercise}
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};
