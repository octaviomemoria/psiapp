'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Patient,
  TherapySession,
  Goal,
  AssignedExercise,
  DiaryEntry,
  MoodLog,
  PatientContent,
  GoalStatus
} from '@/types/database';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Lock,
  Share2,
  FileText,
  Target,
  ClipboardList,
  BookOpen,
  Heart,
  Smile,
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Send,
  Printer
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PrivacyBadge } from '@/components/common/PrivacyBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatDateTime, formatRelativeDate } from '@/lib/utils';
import { SessionFormModal } from './SessionFormModal';
import { ExerciseBuilderModal } from './ExerciseBuilderModal';
import { ClinicalReportModal } from './ClinicalReportModal';
import { LiveSessionModal } from './LiveSessionModal';
import { PsychometricScalesModal } from '@/components/common/PsychometricScalesModal';
import { Play, Brain } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
}

type TabType = 'overview' | 'sessions' | 'goals' | 'exercises' | 'scales' | 'diary' | 'mood' | 'contents';

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patientId, onBack }) => {
  const {
    patients,
    sessions,
    goals,
    assignedExercises,
    appointments,
    contentItems,
    patientContents,
    addGoal,
    updateGoal,
    assignExercise,
    addExerciseFeedback,
    assignContentToPatient,
    getVisibleDiaryEntriesForPsychologist,
    getPatientPsychometricResults,
    moodLogs,
    switchRole,
  } = usePsi();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<TherapySession | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);
  const [isScalesModalOpen, setIsScalesModalOpen] = useState(false);

  // Modais de Atribuição e Criação
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isExerciseBuilderOpen, setIsExerciseBuilderOpen] = useState(false);
  const [isAssignLibraryModalOpen, setIsAssignLibraryModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // Modal de Avaliação de Exercício Respondido
  const [selectedExerciseForReview, setSelectedExerciseForReview] = useState<AssignedExercise | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');

  // Form State Meta
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('Geral');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Form State Conteúdo
  const [selectedContentId, setSelectedContentId] = useState('');
  const [contentPersonalNote, setContentPersonalNote] = useState('');

  const patient = patients.find(p => p.id === patientId) || patients[0];

  const patientSessions = sessions
    .filter(s => s.patient_id === patient.id)
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

  const patientGoals = goals.filter(g => g.patient_id === patient.id);
  const patientExercises = assignedExercises
    .filter(e => e.patient_id === patient.id)
    .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());

  const sharedDiaryEntries = getVisibleDiaryEntriesForPsychologist(patient.id);
  const patientMoods = moodLogs
    .filter(m => m.patient_id === patient.id)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

  const patientAssignedContents = patientContents.filter(pc => pc.patient_id === patient.id);

  const nextAppointment = appointments
    .filter(a => a.patient_id === patient.id && (a.status === 'scheduled' || a.status === 'confirmed'))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];

  const lastSession = patientSessions[0];

  // Gráfico de Humor do Paciente
  const moodChartData = patientMoods.map(m => {
    const d = new Date(m.logged_at);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      score: m.mood_score,
      intensity: m.intensity,
      emotions: m.emotions.join(', '),
    };
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;

    addGoal({
      patient_id: patient.id,
      psychologist_id: 'psychologist-ana-martins',
      title: goalTitle,
      description: goalDescription,
      category: goalCategory,
      progress: 0,
      status: 'in_progress',
      target_date: goalTargetDate || undefined,
      visible_to_patient: true,
    });

    setGoalTitle('');
    setGoalDescription('');
    setGoalTargetDate('');
    setIsGoalModalOpen(false);
  };

  const handleAssignContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentId) return;

    assignContentToPatient(patient.id, selectedContentId, contentPersonalNote);
    setSelectedContentId('');
    setContentPersonalNote('');
    setIsContentModalOpen(false);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseForReview || !feedbackText) return;

    addExerciseFeedback(selectedExerciseForReview.id, feedbackText, clinicalObservations);
    setSelectedExerciseForReview(null);
    setFeedbackText('');
    setClinicalObservations('');
  };

  const patientPsychometrics = getPatientPsychometricResults(patient.id);

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'sessions', label: 'Sessões & Timeline', icon: Calendar, count: patientSessions.length },
    { id: 'goals', label: 'Objetivos Terapêuticos', icon: Target, count: patientGoals.length },
    { id: 'exercises', label: 'Exercícios', icon: ClipboardList, count: patientExercises.length },
    { id: 'scales', label: 'Escalas & Testes', icon: Brain, count: patientPsychometrics.length },
    { id: 'diary', label: 'Diário Compartilhado', icon: BookOpen, count: sharedDiaryEntries.length },
    { id: 'mood', label: 'Humor & Evolução', icon: Heart, count: patientMoods.length },
    { id: 'contents', label: 'Conteúdos', icon: FileText, count: patientAssignedContents.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Botão de Voltar & Header do Paciente */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-800 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Voltar para Lista de Pacientes
        </Button>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden flex-shrink-0">
              {patient.profile?.avatar_url ? (
                <img src={patient.profile.avatar_url} alt={patient.full_name} className="w-full h-full object-cover" />
              ) : (
                patient.full_name.charAt(0)
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{patient.full_name}</h1>
                <Badge variant={patient.status === 'active' ? 'success' : 'neutral'} size="sm">
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{patient.email}</span>
                <span>•</span>
                <span>{patient.phone}</span>
                <span>•</span>
                <span>Início: {formatDate(patient.started_at)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsLiveSessionModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Iniciar Sessão ao Vivo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSessionToEdit(null);
                setIsSessionModalOpen(true);
              }}
              className="font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Registrar Sessão
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScalesModalOpen(true)}
              className="text-xs text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1"
              title="Aplicar PHQ-9 ou GAD-7"
            >
              <Brain className="w-3.5 h-3.5 text-emerald-600" />
              Aplicar Escala
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
              title="Emitir Relatório de Evolução ou Declaração CFP"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Emitir Relatório / Doc
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => switchRole('patient', patient.id)}
              className="text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
              title="Testar o aplicativo com a visão deste paciente"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Ver como Paciente
            </Button>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* 1. ABA: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Demanda Clínica e Resumo do Caso */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Demanda Principal & Formulação Clínica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p className="leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {patient.clinical_notes_overview || 'Nenhuma formulação inicial registrada.'}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-500 pt-2">
                  <div>
                    <strong>Contato de Emergência:</strong> {patient.emergency_contact_name || 'Não informado'} ({patient.emergency_contact_phone || '-'})
                  </div>
                  <div>
                    <strong>Total de Sessões Realizadas:</strong> {patientSessions.length} sessões
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metas em Andamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-teal-600" />
                    Objetivos Terapêuticos Ativos
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('goals')}
                  className="text-xs text-teal-700 font-semibold"
                >
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientGoals.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhum objetivo cadastrado.</p>
                ) : (
                  patientGoals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{goal.title}</span>
                        <Badge variant="default" size="sm">{goal.progress}%</Badge>
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

            {/* Últimos Registros Emocionais */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-teal-600" />
                  Registros Emocionais Recentes
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('mood')}
                  className="text-xs text-teal-700 font-semibold"
                >
                  Ver gráficos
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientMoods.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Nenhum check-in de humor recente.</p>
                ) : (
                  patientMoods.slice(-3).reverse().map(mood => (
                    <div key={mood.id} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {mood.emotions.join(', ') || 'Registro de Humor'}
                        </p>
                        {mood.notes && <p className="text-slate-600 italic mt-0.5">"{mood.notes}"</p>}
                      </div>
                      <div className="text-right">
                        <Badge variant="default" size="sm">Intensidade {mood.intensity}/10</Badge>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(mood.logged_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral: Próxima e Última Sessão + Pendências */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-teal-50/70 to-slate-50 border-teal-100">
              <CardHeader>
                <CardTitle className="text-sm text-teal-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  Próxima Sessão Agendada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {nextAppointment ? (
                  <div className="space-y-1 text-slate-700">
                    <p className="text-base font-bold text-teal-900">{formatDateTime(nextAppointment.starts_at)}</p>
                    <p className="capitalize text-slate-600">Modalidade: {nextAppointment.modality}</p>
                    {nextAppointment.location_or_link && (
                      <p className="text-[11px] text-teal-700 truncate">{nextAppointment.location_or_link}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhuma sessão agendada para os próximos dias.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Última Sessão Realizada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-600">
                {lastSession ? (
                  <div>
                    <p className="font-semibold text-slate-800">
                      Sessão #{lastSession.session_number} • {formatDate(lastSession.session_date)}
                    </p>
                    <p className="line-clamp-3 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {lastSession.summary}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhuma sessão anterior cadastrada.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-600" />
                  Exercícios Atribuídos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patientExercises.length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhum exercício atribuído.</p>
                ) : (
                  patientExercises.slice(0, 3).map(ex => (
                    <div key={ex.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[140px]">{ex.title}</span>
                      <Badge variant={ex.status === 'completed' ? 'success' : ex.status === 'reviewed' ? 'info' : 'warning'} size="sm">
                        {ex.status === 'completed' ? 'Respondido' : ex.status === 'reviewed' ? 'Revisado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. ABA: SESSÕES & TIMELINE */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Histórico e Timeline de Sessões</h3>
              <p className="text-xs text-slate-500">Registro documental das consultas e notas privativas de sigilo.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSessionToEdit(null);
                setIsSessionModalOpen(true);
              }}
              className="font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Registrar Nova Sessão
            </Button>
          </div>

          {patientSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma sessão registrada ainda"
              description="Comece registrando o primeiro atendimento clínico deste paciente."
              actionLabel="Registrar 1ª Sessão"
              onAction={() => {
                setSessionToEdit(null);
                setIsSessionModalOpen(true);
              }}
            />
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 sm:before:left-5 before:w-0.5 before:bg-slate-200">
              {patientSessions.map(session => (
                <div key={session.id} className="relative pl-10 sm:pl-12 space-y-3">
                  {/* Ponto na timeline */}
                  <div className="absolute left-2.5 sm:left-3.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-teal-600 border-4 border-white shadow-sm" />

                  <Card className="hover:border-teal-200 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" size="sm" className="font-bold">
                            Sessão #{session.session_number}
                          </Badge>
                          <span className="text-xs text-slate-500 font-medium">
                            {formatDateTime(session.session_date)} ({session.duration_minutes} min) • <span className="capitalize">{session.modality}</span>
                          </span>
                        </div>
                        {session.main_topics && session.main_topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.main_topics.map((topic, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium">
                                #{topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSessionToEdit(session);
                          setIsSessionModalOpen(true);
                        }}
                        className="text-xs text-slate-500 hover:text-teal-700"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-4 text-sm text-slate-700 pt-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resumo Clínico</h4>
                        <p className="leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm">
                          {session.summary}
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        {session.interventions_used && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="block text-slate-700 mb-1">Técnicas / Intervenções:</strong>
                            <p className="text-slate-600">{session.interventions_used}</p>
                          </div>
                        )}
                        {session.evolution_observed && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="block text-slate-700 mb-1">Evolução Observada:</strong>
                            <p className="text-slate-600">{session.evolution_observed}</p>
                          </div>
                        )}
                      </div>

                      {(session.homework_assigned || session.next_session_plan) && (
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {session.homework_assigned && (
                            <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-100/60">
                              <strong className="block text-teal-900 mb-0.5">Tarefa de Casa / Orientação:</strong>
                              <p className="text-teal-800">{session.homework_assigned}</p>
                            </div>
                          )}
                          {session.next_session_plan && (
                            <div className="p-3 bg-sky-50/40 rounded-xl border border-sky-100/60">
                              <strong className="block text-sky-900 mb-0.5">Plano p/ Próxima Consulta:</strong>
                              <p className="text-sky-800">{session.next_session_plan}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Anotações Privadas do Terapeuta (SEGREGAÇÃO DE SIGILO) */}
                      {session.private_notes && (
                        <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-purple-900">
                              <Lock className="w-3.5 h-3.5 text-purple-700" />
                              Anotações Privadas do Psicólogo
                            </div>
                            <PrivacyBadge type="psychologist_private" size="sm" />
                          </div>

                          <p className="text-purple-900/90 leading-relaxed">
                            <strong>Hipótese & Dinâmica:</strong> {session.private_notes.private_clinical_hypothesis}
                          </p>

                          {session.private_notes.supervision_notes && (
                            <p className="text-purple-900/80">
                              <strong>Supervisão:</strong> {session.private_notes.supervision_notes}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ABA: OBJETIVOS TERAPÊUTICOS */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Objetivos Terapêuticos</h3>
              <p className="text-xs text-slate-500">Metas pactuadas para acompanhamento da evolução longitudinal.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGoalModalOpen(true)}
              className="font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Objetivo
            </Button>
          </div>

          {patientGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhum objetivo definido"
              description="Cadastre objetivos terapêuticos para orientar e medir o progresso do paciente."
              actionLabel="Adicionar Objetivo"
              onAction={() => setIsGoalModalOpen(true)}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {patientGoals.map(goal => (
                <Card key={goal.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="neutral" size="sm" className="mb-1">
                        {goal.category}
                      </Badge>
                      <h4 className="font-bold text-slate-800 text-sm">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        goal.status === 'completed'
                          ? 'success'
                          : goal.status === 'evolving'
                          ? 'info'
                          : 'default'
                      }
                      size="sm"
                    >
                      {goal.status === 'completed' ? 'Concluído' : goal.status === 'evolving' ? 'Evoluindo' : 'Em andamento'}
                    </Badge>
                  </div>

                  {/* Controle de Progresso Interativo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Progresso</span>
                      <span className="font-bold text-teal-700">{goal.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={goal.progress}
                      onChange={e => {
                        const newProgress = Number(e.target.value);
                        updateGoal(goal.id, {
                          progress: newProgress,
                          status: newProgress === 100 ? 'completed' : 'evolving',
                        });
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Prazo: {goal.target_date ? formatDate(goal.target_date) : 'Em aberto'}</span>
                    <span>Atualizado {formatRelativeDate(goal.updated_at)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ABA: EXERCÍCIOS TERAPÊUTICOS */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Exercícios & Atividades Entre Sessões</h3>
              <p className="text-xs text-slate-500">Atribuição de tarefas terapêuticas e revisão de respostas com feedback.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExerciseBuilderOpen(true)}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Criar Novo Exercício
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssignLibraryModalOpen(true)}
                className="text-xs font-semibold"
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1" />
                Atribuir da Biblioteca
              </Button>
            </div>
          </div>

          {patientExercises.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhum exercício atribuído"
              description="Atribua exercícios da biblioteca (RPD, Gratidão, Mindfulness) para este paciente realizar entre consultas."
              actionLabel="Atribuir Exercício"
              onAction={() => setIsAssignLibraryModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {patientExercises.map(exercise => (
                <Card key={exercise.id} className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base">{exercise.title}</h4>
                        <Badge
                          variant={
                            exercise.status === 'completed'
                              ? 'success'
                              : exercise.status === 'reviewed'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {exercise.status === 'completed'
                            ? 'Respondido (Aguardando Feedback)'
                            : exercise.status === 'reviewed'
                            ? 'Revisado & Feedback Enviado'
                            : 'Pendente com Paciente'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Atribuído em {formatDate(exercise.assigned_at)} • Prazo: {exercise.due_date ? formatDate(exercise.due_date) : 'Sem prazo'}
                      </p>
                    </div>

                    {exercise.answer && (
                      <Button
                        variant={exercise.status === 'completed' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedExerciseForReview(exercise);
                          setFeedbackText(exercise.feedback?.feedback_text || '');
                          setClinicalObservations(exercise.feedback?.clinical_observations || '');
                        }}
                        className="text-xs"
                      >
                        {exercise.status === 'completed' ? 'Avaliar Respostas' : 'Ver Respostas e Feedback'}
                      </Button>
                    )}
                  </div>

                  {exercise.instructions && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <strong>Instruções do Terapeuta:</strong> {exercise.instructions}
                    </div>
                  )}

                  {/* Prévia do Feedback já enviado */}
                  {exercise.feedback && (
                    <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Seu Feedback Terapêutico Enviado:
                      </div>
                      <p className="text-emerald-800 leading-relaxed">{exercise.feedback.feedback_text}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. ABA: ESCALAS & TESTES PSICOMÉTRICOS */}
      {activeTab === 'scales' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-slate-900 p-6 rounded-3xl text-white shadow-soft">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Brain className="w-3.5 h-3.5" />
                <span>Protocolos de Rastreio Padronizados</span>
              </div>
              <h3 className="text-xl font-bold">Escalas Psicométricas — {patient.full_name}</h3>
              <p className="text-xs text-emerald-100 max-w-lg">
                Monitore o escore de gravidade de Depressão (PHQ-9) e Ansiedade (GAD-7) com interpretação clínica imediata.
              </p>
            </div>

            <Button
              onClick={() => setIsScalesModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Aplicar Novo Teste
            </Button>
          </div>

          {patientPsychometrics.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="Nenhum teste psicométrico registrado"
              description="Aplique uma escala padronizada (PHQ-9 ou GAD-7) para registrar a linha de base e acompanhar a evolução dos sintomas."
              actionLabel="Aplicar Primeiro Teste"
              onAction={() => setIsScalesModalOpen(true)}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {patientPsychometrics.map((res) => (
                <Card key={res.id} className="p-5 space-y-4 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">{formatDateTime(res.taken_at)}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{res.scale_name}</h4>
                    </div>
                    <Badge
                      variant={
                        res.severity_level === 'Mínima'
                          ? 'success'
                          : res.severity_level === 'Leve'
                          ? 'info'
                          : res.severity_level === 'Moderada'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {res.severity_level}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pontuação Total</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{res.total_score} pts</span>
                  </div>

                  {res.risk_flag && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span><strong>Alerta Clínico:</strong> Pontuação no item de ideação/risco. Proceder com manejo ético protetivo.</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interpretação Diagnóstica</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      {res.clinical_interpretation}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. ABA: DIÁRIO COMPARTILHADO */}
      {activeTab === 'diary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Diário Compartilhado pelo Paciente</h3>
              <p className="text-xs text-slate-500">
                Registros voluntariamente liberados pelo paciente para o diálogo terapêutico.
              </p>
            </div>
            <PrivacyBadge type="shared" size="sm" />
          </div>

          {sharedDiaryEntries.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhuma entrada compartilhada"
              description="Por padrão, o diário do paciente nasce privado. Quando o paciente optar por compartilhar reflexões com você, elas serão exibidas aqui."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {sharedDiaryEntries.map(entry => (
                <Card key={entry.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">{formatDate(entry.entry_date)}</span>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{entry.title || 'Registro sem título'}</h4>
                    </div>
                    <Badge variant="purple" size="sm">
                      {entry.predominant_emotion} ({entry.intensity}/10)
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                    {entry.content}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. ABA: HUMOR & EVOLUÇÃO */}
      {activeTab === 'mood' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Acompanhamento Longitudinal de Humor</h3>
              <p className="text-xs text-slate-500">
                Visualização de oscilações emocionais e intensidade ao longo das semanas.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              Ferramenta de Acompanhamento (Não-Diagnóstica)
            </Badge>
          </div>

          {patientMoods.length < 2 ? (
            <EmptyState
              icon={Heart}
              title="Dados insuficientes para gráfico"
              description="Conforme o paciente realizar check-ins de humor entre as sessões, os gráficos temporais serão gerados automaticamente."
            />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Gráfico Recharts */}
              <Card className="lg:col-span-2 p-5">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-sm">Evolução do Score de Humor & Intensidade (0 a 10)</CardTitle>
                </CardHeader>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="intensity"
                        name="Intensidade Emocional"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorIntensity)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Lista dos Últimos Check-ins */}
              <Card className="p-5 space-y-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm">Últimos Check-ins</CardTitle>
                </CardHeader>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {patientMoods.slice().reverse().map(mood => (
                    <div key={mood.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {mood.mood_score === 5 ? 'Muito bem' : mood.mood_score === 4 ? 'Bem' : mood.mood_score === 3 ? 'Neutro' : 'Mal'}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDate(mood.logged_at)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Emoções: {mood.emotions.join(', ')}
                      </p>
                      {mood.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">"{mood.notes}"</p>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* 7. ABA: CONTEÚDOS E MATERIAIS */}
      {activeTab === 'contents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Conteúdos Psicoeducativos Enviados</h3>
              <p className="text-xs text-slate-500">Materiais, textos e áudios recomendados para o paciente.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsContentModalOpen(true)}
              className="font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Enviar Material
            </Button>
          </div>

          {patientAssignedContents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum material atribuído"
              description="Envie artigos, áudios guiados ou vídeos da biblioteca de psicoeducação para enriquecer o tratamento."
              actionLabel="Enviar Primeiro Material"
              onAction={() => setIsContentModalOpen(true)}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {patientAssignedContents.map(pc => (
                <Card key={pc.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="neutral" size="sm" className="mb-1">
                        {pc.content?.category || 'Psicoeducação'}
                      </Badge>
                      <h4 className="font-bold text-slate-800 text-sm">{pc.content?.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{pc.content?.description}</p>
                    </div>
                    <Badge variant={pc.status === 'completed' ? 'success' : pc.status === 'viewed' ? 'info' : 'neutral'} size="sm">
                      {pc.status === 'completed' ? 'Lido/Concluído' : pc.status === 'viewed' ? 'Aberto' : 'Não lido'}
                    </Badge>
                  </div>

                  {pc.personalized_note && (
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/60 text-xs text-teal-900">
                      <strong>Sua nota:</strong> {pc.personalized_note}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Enviado em {formatDate(pc.assigned_at)}</span>
                    <span className="capitalize">Tipo: {pc.content?.content_type}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAIS DO PERFIL */}

      {/* Modal Nova/Edição Sessão */}
      <SessionFormModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSessionToEdit(null);
        }}
        patientId={patient.id}
        sessionToEdit={sessionToEdit}
      />

      {/* Modal Novo Objetivo */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Cadastrar Objetivo Terapêutico"
        description="Defina uma meta clínica clara para acompanhar a evolução do paciente."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Objetivo *</label>
            <input
              type="text"
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              placeholder="Ex: Regulação da Ansiedade Corporativa, Comunicação Assertiva..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Critérios de Sucesso</label>
            <textarea
              value={goalDescription}
              onChange={e => setGoalDescription(e.target.value)}
              rows={2}
              placeholder="Descreva comportamentos observáveis que indicarão o alcance desta meta..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
              <select
                value={goalCategory}
                onChange={e => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Ansiedade">Ansiedade</option>
                <option value="Autoestima">Autoestima</option>
                <option value="Hábitos">Hábitos & Rotina</option>
                <option value="Relacionamentos">Relacionamentos</option>
                <option value="Comunicação">Comunicação Assertiva</option>
                <option value="Autoconhecimento">Autoconhecimento</option>
                <option value="Geral">Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prazo Estimado (Opcional)</label>
              <input
                type="date"
                value={goalTargetDate}
                onChange={e => setGoalTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsGoalModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Criar Objetivo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Construtor de Exercício */}
      <ExerciseBuilderModal
        isOpen={isExerciseBuilderOpen}
        onClose={() => setIsExerciseBuilderOpen(false)}
        targetPatientId={patient.id}
      />

      {/* Modal Atribuir Exercício da Biblioteca */}
      <Modal
        isOpen={isAssignLibraryModalOpen}
        onClose={() => setIsAssignLibraryModalOpen(false)}
        title="Atribuir Exercício da Biblioteca"
        description="Selecione um exercício pré-configurado para este paciente."
        maxWidth="xl"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Escolha o modelo desejado:</p>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {usePsi().exerciseTemplates.map(template => (
              <div key={template.id} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <Badge variant="neutral" size="sm" className="mb-0.5">{template.category}</Badge>
                  <p className="font-semibold text-sm text-slate-800">{template.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{template.description}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    assignExercise(patient.id, template.id, template.instructions, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
                    setIsAssignLibraryModalOpen(false);
                  }}
                  className="text-xs"
                >
                  Atribuir
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Avaliação de Respostas de Exercício */}
      {selectedExerciseForReview && (
        <Modal
          isOpen={Boolean(selectedExerciseForReview)}
          onClose={() => setSelectedExerciseForReview(null)}
          title={`Revisão: ${selectedExerciseForReview.title}`}
          description={`Respostas enviadas por ${selectedExerciseForReview.patient_name || patient.full_name}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveFeedback} className="space-y-5">
            {/* Exibição das Respostas */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Respostas do Paciente:</h4>
              {selectedExerciseForReview.schema_fields.map(field => {
                const answerValue = selectedExerciseForReview.answer?.responses?.[field.id];
                return (
                  <div key={field.id} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <p className="text-xs font-semibold text-slate-700">{field.label}</p>
                    <p className="text-xs text-teal-900 bg-teal-50/50 p-2 rounded-lg font-medium">
                      {answerValue !== undefined ? String(answerValue) : 'Não respondido'}
                    </p>
                  </div>
                );
              })}

              {selectedExerciseForReview.answer?.patient_notes && (
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-700">Comentário Adicional do Paciente:</p>
                  <p className="text-xs text-slate-600 italic mt-0.5">"{selectedExerciseForReview.answer.patient_notes}"</p>
                </div>
              )}
            </div>

            {/* Formulário de Feedback Clínico */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feedback Terapêutico (Visível para o Paciente) *
                </label>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  rows={3}
                  placeholder="Escreva um comentário acolhedor validando o esforço e destacando os pontos fortes da resposta..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  Observação Clínica Privativa (Apenas Psicólogo)
                </label>
                <input
                  type="text"
                  value={clinicalObservations}
                  onChange={e => setClinicalObservations(e.target.value)}
                  placeholder="Anotação para supervisão ou plano de sessão..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 bg-purple-50/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedExerciseForReview(null)}>
                Fechar
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-semibold">
                <Send className="w-3.5 h-3.5 mr-1" />
                Salvar e Enviar Feedback
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Enviar Material */}
      <Modal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        title="Enviar Material Psicoeducativo"
        description="Selecione um conteúdo da biblioteca para disponibilizar ao paciente."
      >
        <form onSubmit={handleAssignContent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Conteúdo *</label>
            <select
              value={selectedContentId}
              onChange={e => setSelectedContentId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              <option value="">Selecione um material...</option>
              {contentItems.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.category}] {c.title} ({c.content_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nota ou Orientação Personalizada</label>
            <textarea
              value={contentPersonalNote}
              onChange={e => setContentPersonalNote(e.target.value)}
              rows={2}
              placeholder="Ex: Mariana, leia este texto antes da nossa sessão de quinta-feira..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsContentModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Enviar para Paciente
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Relatório Clínico & Declaração */}
      <ClinicalReportModal
        patient={patient}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Modal de Sessão ao Vivo */}
      <LiveSessionModal
        patient={patient}
        isOpen={isLiveSessionModalOpen}
        onClose={() => setIsLiveSessionModalOpen(false)}
      />

      {/* Modal de Escalas Psicométricas */}
      <PsychometricScalesModal
        patientId={patient.id}
        isOpen={isScalesModalOpen}
        onClose={() => setIsScalesModalOpen(false)}
      />
    </div>
  );
};
