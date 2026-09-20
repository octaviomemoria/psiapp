'use client';

import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { PaymentStatus } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  APPOINTMENT_STATUS_LABEL,
  DateRange,
  PAYMENT_STATUS_LABEL,
  PaymentBucket,
  buildPaymentRows,
  formatBRL,
  isInRange,
  overdueByPatient,
  summarizePayments,
} from '@/lib/reports/report-utils';
import { downloadCsv, toCsv } from '@/lib/reports/csv';
import { formatDateTime } from '@/lib/utils';
import { EmptyReport, KpiCard, selectClass } from './ReportShared';

interface PaymentsReportProps {
  range: DateRange | null;
  onSelectPatient: (patientId: string) => void;
}

type BucketFilter = 'all' | 'overdue' | PaymentBucket;

const FILTER_LABEL: Record<BucketFilter, string> = {
  all: 'Todas as situações',
  overdue: 'Em atraso',
  pending: 'Pendentes',
  received: 'Recebidas',
  insurance: 'Convênio / Reembolso',
  free: 'Isentas / Sociais',
};

export const PaymentsReport: React.FC<PaymentsReportProps> = ({ range, onSelectPatient }) => {
  const { appointments, patients, updateAppointmentPayment } = usePsi();
  const [patientId, setPatientId] = useState('');
  const [bucket, setBucket] = useState<BucketFilter>('all');

  const nameOf = (id: string) => patients.find(p => p.id === id)?.full_name || 'Paciente';

  // O resumo considera o período e o paciente; o filtro de situação só afeta a tabela.
  const scopedRows = useMemo(
    () => buildPaymentRows(
      appointments.filter(a => isInRange(a.starts_at, range) && (!patientId || a.patient_id === patientId)),
      nameOf
    ),
    [appointments, range, patientId, patients] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const summary = useMemo(() => summarizePayments(scopedRows), [scopedRows]);
  const overdue = useMemo(() => overdueByPatient(scopedRows), [scopedRows]);
  const tableRows = scopedRows.filter(r => bucket === 'all' || (bucket === 'overdue' ? r.overdue : r.bucket === bucket));

  const exportCsv = () => {
    const rows = tableRows.map(r => [
      new Date(r.startsAt).toLocaleDateString('pt-BR'),
      r.patientName,
      r.modality,
      APPOINTMENT_STATUS_LABEL[r.appointmentStatus],
      r.price,
      PAYMENT_STATUS_LABEL[r.paymentStatus],
      r.overdue ? 'Sim' : 'Não',
    ]);
    downloadCsv('relatorio-pagamentos-sessoes.csv', toCsv(['Data', 'Paciente', 'Modalidade', 'Sessão', 'Valor (R$)', 'Pagamento', 'Em atraso'], rows));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select value={patientId} onChange={e => setPatientId(e.target.value)} className={selectClass} aria-label="Filtrar por paciente">
            <option value="">Todos os pacientes</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          <select value={bucket} onChange={e => setBucket(e.target.value as BucketFilter)} className={selectClass} aria-label="Filtrar por situação do pagamento">
            {(Object.keys(FILTER_LABEL) as BucketFilter[]).map(b => <option key={b} value={b}>{FILTER_LABEL[b]}</option>)}
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={tableRows.length === 0} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
        </Button>
      </div>

      {scopedRows.length === 0 ? (
        <EmptyReport title="Nenhuma sessão cobrável no período" hint="Cancelamentos e remarcações não geram cobrança." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard label="Recebido" value={formatBRL(summary.received)} tone="good" />
            <KpiCard label="A receber" value={formatBRL(summary.pending)} hint="inclui o que está em atraso" tone="warn" />
            <KpiCard label="Em atraso" value={formatBRL(summary.overdue)} hint="sessões realizadas sem pagamento" tone={summary.overdue > 0 ? 'bad' : 'neutral'} />
            <KpiCard label="Convênio / Reembolso" value={formatBRL(summary.insurance)} tone="info" />
            <KpiCard label="Isentas / Sociais" value={formatBRL(summary.free)} />
          </div>

          {overdue.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Inadimplência por paciente</h4>
              <ul className="divide-y divide-slate-100">
                {overdue.map(o => (
                  <li key={o.patientId} className="py-2 flex items-center justify-between text-sm">
                    <button type="button" onClick={() => onSelectPatient(o.patientId)} className="font-semibold text-teal-700 hover:underline">{o.name}</button>
                    <span className="text-slate-600">{o.sessions} sessão(ões) • <strong className="text-rose-700">{formatBRL(o.amount)}</strong></span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="divide-y divide-slate-100 overflow-hidden">
            {tableRows.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Nenhuma sessão nesta situação.</p>}
            {tableRows.map(row => (
              <div key={row.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => onSelectPatient(row.patientId)} className="hover:text-teal-700 text-left">{row.patientName}</button>
                    {row.overdue && <Badge variant="danger" size="sm">Em atraso</Badge>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(row.startsAt)} • {APPOINTMENT_STATUS_LABEL[row.appointmentStatus]} • <span className="capitalize">{row.modality}</span> • {formatBRL(row.price)}
                  </p>
                </div>
                <select
                  value={row.paymentStatus}
                  onChange={e => updateAppointmentPayment(row.id, e.target.value as PaymentStatus)}
                  aria-label={`Pagamento de ${row.patientName}`}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map(s => <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
};
