'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDownUp, Printer, Search } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { Patient } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { buildEvolutionEntries, buildEvolutionHtml } from '@/lib/evolution/evolution-utils';
import { answersToRows } from '@/lib/anamnesis/anamnesis-utils';
import { printHtml } from '@/lib/print';
import { formatDate } from '@/lib/utils';

const inputClass = 'px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none';

/** Aba "Evolução" do prontuário: linha do tempo do tratamento, pronta para consultar e imprimir. */
export const PatientEvolutionTab: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { sessions, anamnesisResponses, getPatientPsychometricResults, currentPsychologist } = usePsi();

  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [includeAnamnesis, setIncludeAnamnesis] = useState(true);

  const patientSessions = useMemo(() => sessions.filter(s => s.patient_id === patient.id), [sessions, patient.id]);
  const scales = getPatientPsychometricResults(patient.id);
  const entries = useMemo(
    () => buildEvolutionEntries(patientSessions, { order, query, from, to }),
    [patientSessions, order, query, from, to]
  );

  const latestAnamnesis = useMemo(
    () => anamnesisResponses
      .filter(r => r.patient_id === patient.id && r.status === 'completed')
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))[0],
    [anamnesisResponses, patient.id]
  );

  const allEntries = useMemo(() => buildEvolutionEntries(patientSessions, { order: 'asc' }), [patientSessions]);
  const withEvolution = allEntries.filter(e => e.blocks.some(b => b.label === 'Evolução observada')).length;

  const print = () => {
    printHtml(buildEvolutionHtml({
      patientName: patient.full_name,
      birthDate: patient.birth_date || undefined,
      psychologistName: currentPsychologist.profile?.full_name || 'Psicólogo(a)',
      crp: currentPsychologist.crp_number ? `${currentPsychologist.crp_number}/${currentPsychologist.crp_state}` : undefined,
      generatedAt: new Date(),
      entries,
      scales: [...scales].sort((a, b) => a.taken_at.localeCompare(b.taken_at)),
      anamnesis: includeAnamnesis && latestAnamnesis
        ? { title: latestAnamnesis.template_name, completedAt: latestAnamnesis.completed_at, rows: answersToRows(latestAnamnesis.template_snapshot, latestAnamnesis.answers) }
        : undefined,
    }));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Sessões registradas', String(allEntries.length)],
          ['Com evolução descrita', String(withEvolution)],
          ['Primeira sessão', allEntries[0] ? formatDate(allEntries[0].date) : '—'],
          ['Última sessão', allEntries.length ? formatDate(allEntries[allEntries.length - 1].date) : '—'],
        ].map(([label, value]) => (
          <div key={label} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar na evolução…" className={`${inputClass} pl-9`} aria-label="Buscar na evolução" />
          </div>
          <input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} className={inputClass} aria-label="De" />
          <input type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} className={inputClass} aria-label="Até" />
          <Button variant="outline" size="sm" onClick={() => setOrder(o => (o === 'desc' ? 'asc' : 'desc'))} className="text-xs">
            <ArrowDownUp className="w-3.5 h-3.5 mr-1.5" /> {order === 'desc' ? 'Mais recentes primeiro' : 'Mais antigas primeiro'}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {latestAnamnesis && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={includeAnamnesis} onChange={e => setIncludeAnamnesis(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
              Incluir anamnese
            </label>
          )}
          <Button variant="primary" size="sm" onClick={print} disabled={entries.length === 0} className="text-xs font-semibold">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir ficha
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <h4 className="text-base font-semibold text-slate-700">{patientSessions.length === 0 ? 'Nenhuma sessão registrada ainda' : 'Nenhuma sessão encontrada'}</h4>
          <p className="text-xs text-slate-500 mt-1">{patientSessions.length === 0 ? 'A ficha se monta sozinha conforme você registra as sessões.' : 'Ajuste a busca ou o período.'}</p>
        </div>
      ) : (
        <ol className="relative border-l-2 border-teal-100 ml-2 space-y-5">
          {entries.map(e => (
            <li key={e.id} className="ml-5 relative">
              <span className="absolute -left-[27px] top-2 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-white" aria-hidden="true" />
              <Card className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-sm text-slate-800">Sessão {e.number} <span className="font-normal text-slate-500">• {formatDate(e.date)} • <span className="capitalize">{e.modality}</span> • {e.durationMinutes} min</span></p>
                  {e.status === 'draft' && <Badge variant="warning" size="sm">Rascunho</Badge>}
                </div>
                {e.topics.length > 0 && <div className="flex flex-wrap gap-1.5">{e.topics.map(t => <Badge key={t} variant="neutral" size="sm">{t}</Badge>)}</div>}
                {e.blocks.length === 0 ? (
                  <p className="text-xs text-slate-400">Sessão sem anotações registradas.</p>
                ) : (
                  e.blocks.map(b => (
                    <p key={b.label} className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      <strong className="text-slate-600">{b.label}:</strong> {b.text}
                    </p>
                  ))
                )}
              </Card>
            </li>
          ))}
        </ol>
      )}

      {scales.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-bold text-slate-800 mb-2">Escalas aplicadas</h4>
          <ul className="divide-y divide-slate-100 text-sm">
            {[...scales].sort((a, b) => b.taken_at.localeCompare(a.taken_at)).map(s => (
              <li key={s.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-700">{formatDate(s.taken_at)} • <strong>{s.scale_name}</strong></span>
                <span className="text-slate-600">{s.total_score} pontos • {s.severity_level}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-[11px] text-slate-400">As anotações privadas (hipóteses clínicas, supervisão e risco) ficam fora da ficha e da impressão.</p>
    </div>
  );
};
