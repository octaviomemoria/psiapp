'use client';

import React, { useState, useMemo } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  FinancialTransaction,
  PatientPackage,
  TransactionType,
  TransactionStatus
} from '@/types/database';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  FileText,
  Printer,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Trash2,
  Tag,
  ShieldCheck,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import { NewTransactionModal } from './NewTransactionModal';
import { PackageManagementModal } from './PackageManagementModal';
import { UnifiedReceiptModal } from './UnifiedReceiptModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';

interface FinancialViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({ onNavigateTab }) => {
  const {
    currentPsychologist,
    financialTransactions,
    patientPackages,
    financialCategories,
    financialMetrics,
    patients,
    updateFinancialTransaction,
    deleteFinancialTransaction,
    consumePackageSession,
    addNotification
  } = usePsi();

  const [activeSubTab, setActiveSubTab] = useState<'visao_geral' | 'extrato' | 'pacotes' | 'livro_caixa'>('visao_geral');

  // Modais
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<TransactionType>('income');
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isUnifiedReceiptModalOpen, setIsUnifiedReceiptModalOpen] = useState(false);
  const [receiptViewingTx, setReceiptViewingTx] = useState<FinancialTransaction | null>(null);

  // Filtros de Extrato
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Vazio = todos os meses

  // Formatação de Moeda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtragem de transações para o extrato
  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (selectedMonth && tx.due_date && !tx.due_date.startsWith(selectedMonth)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchCategory = tx.category_name.toLowerCase().includes(query);
        const matchResp = tx.financial_responsible_name?.toLowerCase().includes(query);
        return matchTitle || matchCategory || Boolean(matchResp);
      }
      return true;
    });
  }, [financialTransactions, typeFilter, statusFilter, selectedMonth, searchQuery]);

  // Dados para o Gráfico de Fluxo de Caixa (Últimos 6 meses)
  const chartData = useMemo(() => {
    const monthMap = new Map<string, { month: string; receitas: number; despesas: number }>();
    const now = new Date();

    // Inicializar os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // 'YYYY-MM'
      const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      monthMap.set(key, { month: formattedLabel, receitas: 0, despesas: 0 });
    }

    for (const tx of financialTransactions) {
      if (tx.status === 'canceled') continue;
      const txMonth = tx.due_date ? tx.due_date.slice(0, 7) : tx.created_at.slice(0, 7);
      if (monthMap.has(txMonth)) {
        const entry = monthMap.get(txMonth)!;
        if (tx.type === 'income') {
          entry.receitas += Number(tx.amount) || 0;
        } else if (tx.type === 'expense') {
          entry.despesas += Number(tx.amount) || 0;
        }
      }
    }

    return Array.from(monthMap.values());
  }, [financialTransactions]);

  // Distribuição de despesas por categoria
  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    let totalExp = 0;

    for (const tx of financialTransactions) {
      if (tx.type === 'expense' && tx.status !== 'canceled') {
        const amt = Number(tx.amount) || 0;
        totalExp += amt;
        const cat = tx.category_name || 'Outras';
        map.set(cat, (map.get(cat) || 0) + amt);
      }
    }

    return Array.from(map.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [financialTransactions]);

  // Ação de liquidar (1-clique)
  const handleToggleComplete = (tx: FinancialTransaction) => {
    const isNowCompleted = tx.status !== 'completed';
    const nowIso = new Date().toISOString();
    updateFinancialTransaction(tx.id, {
      status: isNowCompleted ? 'completed' : 'pending',
      paid_at: isNowCompleted ? nowIso : undefined,
      payment_method: isNowCompleted ? (tx.payment_method || 'pix') : tx.payment_method,
      receipt_number: isNowCompleted && tx.type === 'income' && !tx.receipt_number
        ? `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
        : tx.receipt_number
    });

    addNotification({
      recipient_role: 'psychologist',
      title: isNowCompleted ? 'Transação Liquidada' : 'Transação Reaberta',
      message: `${tx.title} marcada como ${isNowCompleted ? 'paga/recebida' : 'pendente'}.`,
      type: 'feedback_received',
      read: false,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Cabeçalho da Página Financeira */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gestão Financeira & Livro Caixa
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Honorários clínicos, gestão de despesas operacionais, inteligência fiscal e pacotes terapêuticos.
          </p>
        </div>

        {/* Ações Rápidas de Topo */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsUnifiedReceiptModalOpen(true)}
            className="text-xs font-semibold text-slate-700 hover:text-teal-900 border-slate-200"
          >
            <Receipt className="w-4 h-4 mr-1.5 text-teal-600" />
            Recibo Consolidado
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPackageModalOpen(true)}
            className="text-xs font-semibold text-slate-700 hover:text-teal-900 border-slate-200"
          >
            <Layers className="w-4 h-4 mr-1.5 text-teal-600" />
            + Novo Pacote
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setTxModalDefaultType('expense');
              setIsNewTxModalOpen(true);
            }}
            className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <TrendingDown className="w-4 h-4 mr-1.5 text-rose-600" />
            + Despesa
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setTxModalDefaultType('income');
              setIsNewTxModalOpen(true);
            }}
            className="bg-teal-700 hover:bg-teal-800 text-xs font-semibold shadow-xs"
          >
            <TrendingUp className="w-4 h-4 mr-1.5 text-teal-200" />
            + Receita
          </Button>
        </div>
      </div>

      {/* Cartões de Indicadores Chave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recebido */}
        <Card className="border-slate-200/80 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recebido</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialMetrics.totalIncomeReceived)}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-700 font-semibold">Liquidado</span> • honorários recebidos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Despesas Pagas */}
        <Card className="border-slate-200/80 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Despesas Pagas</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialMetrics.totalExpensesPaid)}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-rose-700 font-semibold">{formatCurrency(financialMetrics.taxDeductibleExpenses)}</span> dedutíveis IRPF
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lucro Operacional Líquido */}
        <Card className="border-slate-200/80 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Líquido</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                financialMetrics.netIncome >= 0 ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-bold ${financialMetrics.netIncome >= 0 ? 'text-teal-900' : 'text-amber-800'}`}>
                {formatCurrency(financialMetrics.netIncome)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Receitas realizadas menos custos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* A Receber / Inadimplência */}
        <Card className="border-slate-200/80 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">A Receber / Pendente</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialMetrics.totalIncomePending)}
              </h3>
              <div className="text-xs mt-1 flex items-center gap-1.5">
                {financialMetrics.overdueCount > 0 ? (
                  <span className="text-rose-600 font-bold flex items-center gap-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {financialMetrics.overdueCount} vencida(s) ({formatCurrency(financialMetrics.overdueAmount)})
                  </span>
                ) : (
                  <span className="text-slate-500">Nenhum pagamento em atraso</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegação por Sub-Abas */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('visao_geral')}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeSubTab === 'visao_geral'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Visão Geral & Gráficos
          </button>

          <button
            onClick={() => setActiveSubTab('extrato')}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeSubTab === 'extrato'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Extrato & Lançamentos ({financialTransactions.length})
          </button>

          <button
            onClick={() => setActiveSubTab('pacotes')}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeSubTab === 'pacotes'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Pacotes de Sessões ({patientPackages.length})
          </button>

          <button
            onClick={() => setActiveSubTab('livro_caixa')}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeSubTab === 'livro_caixa'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            Livro Caixa & Carnê-Leão (IRPF)
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-ABA 1: VISÃO GERAL & GRÁFICOS */}
      {/* ===================================================================== */}
      {activeSubTab === 'visao_geral' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Barras - Entradas vs Saídas */}
            <Card className="lg:col-span-2 border-slate-200/80 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  Fluxo Financeiro Semestral (Receitas vs Despesas)
                </CardTitle>
                <CardDescription className="text-xs">
                  Comparativo de entradas brutas e despesas operacionais apuradas nos últimos 6 meses.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val: number) => [formatCurrency(val), '']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                      <Bar dataKey="receitas" name="Receitas Realizadas" fill="#0d9488" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="despesas" name="Despesas Operacionais" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Despesas por Categoria */}
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-600" />
                  Composição de Despesas
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribuição proporcional dos gastos do consultório.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                {expenseBreakdown.length > 0 ? (
                  expenseBreakdown.slice(0, 5).map(item => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[170px]">{item.name}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                        />
                      </div>
                      <div className="flex justify-end text-[10px] text-slate-400">
                        {item.percentage.toFixed(1)}% do total
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nenhuma despesa registrada ainda. Clique em "+ Despesa" para registrar custos de sala, anuidade CRP ou cursos.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dicas Fiscais para Psicólogos Clínicos */}
          <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  Dica de Inteligência Tributária
                </span>
                <span className="text-xs text-slate-300">Livro Caixa • Carnê-Leão</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                Psicólogos autônomos que escrituram o Carnê-Leão podem deduzir integralmente aluguéis de salas, anuidade do CRP, materiais de teste e supervisões clínicas da sua base de cálculo do IRPF, reduzindo expressivamente o imposto a pagar.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveSubTab('livro_caixa')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold whitespace-nowrap"
            >
              Ver Relatório Fiscal
            </Button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-ABA 2: EXTRATO & LANÇAMENTOS */}
      {/* ===================================================================== */}
      {activeSubTab === 'extrato' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por descrição, paciente..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none w-48 sm:w-60"
                />
              </div>

              {/* Filtro de Tipo */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="all">Todos os Tipos</option>
                <option value="income">🟢 Apenas Receitas</option>
                <option value="expense">🔴 Apenas Despesas</option>
              </select>

              {/* Filtro de Status */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="completed">✓ Liquidados</option>
                <option value="pending">⏳ Pendentes</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {filteredTransactions.length} registro(s)
              </span>
            </div>
          </div>

          {/* Tabela de Lançamentos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50/80 font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Status / Data</th>
                      <th className="py-3 px-4">Identificação / Categoria</th>
                      <th className="py-3 px-4">Paciente / Pagador</th>
                      <th className="py-3 px-4">Valor</th>
                      <th className="py-3 px-4">Livro Caixa</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map(tx => {
                      const isCompleted = tx.status === 'completed';
                      const isIncome = tx.type === 'income';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title={isCompleted ? 'Clique para marcar como pendente' : 'Clique para marcar como liquidado'}
                                onClick={() => handleToggleComplete(tx)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {tx.due_date ? formatDate(tx.due_date) : formatDate(tx.created_at)}
                                </p>
                                <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {isCompleted ? 'Liquidado' : 'Pendente'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 text-sm">{tx.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                                {tx.category_name}
                              </span>
                              {tx.payment_method && (
                                <span className="text-[10px] text-slate-400 capitalize">
                                  via {tx.payment_method.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {tx.financial_responsible_name ? (
                              <div>
                                <p className="font-semibold text-slate-800">{tx.financial_responsible_name}</p>
                                {tx.financial_responsible_cpf && (
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    CPF: {tx.financial_responsible_cpf}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {tx.is_tax_deductible ? (
                              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                                ✓ Dedutível IRPF
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isIncome && isCompleted && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReceiptViewingTx(tx)}
                                  className="h-7 text-[11px] px-2 text-teal-700 hover:bg-teal-50"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Recibo
                                </Button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Deseja realmente excluir "${tx.title}"?`)) {
                                    deleteFinancialTransaction(tx.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Excluir lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <DollarSign className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Nenhum lançamento financeiro encontrado.</p>
                <p className="text-xs text-slate-400">
                  Clique em "+ Receita" ou "+ Despesa" acima para iniciar seu fluxo de caixa.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-ABA 3: GESTÃO DE PACOTES DE SESSÕES */}
      {/* ===================================================================== */}
      {activeSubTab === 'pacotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pacotes Terapêuticos Ativos</h3>
              <p className="text-xs text-slate-500">
                Acompanhe o saldo de sessões contratadas por paciente e dê baixa a cada atendimento realizado.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsPackageModalOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Contratar Novo Pacote
            </Button>
          </div>

          {patientPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientPackages.map(pkg => {
                const patient = patients.find(p => p.id === pkg.patient_id);
                const progress = pkg.total_sessions > 0
                  ? (pkg.sessions_completed / pkg.total_sessions) * 100
                  : 0;
                const remaining = Math.max(0, pkg.total_sessions - pkg.sessions_completed);
                const isFinished = remaining === 0;

                return (
                  <Card key={pkg.id} className="border-slate-200/80 bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                          {pkg.payment_status === 'paid' ? '🟢 Quitado' : '🟡 Pagamento Pendente'}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {formatCurrency(pkg.total_price)}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 mt-2">
                        {patient?.full_name || 'Paciente'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {pkg.title} • {formatCurrency(pkg.session_unit_price)}/sessão
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Progresso de Sessões */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Saldo de Sessões:</span>
                          <span className={isFinished ? 'text-emerald-700 font-bold' : 'text-teal-900 font-bold'}>
                            {pkg.sessions_completed} de {pkg.total_sessions} concluídas
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFinished ? 'bg-emerald-600' : 'bg-teal-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>{remaining} restante(s)</span>
                          {pkg.valid_until && <span>Validade: {formatDate(pkg.valid_until)}</span>}
                        </div>
                      </div>

                      {/* Botão de Abater Sessão */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isFinished}
                          onClick={() => {
                            consumePackageSession(pkg.id);
                            addNotification({
                              recipient_role: 'psychologist',
                              title: 'Sessão Abatida do Pacote',
                              message: `1 sessão abatida do pacote de ${patient?.full_name}. Restam ${remaining - 1}.`,
                              type: 'feedback_received',
                              read: false,
                            });
                          }}
                          className="w-full text-xs font-bold text-teal-800 hover:bg-teal-50 border-teal-200 disabled:opacity-50"
                        >
                          {isFinished ? '✓ Pacote Concluído' : '+ Abater 1 Sessão Realizada'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">Nenhum pacote contratado no momento</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Pacotes mensais facilitam a retenção de pacientes e garantem receita previsível com controle de saldo de consultas.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsPackageModalOpen(true)}
                className="bg-teal-700 hover:bg-teal-800 text-xs font-semibold"
              >
                + Criar Primeiro Pacote
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-ABA 4: LIVRO CAIXA & CARNÊ-LEÃO (RECEITA FEDERAL) */}
      {/* ===================================================================== */}
      {activeSubTab === 'livro_caixa' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  Relatório Mensal de Escrituração Contábil (Livro Caixa)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extrato estruturado para importação ou preenchimento no programa Carnê-Leão da Receita Federal.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="bg-teal-700 hover:bg-teal-800 text-xs font-semibold"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Imprimir Relatório Contábil
              </Button>
            </div>

            {/* Resumo da Base de Cálculo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Rendimentos Tributáveis Recebidos (PF)
                </span>
                <h4 className="text-xl font-bold text-emerald-950 mt-1">
                  {formatCurrency(financialMetrics.totalIncomeReceived)}
                </h4>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Total de honorários recebidos de pacientes com CPF
                </p>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Despesas de Custeio Dedutíveis
                </span>
                <h4 className="text-xl font-bold text-rose-950 mt-1">
                  - {formatCurrency(financialMetrics.taxDeductibleExpenses)}
                </h4>
                <p className="text-[11px] text-rose-700 mt-1">
                  Sublocação, anuidade CRP, supervisão e testes
                </p>
              </div>

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Base de Cálculo Efetiva IRPF
                </span>
                <h4 className="text-xl font-bold text-teal-950 mt-1">
                  {formatCurrency(Math.max(0, financialMetrics.totalIncomeReceived - financialMetrics.taxDeductibleExpenses))}
                </h4>
                <p className="text-[11px] text-teal-700 mt-1">
                  Rendimentos brutos menos deduções legais
                </p>
              </div>
            </div>

            {/* Relação de Despesas Dedutíveis Lançadas */}
            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Discriminação de Despesas Escrituráveis no Livro Caixa
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Data Competência</th>
                      <th className="py-2.5 px-4 text-left">Categoria Contábil</th>
                      <th className="py-2.5 px-4 text-left">Histórico / Descrição</th>
                      <th className="py-2.5 px-4 text-right">Valor Dedutível</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financialTransactions.filter(t => t.type === 'expense' && t.is_tax_deductible && t.status === 'completed').length > 0 ? (
                      financialTransactions
                        .filter(t => t.type === 'expense' && t.is_tax_deductible && t.status === 'completed')
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-mono">{formatDate(item.due_date || item.created_at)}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-800">{item.category_name}</td>
                            <td className="py-2.5 px-4 text-slate-600">{item.title}</td>
                            <td className="py-2.5 px-4 text-right font-bold text-rose-700">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                          Nenhuma despesa dedutível liquidada até o momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TRANSAÇÃO */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        defaultType={txModalDefaultType}
      />

      {/* MODAL: NOVO PACOTE */}
      <PackageManagementModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />

      {/* MODAL: RECIBO CONSOLIDADO */}
      <UnifiedReceiptModal
        isOpen={isUnifiedReceiptModalOpen}
        onClose={() => setIsUnifiedReceiptModalOpen(false)}
      />

      {/* MODAL / VISUALIZADOR DE RECIBO INDIVIDUAL DE TRANSAÇÃO */}
      {receiptViewingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-xl w-full p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Recibo de Honorários — {receiptViewingTx.receipt_number || 'REC-2026-001'}
              </h3>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="bg-teal-700 text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Imprimir
              </Button>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-serif leading-relaxed text-slate-800 space-y-3">
              <p className="text-justify">
                Recebi de <strong>{receiptViewingTx.financial_responsible_name || 'Paciente'}</strong>
                {receiptViewingTx.financial_responsible_cpf && (
                  <>, inscrito(a) no CPF sob nº <strong>{receiptViewingTx.financial_responsible_cpf}</strong></>
                )}
                , a importância de <strong>{formatCurrency(receiptViewingTx.amount)}</strong> referente ao serviço de <strong>{receiptViewingTx.title}</strong> prestado em <strong>{formatDate(receiptViewingTx.due_date || receiptViewingTx.created_at)}</strong>.
              </p>

              <div className="pt-6 text-center font-sans space-y-0.5">
                <div className="w-48 h-px bg-slate-300 mx-auto mb-1.5" />
                <p className="font-bold text-slate-900">
                  {currentPsychologist.profile?.full_name || 'Psicólogo(a) Responsável'}
                </p>
                <p className="text-[11px] text-slate-600">
                  CRP {currentPsychologist.crp_number || '00/000000'}/{currentPsychologist.crp_state || 'UF'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setReceiptViewingTx(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
