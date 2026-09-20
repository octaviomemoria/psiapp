'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { DateRange, PeriodPreset, resolvePeriod } from '@/lib/reports/report-utils';
import { cn } from '@/lib/utils';
import { PeriodFilter } from './ReportShared';
import { AppointmentsReport } from './AppointmentsReport';
import { PaymentsReport } from './PaymentsReport';
import { SessionNotesReport } from './SessionNotesReport';

type ReportTab = 'appointments' | 'payments' | 'notes';

const TABS: { id: ReportTab; label: string }[] = [
  { id: 'appointments', label: 'Agendamentos e sessões' },
  { id: 'payments', label: 'Pagamento de sessões' },
  { id: 'notes', label: 'Anotações de sessões' },
];

interface ReportsViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onSelectPatient }) => {
  const [tab, setTab] = useState<ReportTab>('appointments');
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [custom, setCustom] = useState<DateRange>({ from: '', to: '' });

  const range = useMemo(() => resolvePeriod(preset, new Date(), custom), [preset, custom]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" /> Relatórios
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Atendimentos, pagamentos e anotações da sua carteira, por período.</p>
        </div>
        <PeriodFilter preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
      </div>

      {preset === 'custom' && !range && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Informe a data inicial e a final (a inicial não pode ser depois da final). Enquanto isso, os relatórios mostram todo o período.
        </p>
      )}

      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-soft flex gap-1 overflow-x-auto" role="tablist" aria-label="Tipo de relatório">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors',
              tab === t.id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'appointments' && <AppointmentsReport range={range} onSelectPatient={onSelectPatient} />}
      {tab === 'payments' && <PaymentsReport range={range} onSelectPatient={onSelectPatient} />}
      {tab === 'notes' && <SessionNotesReport range={range} onSelectPatient={onSelectPatient} />}
    </div>
  );
};
