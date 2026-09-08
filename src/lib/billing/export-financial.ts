/**
 * Exportador Financeiro para Contabilidade & Livro Caixa (Padrão Brasil / Excel)
 * Gera CSV com separador ponto-e-vírgula e UTF-8 BOM para abertura perfeita no Excel.
 */

export interface FinancialSessionRecord {
  id: string;
  sessionDate: string;
  patientName: string;
  psychologistName: string;
  crp: string;
  grossAmount: number;
  gatewayFee: number;
  netAmount: number;
  status: 'paid_pix' | 'pending' | 'canceled' | 'paid_card';
  paymentMethod: string;
}

/**
 * Converte a lista de sessões em CSV compatível com o Excel brasileiro
 */
export function generateFinancialCsv(records: FinancialSessionRecord[]): string {
  // UTF-8 BOM para garantir acentuação correta no MS Excel
  const BOM = '\uFEFF';

  const headers = [
    'ID da Sessão',
    'Data',
    'Paciente',
    'Psicólogo(a)',
    'CRP',
    'Valor Bruto (R$)',
    'Taxa Gateway (R$)',
    'Valor Líquido (R$)',
    'Status',
    'Meio de Pagamento',
  ];

  const rows = records.map(r => {
    const statusLabel =
      r.status === 'paid_pix'
        ? 'Pago (Pix)'
        : r.status === 'paid_card'
        ? 'Pago (Cartão)'
        : r.status === 'pending'
        ? 'Pendente'
        : 'Cancelado';

    return [
      r.id,
      r.sessionDate,
      `"${r.patientName.replace(/"/g, '""')}"`,
      `"${r.psychologistName.replace(/"/g, '""')}"`,
      r.crp,
      r.grossAmount.toFixed(2).replace('.', ','),
      r.gatewayFee.toFixed(2).replace('.', ','),
      r.netAmount.toFixed(2).replace('.', ','),
      statusLabel,
      r.paymentMethod,
    ].join(';');
  });

  // Totais
  const totalGross = records.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalFees = records.reduce((acc, r) => acc + r.gatewayFee, 0);
  const totalNet = records.reduce((acc, r) => acc + r.netAmount, 0);

  const summaryRow = [
    'TOTAIS',
    '',
    '',
    '',
    '',
    totalGross.toFixed(2).replace('.', ','),
    totalFees.toFixed(2).replace('.', ','),
    totalNet.toFixed(2).replace('.', ','),
    `${records.length} sessões`,
    '',
  ].join(';');

  return BOM + [headers.join(';'), ...rows, '', summaryRow].join('\r\n');
}

/**
 * Dispara o download do arquivo CSV no navegador
 */
export function downloadFinancialCsv(records: FinancialSessionRecord[], filename = 'relatorio-financeiro-psiapp.csv'): void {
  if (typeof window === 'undefined') return;

  const csvContent = generateFinancialCsv(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
