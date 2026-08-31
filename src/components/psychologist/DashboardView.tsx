'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Users,
  Calendar,
  ClipboardList,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Search,
  BookOpen,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, formatRelativeDate } from '@/lib/utils';
import { SessionFormModal } from './SessionFormModal';
import { ExerciseBuilderModal } from './ExerciseBuilderModal';
import { LiveSessionModal } from './LiveSessionModal';
import { PatientInviteModal } from './PatientInviteModal';
import { Play, UserPlus } from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onSelectPatient }) => {
  const {
    currentPsychologist,
    patients,
    appointments,
    sessions,
    assignedExercises,
    diaryEntries,
    moodLogs,
  } = usePsi();

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedPatientForLive, setSelectedPatientForLive] = useState<any>(patients[0]);

  // Cálculos de Métricas
  const activePatients = patients.filter(p => p.status === 'active');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.session_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const pendingExercises = assignedExercises.filter(e => e.status === 'pending');
  const completedExercisesForReview = assignedExercises.filter(e => e.status === 'completed');

  // Próximas sessões agendadas
  const upcomingAppointments = appointments
    .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 4);

  // Exercícios recém-respondidos
  const recentCompletedAnswers = assignedExercises
    .filter(e => e.status === 'completed' && e.answer)
    .sort((a, b) => {
      const timeA = a.answer?.submitted_at ? new Date(a.answer.submitted_at).getTime() : 0;
      const timeB = b.answer?.submitted_at ? new Date(b.answer.submitted_at).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Boas-Vindas & Ações Rápidas */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/50 text-teal-100 text-xs font-medium border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel Profissional do Psicólogo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Olá, {currentPsychologist.profile?.full_name || 'Dra. Ana Martins'}
            </h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              CRP {currentPsychologist.crp_number}/{currentPsychologist.crp_state} • {activePatients.length} pacientes ativos sob seu acompanhamento clínico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSelectedPatientForLive(patients[0]);
                setIsLiveSessionModalOpen(true);
              }}
              className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-md font-semibold flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" />
              Iniciar Sessão ao Vivo
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsInviteModalOpen(true)}
              className="border-teal-400/40 text-white hover:bg-white/10 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Convidar Paciente
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsSessionModalOpen(true)}
              className="border-teal-400/40 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Registrar Sessão
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de KPIs / Indicadores Chave */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pacientes Ativos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{activePatients.length}</h3>
              <p className="text-[11px] text-teal-600 font-medium mt-0.5">Em acompanhamento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sessões no Mês</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{sessionsThisMonth.length}</h3>
              <p className="text-[11px] text-sky-600 font-medium mt-0.5">Realizadas e documentadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Exercícios Pendentes</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{pendingExercises.length}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Com os pacientes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aguardando Feedback</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{completedExercisesForReview.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Respostas recebidas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal: Agenda do Dia / Próximas Sessões + Exercícios Recentes */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna 1 e 2: Próximas Sessões & Pacientes com Pendências */}
        <div className="lg:col-span-2 space-y-6">
          {/* Próximas Sessões */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Próximas Sessões Agendadas
                </CardTitle>
                <CardDescription>Visão rápida dos próximos atendimentos clínicos</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('agenda')}
                className="text-xs text-teal-700 font-semibold"
              >
                Ver agenda completa
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhum atendimento agendado para os próximos dias.</p>
              ) : (
                upcomingAppointments.map(appointment => {
                  const patient = patients.find(p => p.id === appointment.patient_id);
                  return (
                    <div
                      key={appointment.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center font-bold text-sm">
                          {patient?.full_name.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {patient?.full_name || appointment.patient_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(appointment.starts_at)} •{' '}
                            <span className="capitalize">{appointment.modality}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={appointment.status === 'confirmed' ? 'success' : 'default'}
                          size="sm"
                        >
                          {appointment.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSelectPatient(appointment.patient_id);
                            onNavigateTab('pacientes');
                          }}
                          className="text-xs"
                        >
                          Ver paciente
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Pacientes e Status de Acompanhamento */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  Carteira de Pacientes Recentes
                </CardTitle>
                <CardDescription>Resumo dos pacientes ativos e atividades recentes</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('pacientes')}
                className="text-xs text-teal-700 font-semibold"
              >
                Gerenciar todos ({patients.length})
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent>
              <div className="divide-y divide-slate-100">
                {patients.slice(0, 4).map(patient => {
                  const patientExercises = assignedExercises.filter(e => e.patient_id === patient.id && e.status === 'pending');
                  const lastSession = sessions
                    .filter(s => s.patient_id === patient.id)
                    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())[0];

                  return (
                    <div
                      key={patient.id}
                      onClick={() => {
                        onSelectPatient(patient.id);
                        onNavigateTab('pacientes');
                      }}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                          {patient.profile?.avatar_url ? (
                            <img src={patient.profile.avatar_url} alt={patient.full_name} className="w-full h-full object-cover" />
                          ) : (
                            patient.full_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{patient.full_name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-sm">
                            {patient.clinical_notes_overview || 'Em acompanhamento terapêutico.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div className="hidden sm:block">
                          <p className="text-xs text-slate-600">
                            Última sessão: {lastSession ? formatRelativeDate(lastSession.session_date) : 'Recente'}
                          </p>
                          {patientExercises.length > 0 ? (
                            <Badge variant="warning" size="sm" className="mt-0.5">
                              {patientExercises.length} exercício(s) pendente(s)
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm" className="mt-0.5">
                              Em dia
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 3: Exercícios Respondidos & Alertas Clínicos */}
        <div className="space-y-6">
          {/* Exercícios Respondidos Recentemente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Respostas de Exercícios
              </CardTitle>
              <CardDescription>Atividades concluídas pelos pacientes</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {recentCompletedAnswers.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum exercício respondido recentemente.</p>
              ) : (
                recentCompletedAnswers.map(exercise => (
                  <div
                    key={exercise.id}
                    className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-xs text-slate-800">{exercise.title}</p>
                        <p className="text-[11px] text-slate-600">
                          Paciente: <strong>{exercise.patient_name}</strong>
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        Respondido
                      </Badge>
                    </div>

                    {exercise.answer?.patient_notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-emerald-100/60 line-clamp-2">
                        "{exercise.answer.patient_notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeDate(exercise.answer?.submitted_at)}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onSelectPatient(exercise.patient_id);
                          onNavigateTab('pacientes');
                        }}
                        className="text-xs py-1 px-2.5 h-7"
                      >
                        Avaliar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Dica Clínica & Diretriz Ética */}
          <Card className="bg-gradient-to-br from-teal-50 to-slate-50 border-teal-100">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Segregação de Sigilo Ativa
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Todas as anotações clínicas inseridas como <strong>Privado do Psicólogo</strong> permanecem restritas ao seu usuário e não são acessíveis pelos pacientes.
              </p>
              <div className="pt-2 border-t border-teal-100/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Resolução CFP 01/2009 & 09/2024</span>
                <span className="font-medium text-teal-700">Proteção Ativa</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais de Ação Rápida */}
      <SessionFormModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />

      <ExerciseBuilderModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
      />

      {selectedPatientForLive && (
        <LiveSessionModal
          isOpen={isLiveSessionModalOpen}
          onClose={() => setIsLiveSessionModalOpen(false)}
          patient={selectedPatientForLive}
        />
      )}

      <PatientInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
