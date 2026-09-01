'use client';

import React from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Crown,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  Activity,
  Server,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SuperAdminDashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const SuperAdminDashboardView: React.FC<SuperAdminDashboardViewProps> = ({ onNavigateTab }) => {
  const { saasTenants, saasPlans, platformLogs } = usePsi();

  const totalMRR = saasTenants
    .filter(t => t.status === 'active' || t.status === 'trial')
    .reduce((acc, curr) => acc + curr.monthly_mrr, 0);

  const projectedARR = totalMRR * 12;
  const activeTenants = saasTenants.filter(t => t.status === 'active').length;
  const totalPsychologistsInNetwork = saasTenants.reduce((acc, curr) => acc + curr.psychologists_count, 0);

  const mrrEvolutionData = [
    { month: 'Mar', mrr: 450 },
    { month: 'Abr', mrr: 690 },
    { month: 'Mai', mrr: 940 },
    { month: 'Jun', mrr: 1180 },
    { month: 'Jul', mrr: 1320 },
    { month: 'Ago', mrr: totalMRR },
  ];

  const planDistribution = [
    { name: 'Psicólogo Autônomo', value: saasTenants.filter(t => t.plan_code === 'single').length, color: '#0D9488' },
    { name: 'Clínica Pro', value: saasTenants.filter(t => t.plan_code === 'clinic_pro').length, color: '#6366F1' },
    { name: 'Clínica Enterprise', value: saasTenants.filter(t => t.plan_code === 'clinic_enterprise').length, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Executivo SaaS */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-card border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Tenant Master Control</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Plataforma SaaS PsiApp — Painel do Dono
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Monitore a receita recorrente de assinaturas (MRR), novas clínicas contratadas, limites de profissionais e telemetria de produção.
          </p>
        </div>
      </div>

      {/* Grid de KPIs do SaaS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/40 via-white to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>MRR da Plataforma</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ARR Projetado: R$ {projectedARR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Clínicas & Consultórios</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {saasTenants.length} tenants
            </p>
            <p className="text-[11px] text-indigo-600 font-medium">
              {activeTenants} ativas • 1 em trial
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-gradient-to-br from-teal-50/40 via-white to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Terapeutas na Rede</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {totalPsychologistsInNetwork} psicólogos
            </p>
            <p className="text-[11px] text-teal-700 font-medium">
              Atendendo pacientes pelo PsiApp
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Saúde da Infraestrutura</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">
              99.98% Uptime
            </p>
            <p className="text-[11px] text-slate-500">
              Supabase PostgreSQL & Edge Online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Crescimento do SaaS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução de MRR */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Crescimento da Receita Recorrente (MRR)
              </CardTitle>
              <CardDescription>Evolução mensal de assinaturas pagas do PsiApp</CardDescription>
            </div>
            <Badge variant="success" size="sm">
              + 18.5% este mês
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrEvolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'MRR']}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorMRR)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Planos SaaS */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Mix de Assinantes
            </CardTitle>
            <CardDescription>Distribuição de planos ativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {planDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} clínica(s)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Globais & Status de Segurança */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gestão de Tenants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Clínicas Assinantes Recentes
              </CardTitle>
              <CardDescription>Últimos cadastros e status financeiro</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('clinicas')}
              className="text-xs text-indigo-700"
            >
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {saasTenants.slice(0, 3).map(tenant => (
              <div
                key={tenant.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{tenant.clinic_name}</h4>
                  <p className="text-[11px] text-slate-500">{tenant.owner_name} • {tenant.owner_email}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-emerald-700 block">R$ {tenant.monthly_mrr.toFixed(2)}/mês</span>
                  <Badge
                    variant={tenant.status === 'active' ? 'success' : tenant.status === 'trial' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {tenant.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status das Integrações da Plataforma */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Status dos Serviços Globais
            </CardTitle>
            <CardDescription>Conectividade com banco de dados, storage e APIs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-900">Supabase PostgreSQL (Multi-Tenant RLS)</span>
              </div>
              <Badge variant="success" size="sm">Operacional (0ms lag)</Badge>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-900">Vercel Edge Network & CDN</span>
              </div>
              <Badge variant="success" size="sm">Global Active</Badge>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-700" />
                <span className="font-bold text-indigo-900">Assistente de IA Ética Supervisionada</span>
              </div>
              <Badge variant="info" size="sm">Online</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
