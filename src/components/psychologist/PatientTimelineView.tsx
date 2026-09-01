'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Calendar,
  Activity,
  Heart,
  FileText,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Brain,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface PatientTimelineViewProps {
  patientId: string;
}

export const PatientTimelineView: React.FC<PatientTimelineViewProps> = ({ patientId }) => {
  const { patients, sessions, diaryEntries, psychometricResults } = usePsi();
  const [filterType, setFilterType] = useState<'all' | 'sessions' | 'diaries' | 'scales'>('all');

  const patient = patients.find(p => p.id === patientId) || patients[0];
  const patientSessions = sessions.filter(s => s.patient_id === patient?.id);
  const patientDiaries = diaryEntries.filter(d => d.patient_id === patient?.id);
  const patientScales = psychometricResults.filter(r => r.patient_id === patient?.id);

  // Linha do tempo unificada ordenada por data decrescente
  const timelineEvents = [
    ...patientSessions.map(s => ({
      id: `session-${s.id}`,
      type: 'session',
      date: s.session_date ? s.session_date.slice(0, 10) : '2026-08-25',
      time: s.session_date ? s.session_date.slice(11, 16) : '14:00',
      title: `Sessão #${s.session_number || '1'} — ${s.modality === 'online' ? 'Teleconsulta' : 'Presencial'}`,
      description: s.summary || s.soap_assessment || 'Sessão clínica com foco em reestruturação cognitiva e ativação comportamental.',
      badge: 'Consulta SOAP',
      badgeColor: 'purple' as const,
      icon: FileText
    })),
    ...patientDiaries.map(d => ({
      id: `diary-${d.id}`,
      type: 'diary',
      date: d.entry_date ? d.entry_date.slice(0, 10) : '2026-08-24',
      time: d.created_at ? d.created_at.slice(11, 16) : '18:30',
      title: `Diário: ${d.title || d.predominant_emotion || 'Reflexão'} (Intensidade ${d.intensity}/10)`,
      description: d.content || 'Check-in diário entre sessões registrado pelo paciente.',
      badge: `${d.predominant_emotion || 'Humor'}`,
      badgeColor: (d.intensity <= 3 ? 'success' : d.intensity >= 7 ? 'danger' : 'warning') as 'success' | 'danger' | 'warning',
      icon: Heart
    })),
    ...patientScales.map(sc => ({
      id: `scale-${sc.id}`,
      type: 'scale',
      date: sc.taken_at ? sc.taken_at.slice(0, 10) : '2026-08-20',
      time: '10:00',
      title: `Aplicação ${sc.scale_name}: Escore ${sc.total_score} (${sc.severity_level})`,
      description: sc.clinical_interpretation || `Avaliação padronizada com severidade ${sc.severity_level}.`,
      badge: 'Escala Psicométrica',
      badgeColor: 'teal' as const,
      icon: Brain
    })),
    {
      id: 'milestone-1',
      type: 'milestone',
      date: '2026-08-10',
      time: '14:00',
      title: 'Marco Terapêutico: Primeira Apresentação sem Crise de Ansiedade',
      description: 'Paciente aplicou a técnica de ancoragem sensorial 5-4-3-2-1 e descatastrofização com sucesso.',
      badge: 'Conquista Clínica',
      badgeColor: 'amber' as const,
      icon: Sparkles
    }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Dados para o gráfico de evolução do humor e sintomas
  const chartData = [
    { data: '01/Ago', humor: 2, ansiedade: 8 },
    { data: '08/Ago', humor: 3, ansiedade: 6 },
    { data: '15/Ago', humor: 2.5, ansiedade: 7 },
    { data: '22/Ago', humor: 4, ansiedade: 4 },
    { data: '29/Ago', humor: 4.2, ansiedade: 3 },
  ];

  const filteredEvents = timelineEvents.filter(e => {
    if (filterType === 'all') return true;
    if (filterType === 'sessions') return e.type === 'session';
    if (filterType === 'diaries') return e.type === 'diary';
    if (filterType === 'scales') return e.type === 'scale' || e.type === 'milestone';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Resumo Longitudinal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Timeline Terapêutica Visual 360° — {patient?.full_name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão cronológica unificada integrando sessões clínicas, diários emocionais, escalas e conquistas.
          </p>
        </div>

        {/* Filtros da Linha do Tempo */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setFilterType('sessions')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'sessions' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Sessões
          </button>
          <button
            onClick={() => setFilterType('diaries')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'diaries' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Diários
          </button>
          <button
            onClick={() => setFilterType('scales')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'scales' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Escalas & Marcos
          </button>
        </div>
      </div>

      {/* Gráfico de Evolução Longitudinal do Humor vs Ansiedade */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Curva de Evolução Longitudinal (Humor vs Ansiedade GAD-7)
              </CardTitle>
              <CardDescription className="text-xs">
                Tendência de melhora e correlação com a frequência de sessões
              </CardDescription>
            </div>
            <Badge variant="success" size="sm">
              Progresso Clínico Positivo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="data" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="humor"
                  name="Humor Autorrelatado (0-5)"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="ansiedade"
                  name="Escore GAD-7 Ansiedade (0-10)"
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Linha do Tempo Cronológica Interativa */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredEvents.map(event => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="relative group">
              {/* Ponto na linha */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                  event.type === 'session'
                    ? 'bg-purple-600 text-white'
                    : event.type === 'diary'
                    ? 'bg-teal-600 text-white'
                    : event.type === 'scale'
                    ? 'bg-sky-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>

              {/* Card do Evento */}
              <Card className="hover:border-indigo-200 hover:shadow-xs transition-all">
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {event.title}
                      </h4>
                      <Badge
                        variant={event.badgeColor as any}
                        size="sm"
                      >
                        {event.badge}
                      </Badge>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDate(event.date)} às {event.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
