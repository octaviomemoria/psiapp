'use client';

import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { PaymentStatus, Patient } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  APPOINTMENT_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  buildPatientFinancial,
  formatBRL,
} from '@/lib/reports/report-utils';
import { downloadCsv, toCsv } from '@/lib/reports/csv';
import { formatDate, formatDateTime } from '@/lib/utils';
import { EmptyReport, KpiCard } from './ReportShared';

/** Aba "Financeiro" do prontuário: sessões, pacotes e lançamentos de um único paciente. */
export const PatientFinancialTab: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { appointments, financialTransactions, patientPackages, updateAppointmentPayment } = usePsi();

  const data = useMemo(
    () => buildPatientFinancial(patient.id, appointments, financialTransactions, patientPackages, () => patient.full_name),
    [patient.id, patient.full_name, appointments, financialTransactions, patientPackages]
  );

  const exportCsv = () => {
    const rows = [
      ...data.sessions.map(s => [
        new Date(s.startsAt).toLocaleDateString('pt-BR'), 'Sessão', APPOINTMENT_STATUS_LABEL[s.appointmentStatus], s.price, PAYMENT_STATUS_LABEL[s.paymentStatus],
      ]),
      ...data.otherTransactions.map(t => [
        t.due_date ? new Date(`${t.due_date}T12:00:00`).toLocaleDateString('pt-BR') : '', t.title, t.category_name, t.amount, t.status === 'completed' ? 'Pago' : 'Pendente',
      ]),
    ];
    downloadCsv(`financeiro-${patient.full_name.split(' ')[0].toLowerCase()}.csv`, toCsv(['Data', 'Descrição', 'Detalhe', 'Valor (R$)', 'Situação'], rows));
  };

  const hasAnything = data.sessions.length > 0 || data.otherTransactions.length > 0 || data.packages.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Sessões cobradas pelo status de pagamento do atendimento, mais pacotes e lançamentos avulsos deste paciente.</p>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!hasAnything} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
        </Button>
      </div>

      {!hasAnything ? (
        <EmptyReport title="Nenhum lançamento financeiro para este paciente" hint="Agende sessões ou registre um pacote para acompanhar valores aqui." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Recebido" value={formatBRL(data.totalReceived)} tone="good" />
            <KpiCard label="A receber" value={formatBRL(data.totalPending)} tone="warn" />
            <KpiCard label="Em atraso" value={formatBRL(data.sessionSummary.overdue)} hint="sessões realizadas sem pagamento" tone={data.sessionSummary.overdue > 0 ? 'bad' : 'neutral'} />
            <KpiCard label="Convênio / Isentas" value={formatBRL(data.sessionSummary.insurance + data.sessionSummary.free)} tone="info" />
          </div>

          {data.packages.length > 0 && (
            <Card className="p-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-800">Pacotes</h4>
              {data.packages.map(p => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-t border-slate-100 pt-2 first:border-0 first:pt-0">
                  <div>
                    <p className="font-semibold text-slate-800">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.sessions_completed} de {p.total_sessions} sessões usadas • {p.remaining} restante(s) • {formatBRL(p.total_price)}</p>
                  </div>
                  <Badge variant={p.payment_status === 'paid' ? 'success' : p.payment_status === 'partially_paid' ? 'warning' : 'danger'} size="sm">
                    {p.payment_status === 'paid' ? 'Pago' : p.payment_status === 'partially_paid' ? 'Parcial' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </Card>
          )}

          {data.sessions.length > 0 && (
            <Card className="divide-y divide-slate-100 overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 p-4">Sessões</h4>
              {data.sessions.map(row => (
                <div key={row.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      {formatDateTime(row.startsAt)}
                      {row.overdue && <Badge variant="danger" size="sm">Em atraso</Badge>}
                    </p>
                    <p className="text-xs text-slate-500">{APPOINTMENT_STATUS_LABEL[row.appointmentStatus]} • {formatBRL(row.price)}</p>
                  </div>
                  <select
                    value={row.paymentStatus}
                    onChange={e => updateAppointmentPayment(row.id, e.target.value as PaymentStatus)}
                    aria-label={`Pagamento da sessão de ${formatDate(row.startsAt)}`}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map(s => <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
              ))}
            </Card>
          )}

          {data.otherTransactions.length > 0 && (
            <Card className="divide-y divide-slate-100 overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 p-4">Outros lançamentos (pacotes e avulsos)</h4>
              {data.otherTransactions.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.category_name} • {formatDate(t.due_date)}</p>
                  </div>
                  <span className="flex items-center gap-2">
                    <strong>{formatBRL(t.amount)}</strong>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status === 'completed' ? 'Pago' : 'Pendente'}</Badge>
                  </span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
};
