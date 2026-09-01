'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Filter,
  CreditCard,
  QrCode,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ManagerSplitBillingModal } from './ManagerSplitBillingModal';

export const ManagerFinancialView: React.FC = () => {
  const { clinic, clinicPsychologists, appointments } = usePsi();

  const [selectedMonth, setSelectedMonth] = useState('Agosto / 2026');
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  // Cálculos Consolidados
  const paidAppointments = appointments.filter(
    a => a.payment_status === 'paid_pix' || a.payment_status === 'paid_card'
  );
  const pendingAppointments = appointments.filter(a => a.payment_status === 'pending');

  const grossTotal = paidAppointments.reduce((acc, curr) => acc + (curr.price || 200), 0);
  const pendingTotal = pendingAppointments.reduce((acc, curr) => acc + (curr.price || 200), 0);

  const clinicNetRevenue = grossTotal * 0.30;
  const psychologistsTotalPayout = grossTotal * 0.70;

  // Repasses por Terapeuta
  const payouts = clinicPsychologists.map(psico => {
    // Para fins demonstrativos, calculamos o share de atendimentos
    const rate = psico.commission_rate / 100;
    const estimatedGross = grossTotal * (psico.active_patients_count / Math.max(1, clinicPsychologists.reduce((acc, p) => acc + p.active_patients_count, 0)));
    const payoutAmount = estimatedGross * rate;
    const clinicShare = estimatedGross * (1 - rate);

    return {
      psico,
      consultas: psico.active_patients_count * 4,
      gross: estimatedGross,
      payout: payoutAmount,
      clinicShare: clinicShare,
      status: psico.status === 'active' ? 'Calculado / Pronto para Repasse' : 'Em Análise'
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Financeiro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Financeiro Consolidado & Repasses da Clínica
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Acompanhe o faturamento geral, honorários recebidos e fechamento de repasses aos psicólogos parceiros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSplitModalOpen(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Configurar Split Pix / Asaas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exportar Fechamento
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">Faturamento Bruto Arrecadado</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              R$ {grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              {paidAppointments.length} sessões pagas (Pix / Cartão)
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">Repasses a Terapeutas (70%)</span>
            <p className="text-xl sm:text-2xl font-bold text-indigo-700">
              R$ {psychologistsTotalPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-indigo-600">
              Total a transferir para os profissionais
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-gradient-to-br from-purple-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">Receita Líquida da Clínica (30%)</span>
            <p className="text-xl sm:text-2xl font-bold text-purple-700">
              R$ {clinicNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-purple-600">
              Margem operacional da infraestrutura
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50/40 to-white">
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">Honorários Pendentes</span>
            <p className="text-xl sm:text-2xl font-bold text-amber-700">
              R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-amber-600">
              {pendingAppointments.length} consultas a receber
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Fechamento de Repasses da Equipe */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Tabela de Repasses por Psicólogo — {selectedMonth}
            </CardTitle>
            <CardDescription>Cálculo de repasses contratuais com base nos atendimentos realizados</CardDescription>
          </div>
          <Badge variant="purple" size="sm">
            Competência Fechada
          </Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">Profissional</th>
                <th className="p-3.5">CRP</th>
                <th className="p-3.5 text-center">Consultas no Mês</th>
                <th className="p-3.5">Faturamento Bruto</th>
                <th className="p-3.5 text-center">% Acordo</th>
                <th className="p-3.5 font-bold text-indigo-700">Valor do Repasse</th>
                <th className="p-3.5">Retenção Clínica</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    {item.psico.full_name}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {item.psico.crp}/{item.psico.crp_state}
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-800">
                    {item.consultas}
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">
                    R$ {item.gross.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center font-bold text-indigo-700">
                    {item.psico.commission_rate}%
                  </td>
                  <td className="p-3.5 font-bold text-indigo-700">
                    R$ {item.payout.toFixed(2)}
                  </td>
                  <td className="p-3.5 font-medium text-slate-600">
                    R$ {item.clinicShare.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right">
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Pronto para Pix
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ManagerSplitBillingModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
      />
    </div>
  );
};
