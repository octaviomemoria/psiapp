'use client';

import React from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Users,
  DollarSign,
  DoorClosed,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Building2,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  UserPlus,
  Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ManagerDashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({ onNavigateTab }) => {
  const { clinic, clinicPsychologists, clinicRooms, patients, appointments } = usePsi();

  // Cálculos Financeiros da Clínica
  const totalCompletedAppointments = appointments.filter(a => a.status === 'completed');
  const grossRevenue = appointments
    .filter(a => a.payment_status === 'paid_pix' || a.payment_status === 'paid_card')
    .reduce((acc, curr) => acc + (curr.price || 200), 0);

  // Estimativa de repasse médio (30% retido pela clínica, 70% repassado aos terapeutas)
  const clinicRetainedRevenue = grossRevenue * 0.30;
  const psychologistsPayout = grossRevenue * 0.70;

  const occupiedRoomsCount = clinicRooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = clinicRooms.length > 0 ? Math.round((occupiedRoomsCount / clinicRooms.length) * 100) : 0;

  // Dados para o Gráfico de Atendimentos por Terapeuta
  const chartData = clinicPsychologists.map(psi => ({
    name: psi.full_name.split(' ')[1] || psi.full_name,
    pacientes: psi.active_patients_count,
    repasse: `${psi.commission_rate}%`
  }));

  const pieData = [
    { name: 'Repasse Terapeutas (70%)', value: psychologistsPayout, color: '#6366F1' },
    { name: 'Receita Clínica (30%)', value: clinicRetainedRevenue, color: '#10B981' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header do Gestor com Selo de Proteção de Sigilo CFP */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Gestão Administrativa & Multi-Profissional</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Painel Executivo — {clinic.name}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Acompanhe o faturamento consolidado, ocupação de salas e escala dos profissionais.
          </p>

          {/* Aviso de Sigilo Profissional CFP */}
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-100">Sigilo Profissional Garantido (Resolução CFP nº 010/2005 - Art. 9º):</span>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                Notas privadas de evolução clínica, diários íntimos e testes psicológicos dos pacientes são confidenciais dos terapeutas e permanecem 100% blindados de visualização administrativa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid de KPIs da Clínica */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Faturamento Bruto</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Receita líquida clínica: R$ {clinicRetainedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-gradient-to-br from-purple-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Equipe de Terapeutas</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {clinicPsychologists.length} profissionais
            </p>
            <p className="text-[11px] text-slate-500">
              {clinicPsychologists.filter(p => p.status === 'active').length} em atendimento ativo
            </p>
          </CardContent>
        </Card>

        <Card className="border-sky-100 bg-gradient-to-br from-sky-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Ocupação das Salas</span>
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <DoorClosed className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {occupancyRate}%
            </p>
            <p className="text-[11px] text-slate-500">
              {occupiedRoomsCount} de {clinicRooms.length} salas ocupadas agora
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-gradient-to-br from-teal-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Pacientes da Clínica</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {patients.length} ativos
            </p>
            <p className="text-[11px] text-teal-700 font-medium">
              Distribuídos entre os terapeutas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Gráficos de Gestão da Clínica */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Volume de Pacientes por Psicólogo */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Pacientes Ativos por Psicólogo da Equipe
              </CardTitle>
              <CardDescription>Distribuição de atendimentos e comissão contratual</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('equipe')}
              className="text-xs"
            >
              Ver Equipe
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} pacientes ativos`, 'Atendimentos']}
                  />
                  <Bar dataKey="pacientes" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Divisão de Receitas & Repasses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Repasses vs Clínica
            </CardTitle>
            <CardDescription>Divisão contratual dos honorários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-slate-600 font-medium">Repasses dos Terapeutas (70%):</span>
                <span className="font-bold text-indigo-700">R$ {psychologistsPayout.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-slate-600 font-medium">Receita da Clínica (30%):</span>
                <span className="font-bold text-emerald-700">R$ {clinicRetainedRevenue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Status das Salas de Atendimento e Ações Rápidas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status das Salas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DoorClosed className="w-4 h-4 text-sky-600" />
                Status das Salas em Tempo Real
              </CardTitle>
              <CardDescription>Salas físicas e links de teleconsulta</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('salas')}
              className="text-xs text-indigo-700"
            >
              Gerenciar Salas
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {clinicRooms.map(room => (
              <div
                key={room.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{room.name}</h4>
                    <Badge
                      variant={
                        room.status === 'occupied'
                          ? 'warning'
                          : room.status === 'available'
                          ? 'success'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {room.status === 'occupied'
                        ? 'Ocupada'
                        : room.status === 'available'
                        ? 'Livre'
                        : 'Manutenção'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{room.description}</p>
                  {room.current_session_info && (
                    <p className="text-[11px] text-indigo-700 font-medium mt-1">
                      Em uso por {room.current_session_info.psychologist_name} (até {room.current_session_info.until})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações Rápidas do Gerente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              Ações Rápidas do Consultório
            </CardTitle>
            <CardDescription>Fluxos frequentes de administração</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <button
              onClick={() => onNavigateTab('equipe')}
              className="w-full p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 hover:bg-indigo-100/70 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cadastrar Novo Psicólogo</h4>
                  <p className="text-[11px] text-slate-500">Adicionar terapeuta, CRP e escala na equipe</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('pacientes')}
              className="w-full p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 hover:bg-teal-100/70 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Distribuir / Transferir Pacientes</h4>
                  <p className="text-[11px] text-slate-500">Reatribuir casos institucionais entre os psicólogos</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('financeiro')}
              className="w-full p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Relatório de Repasses Financeiros</h4>
                  <p className="text-[11px] text-slate-500">Emitir fechamento de honorários da clínica</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
