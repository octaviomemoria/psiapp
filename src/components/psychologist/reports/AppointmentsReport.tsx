'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { usePsi } from '@/lib/store/psi-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  APPOINTMENT_STATUS_LABEL,
  DateRange,
  appointmentsByModality,
  appointmentsByMonth,
  appointmentsByPatient,
  appointmentsByWeekday,
  computeAppointmentStats,
  formatPercent,
  isInRange,
} from '@/lib/reports/report-utils';
import { downloadCsv, toCsv } from '@/lib/reports/csv';
import { EmptyReport, KpiCard, selectClass } from './ReportShared';

interface AppointmentsReportProps {
  range: DateRange | null;
  onSelectPatient: (patientId: string) => void;
}

const MODALITY_LABEL: Record<string, string> = { online: 'Online', presencial: 'Presencial', domiciliar: 'Domiciliar' };

export const AppointmentsReport: React.FC<AppointmentsReportProps> = ({ range, onSelectPatient }) => {
  const { appointments, patients, clinicRooms } = usePsi();
  const [patientId, setPatientId] = useState('');

  const nameOf = (id: string) => patients.find(p => p.id === id)?.full_name || 'Paciente';

  const filtered = useMemo(
    () => appointments.filter(a => isInRange(a.starts_at, range) && (!patientId || a.patient_id === patientId)),
    [appointments, range, patientId]
  );

  const stats = useMemo(() => computeAppointmentStats(filtered), [filtered]);
  const byMonth = useMemo(() => appointmentsByMonth(filtered), [filtered]);
  const byWeekday = useMemo(() => appointmentsByWeekday(filtered), [filtered]);
  const byModality = useMemo(() => appointmentsByModality(filtered), [filtered]);
  const byPatient = useMemo(() => appointmentsByPatient(filtered, nameOf), [filtered, patients]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = () => {
    const rows = [...filtered]
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .map(a => [
        new Date(a.starts_at).toLocaleDateString('pt-BR'),
        new Date(a.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        nameOf(a.patient_id),
        MODALITY_LABEL[a.modality] || a.modality,
        APPOINTMENT_STATUS_LABEL[a.status],
        clinicRooms.find(r => r.id === a.room_id)?.name || '',
      ]);
    downloadCsv('relatorio-atendimentos.csv', toCsv(['Data', 'Hora', 'Paciente', 'Modalidade', 'Situação', 'Sala'], rows));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={patientId} onChange={e => setPatientId(e.target.value)} className={selectClass} aria-label="Filtrar por paciente">
          <option value="">Todos os pacientes</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyReport title="Nenhum atendimento no período" hint="Ajuste o período ou o paciente para ver os dados." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <KpiCard label="Total" value={String(stats.total)} hint={`${stats.upcoming} por vir`} />
            <KpiCard label="Realizadas" value={String(stats.completed)} hint={`${stats.hoursCompleted} h de atendimento`} tone="good" />
            <KpiCard label="Faltas" value={String(stats.noShow)} tone={stats.noShow > 0 ? 'warn' : 'neutral'} />
            <KpiCard label="Canceladas" value={String(stats.canceled)} hint={`${formatPercent(stats.cancellationRate)} do total`} tone={stats.canceled > 0 ? 'bad' : 'neutral'} />
            <KpiCard label="Comparecimento" value={formatPercent(stats.attendanceRate)} hint="realizadas ÷ (realizadas + faltas)" tone="info" />
            <KpiCard label="Remarcadas" value={String(stats.rescheduled)} />
          </div>

          {stats.unresolved > 0 && (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {stats.unresolved} atendimento(s) já passaram e continuam como agendados ou confirmados. Marque-os como realizados, falta ou cancelados na Agenda para que os números fiquem corretos.
            </p>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Atendimentos por mês</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byMonth} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="completed" name="Realizadas" stackId="a" fill="#0d9488" />
                    <Bar dataKey="no_show" name="Faltas" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="canceled" name="Canceladas" stackId="a" fill="#f43f5e" />
                    <Bar dataKey="other" name="Agendadas / outras" stackId="a" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Por dia da semana</h4>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byWeekday} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Atendimentos" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Por modalidade</h4>
                <ul className="space-y-1 text-xs text-slate-600">
                  {byModality.map(m => (
                    <li key={m.modality} className="flex justify-between"><span>{MODALITY_LABEL[m.modality] || m.modality}</span><strong className="text-slate-800">{m.count}</strong></li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-3 py-3 text-right">Total</th>
                  <th className="px-3 py-3 text-right">Realizadas</th>
                  <th className="px-3 py-3 text-right">Faltas</th>
                  <th className="px-3 py-3 text-right">Canceladas</th>
                  <th className="px-4 py-3 text-right">Comparecimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byPatient.map(row => (
                  <tr key={row.patientId} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <button type="button" onClick={() => onSelectPatient(row.patientId)} className="font-semibold text-teal-700 hover:underline text-left">{row.name}</button>
                    </td>
                    <td className="px-3 py-2.5 text-right">{row.total}</td>
                    <td className="px-3 py-2.5 text-right">{row.completed}</td>
                    <td className="px-3 py-2.5 text-right">{row.noShow}</td>
                    <td className="px-3 py-2.5 text-right">{row.canceled}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatPercent(row.attendanceRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};
