'use client';

import React from 'react';
import { PERIOD_LABELS, PeriodPreset, DateRange } from '@/lib/reports/report-utils';
import { cn } from '@/lib/utils';

export const selectClass =
  'px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-white border-slate-100 text-slate-900',
  good: 'bg-emerald-50 border-emerald-100 text-emerald-950',
  warn: 'bg-amber-50 border-amber-100 text-amber-950',
  bad: 'bg-rose-50 border-rose-100 text-rose-950',
  info: 'bg-sky-50 border-sky-100 text-sky-950',
};

export const KpiCard: React.FC<{ label: string; value: string; hint?: string; tone?: Tone }> = ({ label, value, hint, tone = 'neutral' }) => (
  <div className={cn('p-4 rounded-2xl border shadow-soft', TONE_CLASS[tone])}>
    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {hint && <p className="text-[11px] mt-1 opacity-70">{hint}</p>}
  </div>
);

export const EmptyReport: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
    <h4 className="text-base font-semibold text-slate-700">{title}</h4>
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

interface PeriodFilterProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  custom: DateRange;
  onCustomChange: (range: DateRange) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ preset, onPresetChange, custom, onCustomChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <label className="text-xs font-semibold text-slate-600" htmlFor="report-period">Período</label>
    <select id="report-period" value={preset} onChange={e => onPresetChange(e.target.value as PeriodPreset)} className={selectClass}>
      {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map(p => <option key={p} value={p}>{PERIOD_LABELS[p]}</option>)}
    </select>
    {preset === 'custom' && (
      <>
        <input type="date" value={custom.from} max={custom.to || undefined} onChange={e => onCustomChange({ ...custom, from: e.target.value })} className={selectClass} aria-label="Data inicial" />
        <span className="text-xs text-slate-400">até</span>
        <input type="date" value={custom.to} min={custom.from || undefined} onChange={e => onCustomChange({ ...custom, to: e.target.value })} className={selectClass} aria-label="Data final" />
      </>
    )}
  </div>
);
