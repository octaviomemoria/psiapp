import assert from 'node:assert';
import { generateFinancialCsv, FinancialSessionRecord } from './export-financial';

function runFinancialExportTests() {
  console.log('🧪 Iniciando testes do exportador financeiro em padrão contábil...');

  const records: FinancialSessionRecord[] = [
    {
      id: 'sess_1',
      sessionDate: '2026-09-01',
      patientName: 'Mariana Costa',
      psychologistName: 'Dra. Beatriz Santos',
      crp: '06/123456',
      grossAmount: 180.0,
      gatewayFee: 1.78,
      netAmount: 178.22,
      status: 'paid_pix',
      paymentMethod: 'Pix Dinâmico',
    },
    {
      id: 'sess_2',
      sessionDate: '2026-09-02',
      patientName: 'Carlos Eduardo Oliveira',
      psychologistName: 'Dra. Beatriz Santos',
      crp: '06/123456',
      grossAmount: 150.0,
      gatewayFee: 1.49,
      netAmount: 148.51,
      status: 'paid_pix',
      paymentMethod: 'Pix Dinâmico',
    },
  ];

  const csv = generateFinancialCsv(records);

  // Teste 1: Presença do BOM UTF-8
  assert.strictEqual(csv.startsWith('\uFEFF'), true, 'CSV deve começar com UTF-8 BOM');
  console.log('✅ PASS: UTF-8 BOM para MS Excel');

  // Teste 2: Separador ponto e vírgula
  assert.strictEqual(csv.includes(';'), true, 'Separador de colunas deve ser ponto e vírgula');
  console.log('✅ PASS: Separador padrão Brasil (ponto-e-vírgula)');

  // Teste 3: Formatação monetária com vírgula decimal
  assert.strictEqual(csv.includes('180,00'), true, 'Valores monetários devem usar vírgula decimal');
  assert.strictEqual(csv.includes('330,00'), true, 'Linha de total deve somar 330,00 corretamente');
  console.log('✅ PASS: Formatação decimal brasileira e soma de totais');

  console.log('🎉 Todos os testes de exportação financeira passaram!');
}

runFinancialExportTests();
