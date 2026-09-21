import type { PsychometricResult, TherapySession } from '@/types/database';
import type { AnswerRow } from '@/lib/anamnesis/anamnesis-utils';
import { formatDate } from '@/lib/utils';

export interface EvolutionBlock {
  label: string;
  text: string;
}

export interface EvolutionEntry {
  id: string;
  date: string;
  number: number;
  modality: string;
  durationMinutes: number;
  status: TherapySession['status'];
  topics: string[];
  blocks: EvolutionBlock[];
}

const BLOCKS: { label: string; pick: (s: TherapySession) => string | undefined }[] = [
  { label: 'Evolução observada', pick: s => s.evolution_observed },
  { label: 'Resumo da sessão', pick: s => s.summary },
  { label: 'Subjetivo (S)', pick: s => s.soap_subjective },
  { label: 'Objetivo (O)', pick: s => s.soap_objective },
  { label: 'Avaliação (A)', pick: s => s.soap_assessment },
  { label: 'Plano (P)', pick: s => s.soap_plan },
  { label: 'Intervenções utilizadas', pick: s => s.interventions_used },
  { label: 'Tarefa proposta', pick: s => s.homework_assigned },
  { label: 'Plano para a próxima sessão', pick: s => s.next_session_plan },
];

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Linha do tempo de evolução de um paciente. Usa apenas os campos do registro da sessão; as anotações privadas
 * (`private_notes`) não são lidas aqui, porque esta ficha pode ser impressa ou entregue.
 */
export function buildEvolutionEntries(
  sessions: TherapySession[],
  options: { order?: 'asc' | 'desc'; query?: string; from?: string; to?: string } = {}
): EvolutionEntry[] {
  const query = fold((options.query || '').trim());
  const direction = options.order === 'asc' ? 1 : -1;

  return sessions
    .map(s => ({
      id: s.id,
      date: s.session_date,
      number: s.session_number,
      modality: s.modality,
      durationMinutes: s.duration_minutes,
      status: s.status,
      topics: s.main_topics || [],
      blocks: BLOCKS.map(b => ({ label: b.label, text: (b.pick(s) || '').trim() })).filter(b => b.text),
    }))
    .filter(e => {
      const day = e.date.slice(0, 10);
      if (options.from && day < options.from) return false;
      if (options.to && day > options.to) return false;
      if (!query) return true;
      return fold([...e.topics, ...e.blocks.map(b => b.text)].join(' ')).includes(query);
    })
    .sort((a, b) => direction * (new Date(a.date).getTime() - new Date(b.date).getTime()));
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const paragraphs = (text: string) => escapeHtml(text).replace(/\n/g, '<br>');
// formatDate trata "YYYY-MM-DD" como dia de calendário (new Date() recuaria um dia no fuso do Brasil).
const brDate = (iso: string) => formatDate(iso);

export interface EvolutionDocument {
  patientName: string;
  birthDate?: string;
  psychologistName: string;
  crp?: string;
  generatedAt: Date;
  entries: EvolutionEntry[];
  scales?: Pick<PsychometricResult, 'taken_at' | 'scale_name' | 'total_score' | 'severity_level'>[];
  anamnesis?: { title: string; completedAt?: string | null; rows: AnswerRow[] };
  /** "anamnesis" imprime só a anamnese (sem lista de sessões, escalas nem aviso de anotações privadas). */
  mode?: 'evolution' | 'anamnesis';
}

/** Documento imprimível da ficha de evolução. Todo texto digitado passa por escapeHtml. */
export function buildEvolutionHtml(doc: EvolutionDocument): string {
  const anamnesisOnly = doc.mode === 'anamnesis';
  const entries = doc.entries
    .map(e => `
      <section class="entry">
        <h3>Sessão ${e.number} — ${brDate(e.date)} <small>${escapeHtml(e.modality)} · ${e.durationMinutes} min${e.status === 'draft' ? ' · rascunho' : ''}</small></h3>
        ${e.topics.length ? `<p class="topics">Temas: ${escapeHtml(e.topics.join(', '))}</p>` : ''}
        ${e.blocks.map(b => `<p><strong>${escapeHtml(b.label)}:</strong> ${paragraphs(b.text)}</p>`).join('')}
      </section>`)
    .join('');

  const scales = doc.scales && doc.scales.length
    ? `<h2>Escalas aplicadas</h2><table><tr><th>Data</th><th>Escala</th><th>Pontuação</th><th>Classificação</th></tr>${
        doc.scales.map(s => `<tr><td>${brDate(s.taken_at)}</td><td>${escapeHtml(s.scale_name)}</td><td>${s.total_score}</td><td>${escapeHtml(s.severity_level)}</td></tr>`).join('')
      }</table>`
    : '';

  const anamnesis = doc.anamnesis
    ? `<h2>Anamnese — ${escapeHtml(doc.anamnesis.title)}${doc.anamnesis.completedAt ? ` <small>(concluída em ${brDate(doc.anamnesis.completedAt)})</small>` : ''}</h2>${
        doc.anamnesis.rows.map(r => r.kind === 'section'
          ? `<h4>${escapeHtml(r.label)}</h4>`
          : `<p><strong>${escapeHtml(r.label)}</strong><br>${paragraphs(r.text)}</p>`).join('')
      }`
    : '';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${anamnesisOnly ? 'Anamnese' : 'Ficha de evolução'} — ${escapeHtml(doc.patientName)}</title>
<style>
  body{font-family:Georgia,serif;color:#1e293b;margin:32px;line-height:1.5;font-size:13px}
  h1{font-size:20px;margin:0 0 4px} h2{font-size:16px;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-top:28px}
  h3{font-size:14px;margin:18px 0 4px} h3 small{font-weight:normal;color:#64748b} h4{margin:14px 0 4px;color:#0f766e}
  .meta{color:#475569;font-size:12px} .entry{page-break-inside:avoid;border-left:3px solid #99f6e4;padding-left:12px;margin-bottom:14px}
  .topics{color:#64748b;margin:0 0 6px} p{margin:4px 0}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #cbd5e1;padding:4px 8px;text-align:left}
  footer{margin-top:36px;font-size:11px;color:#64748b;border-top:1px solid #cbd5e1;padding-top:8px}
</style></head><body>
  <h1>${anamnesisOnly ? 'Anamnese' : 'Ficha de evolução'}</h1>
  <p class="meta"><strong>${escapeHtml(doc.patientName)}</strong>${doc.birthDate ? ` · nascimento ${brDate(doc.birthDate)}` : ''}<br>
  ${escapeHtml(doc.psychologistName)}${doc.crp ? ` · CRP ${escapeHtml(doc.crp)}` : ''} · emitida em ${doc.generatedAt.toLocaleDateString('pt-BR')}</p>
  ${anamnesis}
  ${anamnesisOnly ? '' : `<h2>Evolução por sessão (${doc.entries.length})</h2>
  ${entries || '<p>Nenhuma sessão registrada.</p>'}
  ${scales}`}
  <footer>Documento sigiloso, de uso profissional (Resolução CFP nº 001/2009).${anamnesisOnly ? '' : ' Anotações privadas do profissional não constam nesta ficha.'}</footer>
</body></html>`;
}
