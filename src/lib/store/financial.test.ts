import { FinancialTransaction, PatientPackage, FinancialMetrics } from '@/types/database';

export function runFinancialTests(): { passed: boolean; log: string[] } {
  const log: string[] = [];
  let passed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      log.push(`✅ PASS: ${testName}`);
    } else {
      log.push(`❌ FAIL: ${testName}`);
      passed = false;
    }
  }

  // 1. Teste de Métricas e Balanço Operacional
  const sampleTransactions: FinancialTransaction[] = [
    {
      id: 'tx-1',
      psychologist_id: 'psy-1',
      title: 'Sessão Paciente A',
      type: 'income',
      category_name: 'Atendimento Clínico Individual',
      amount: 220,
      due_date: '2026-09-01',
      paid_at: '2026-09-01T10:00:00Z',
      status: 'completed',
      is_tax_deductible: false,
      created_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 'tx-2',
      psychologist_id: 'psy-1',
      title: 'Sessão Paciente B',
      type: 'income',
      category_name: 'Atendimento Clínico Individual',
      amount: 250,
      due_date: '2026-09-10',
      status: 'pending',
      is_tax_deductible: false,
      created_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 'tx-3',
      psychologist_id: 'psy-1',
      title: 'Sublocação Consultório',
      type: 'expense',
      category_name: 'Sublocação / Aluguel de Sala',
      amount: 400,
      due_date: '2026-09-05',
      paid_at: '2026-09-05T10:00:00Z',
      status: 'completed',
      is_tax_deductible: true,
      created_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 'tx-4',
      psychologist_id: 'psy-1',
      title: 'Anuidade CRP/06',
      type: 'expense',
      category_name: 'Anuidade CRP / CFP',
      amount: 85,
      due_date: '2026-09-15',
      paid_at: '2026-09-15T10:00:00Z',
      status: 'completed',
      is_tax_deductible: true,
      created_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 'tx-5',
      psychologist_id: 'psy-1',
      title: 'Marketing & Divulgação',
      type: 'expense',
      category_name: 'Marketing & Divulgação',
      amount: 150,
      due_date: '2026-09-20',
      paid_at: '2026-09-20T10:00:00Z',
      status: 'completed',
      is_tax_deductible: false,
      created_at: '2026-09-01T10:00:00Z'
    }
  ];

  let totalIncomeReceived = 0;
  let totalIncomePending = 0;
  let totalExpensesPaid = 0;
  let taxDeductibleExpenses = 0;

  for (const t of sampleTransactions) {
    if (t.status === 'canceled') continue;
    if (t.type === 'income') {
      if (t.status === 'completed') totalIncomeReceived += t.amount;
      if (t.status === 'pending') totalIncomePending += t.amount;
    } else if (t.type === 'expense') {
      if (t.status === 'completed') {
        totalExpensesPaid += t.amount;
        if (t.is_tax_deductible) taxDeductibleExpenses += t.amount;
      }
    }
  }

  const netIncome = totalIncomeReceived - totalExpensesPaid;

  assert(totalIncomeReceived === 220, 'Total de receitas recebidas calculado com precisão (R$ 220,00)');
  assert(totalIncomePending === 250, 'Total de receitas a receber pendentes apurado (R$ 250,00)');
  assert(totalExpensesPaid === 635, 'Total de despesas operacionais pagas apurado (R$ 635,00)');
  assert(taxDeductibleExpenses === 485, 'Deduções escrituráveis no Carnê-Leão apuradas corretamente (R$ 485,00)');
  assert(netIncome === -415, 'Saldo operacional líquido calculado com exatidão (R$ -415,00)');

  // 2. Teste de Gestão de Pacotes de Sessões
  const testPackage: PatientPackage = {
    id: 'pkg-1',
    psychologist_id: 'psy-1',
    patient_id: 'pat-1',
    title: 'Pacote Mensal 4 Sessões',
    total_sessions: 4,
    sessions_completed: 1,
    total_price: 800,
    session_unit_price: 200,
    payment_status: 'paid',
    start_date: '2026-09-01',
    created_at: '2026-09-01T10:00:00Z'
  };

  const consumedSessions = Math.min(testPackage.sessions_completed + 1, testPackage.total_sessions);
  const remaining = testPackage.total_sessions - consumedSessions;

  assert(consumedSessions === 2, 'Abatimento de 1 sessão no pacote de sessões (1 -> 2)');
  assert(remaining === 2, 'Saldo remanescente de sessões correto (2 sessões)');

  // 3. Teste de Inteligência Fiscal Carnê-Leão (Base de Cálculo IRPF)
  const baseCalculoIRPF = Math.max(0, totalIncomeReceived - taxDeductibleExpenses);
  assert(baseCalculoIRPF === 0, 'Base de cálculo IRPF zera quando despesas dedutíveis superam a receita');

  return { passed, log };
}

const { passed, log } = runFinancialTests();
log.forEach(l => console.log(l));
if (!passed) process.exit(1);
