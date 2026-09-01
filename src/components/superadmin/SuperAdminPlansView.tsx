'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Building2,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const SuperAdminPlansView: React.FC = () => {
  const { saasPlans, saasTenants } = usePsi();

  const [simulatedClinics, setSimulatedClinics] = useState(25);

  // Projeção simples de faturamento com 70% no Plano Pro e 30% no Autônomo
  const projectedSimulationMRR = (simulatedClinics * 0.7 * 249.90) + (simulatedClinics * 0.3 * 89.90);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-600" />
            Planos SaaS & Estratégia de Monetização (MRR)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Defina a precificação, recursos liberados por nível de assinatura e projeções de faturamento recorrente.
          </p>
        </div>
      </div>

      {/* Grid de Planos SaaS */}
      <div className="grid md:grid-cols-3 gap-6">
        {saasPlans.map(plan => {
          const subscribersCount = saasTenants.filter(t => t.plan_code === plan.code).length;
          const planTotalMRR = subscribersCount * plan.price_monthly;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between transition-all ${
                plan.popular ? 'border-2 border-amber-500 shadow-md' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Mais Popular para Clínicas
                </div>
              )}

              <div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900">
                      {plan.name}
                    </CardTitle>
                    <Badge variant={plan.code === 'clinic_enterprise' ? 'warning' : 'purple'} size="sm">
                      {plan.max_psychologists === 1 ? '1 Terapeuta' : `Até ${plan.max_psychologists} Terapeutas`}
                    </Badge>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      R$ {plan.price_monthly.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> /mês</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <span className="text-slate-600">Assinantes Atuais:</span>
                    <span className="font-bold text-slate-900">{subscribersCount} ({planTotalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês)</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-slate-700 block">Recursos Inclusos:</span>
                    <ul className="space-y-1.5">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Editar Parâmetros do Plano
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Simulador de Escala de Faturamento MRR */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Simulador de Crescimento do SaaS (MRR & ARR)
          </CardTitle>
          <CardDescription>Estime a receita recorrente conforme a plataforma adquire novas clínicas assinantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Volume de Clínicas Assinantes: {simulatedClinics} clínicas</span>
              <span className="text-indigo-600">Meta Anual</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={simulatedClinics}
              onChange={e => setSimulatedClinics(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-xs">
              <span className="text-[11px] text-slate-500 block">MRR Projetado (Mensal)</span>
              <span className="text-lg font-extrabold text-indigo-700">
                R$ {projectedSimulationMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
              <span className="text-[11px] text-slate-500 block">ARR Projetado (Anual)</span>
              <span className="text-lg font-extrabold text-emerald-700">
                R$ {(projectedSimulationMRR * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 block">Capacidade Média</span>
              <span className="text-lg font-extrabold text-purple-700">
                ~ {Math.round(simulatedClinics * 3.8)} psicólogos atendendo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
