'use client';

import React, { useMemo, useState } from 'react';
import { Download, Lock, Search } from 'lucide-react';
import { usePsi } from '@/lib/store/psi-context';
import { TherapySession } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DateRange, filterSessionNotes } from '@/lib/reports/report-utils';
import { downloadCsv, toCsv } from '@/lib/reports/csv';
import { formatDateTime } from '@/lib/utils';
import { SessionFormModal } from '../SessionFormModal';
import { EmptyReport, selectClass } from './ReportShared';

interface SessionNotesReportProps {
  range: DateRange | null;
  onSelectPatient: (patientId: string) => void;
}

export const SessionNotesReport: React.FC<SessionNotesReportProps> = ({ range, onSelectPatient }) => {
  const { sessions, patients } = usePsi();
  const [query, setQuery] = useState('');
  const [patientId, setPatientId] = useState('');
  const [editing, setEditing] = useState<TherapySession | null>(null);

  const nameOf = (id: string) => patients.find(p => p.id === id)?.full_name || 'Paciente';

  const rows = useMemo(
    () => filterSessionNotes(sessions, nameOf, { query, patientId, range }),
    [sessions, patients, query, patientId, range] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const exportCsv = () => {
    if (!window.confirm('O arquivo terá dados clínicos sensíveis dos pacientes. Guarde-o em local seguro e não o envie por canais sem proteção. Exportar mesmo assim?')) return;
    downloadCsv('relatorio-anotacoes-sessoes.csv', toCsv(
      ['Data', 'Paciente', 'Sessão nº', 'Modalidade', 'Temas', 'Resumo', 'Evolução observada', 'Tarefa', 'Plano'],
      rows.map(({ session: s, patientName }) => [
        new Date(s.session_date).toLocaleDateString('pt-BR'), patientName, s.session_number, s.modality,
        (s.main_topics || []).join(', '), s.summary, s.evolution_observed, s.homework_assigned, s.next_session_plan,
      ])
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar em resumo, temas, evolução, SOAP…"
              className={`${selectClass} w-full pl-9`}
              aria-label="Buscar nas anotações"
            />
          </div>
          <select value={patientId} onChange={e => setPatientId(e.target.value)} className={selectClass} aria-label="Filtrar por paciente">
            <option value="">Todos os pacientes</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
        </Button>
      </div>

      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
        <Lock className="w-3 h-3" /> As anotações privadas (hipóteses clínicas, supervisão, risco) não aparecem neste relatório nem na busca.
      </p>

      {rows.length === 0 ? (
        <EmptyReport title="Nenhuma anotação encontrada" hint="Ajuste a busca, o paciente ou o período." />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{rows.length} sessão(ões)</p>
          {rows.map(({ session: s, patientName, excerpt }) => (
            <Card key={s.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-slate-800">
                    <button type="button" onClick={() => onSelectPatient(s.patient_id)} className="hover:text-teal-700 text-left">{patientName}</button>
                    <span className="font-normal text-slate-500"> • sessão {s.session_number}</span>
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(s.session_date)} • <span className="capitalize">{s.modality}</span> • {s.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'draft' && <Badge variant="warning" size="sm">Rascunho</Badge>}
                  <Button variant="outline" size="sm" onClick={() => setEditing(s)} className="text-xs">Abrir</Button>
                </div>
              </div>
              {(s.main_topics || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">{s.main_topics.map(t => <Badge key={t} variant="neutral" size="sm">{t}</Badge>)}</div>
              )}
              {excerpt && <p className="text-sm text-slate-700 leading-relaxed">{excerpt}</p>}
              {s.evolution_observed && <p className="text-xs text-slate-500"><strong className="text-slate-600">Evolução:</strong> {s.evolution_observed}</p>}
            </Card>
          ))}
        </div>
      )}

      <SessionFormModal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        patientId={editing?.patient_id}
        sessionToEdit={editing}
      />
    </div>
  );
};
