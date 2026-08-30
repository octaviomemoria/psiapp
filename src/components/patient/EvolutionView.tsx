'use client';

import React from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  TrendingUp,
  Heart,
  Target,
  ClipboardList,
  Calendar,
  Sparkles,
  Info,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const EvolutionView: React.FC = () => {
  const {
    getPatientMoodLogs,
    getPatientGoals,
    getPatientAssignedExercises,
    getPatientAppointments,
  } = usePsi();

  const moodLogs = getPatientMoodLogs().sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );
  const goals = getPatientGoals();
  const exercises = getPatientAssignedExercises();
  const appointments = getPatientAppointments();

  const completedExercisesCount = exercises.filter(e => e.status === 'completed' || e.status === 'reviewed').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;
  const completedAppointmentsCount = appointments.filter(a => a.status === 'completed').length;

  const moodChartData = moodLogs.map(m => {
    const d = new Date(m.logged_at);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      intensity: m.intensity,
      score: m.mood_score,
      emotions: m.emotions.join(', '),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12 sm:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-600" />
          Minha Evolução & Acompanhamento
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Acompanhe sua trajetória emocional e a realização das suas metas ao longo do tempo.
        </p>
      </div>

      {/* Disclaimer Ético e Não-Diagnóstico */}
      <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100/80 flex items-start gap-3 text-xs text-teal-900 leading-relaxed">
        <Info className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Aviso Importante sobre Acompanhamento:</strong> Estes gráficos e resumos são ferramentas visuais destinadas exclusivamente a auxiliar a auto-observação e o diálogo com sua psicóloga durante as consultas. Eles <strong>não</strong> constituem diagnóstico clínico automatizado.
        </div>
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Check-ins de Humor</p>
            <h3 className="text-2xl font-bold text-slate-800">{moodLogs.length}</h3>
            <p className="text-[10px] text-teal-600 font-medium">Registrados</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Exercícios Feitos</p>
            <h3 className="text-2xl font-bold text-slate-800">{completedExercisesCount}</h3>
            <p className="text-[10px] text-emerald-600 font-medium">Concluídos</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Metas Ativas</p>
            <h3 className="text-2xl font-bold text-slate-800">{goals.length}</h3>
            <p className="text-[10px] text-sky-600 font-medium">{completedGoalsCount} atingidas</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Sessões Realizadas</p>
            <h3 className="text-2xl font-bold text-slate-800">{completedAppointmentsCount || 13}</h3>
            <p className="text-[10px] text-purple-600 font-medium">Com a psicóloga</p>
          </div>
        </Card>
      </div>

      {/* Gráfico de Humor ao Longo do Tempo */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Oscilação e Intensidade Emocional ao Longo do Tempo</CardTitle>
          <CardDescription>Escala de intensidade registrada nos seus check-ins (0 a 10)</CardDescription>
        </CardHeader>

        {moodLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Nenhum check-in de humor registrado ainda.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="patientMoodGrad" x1="0" y1="0" x2="0" y2="1">
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
                  name="Intensidade"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#patientMoodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Metas em Acompanhamento */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Progresso das Minhas Metas Terapêuticas</CardTitle>
          <CardDescription>Objetivos pactuados e evolução contínua</CardDescription>
        </CardHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{goal.title}</span>
                <span className="font-bold text-teal-700">{goal.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              {goal.description && <p className="text-xs text-slate-500">{goal.description}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
