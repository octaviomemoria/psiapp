import { endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type {
  Appointment,
  AppointmentStatus,
  FinancialTransaction,
  PatientPackage,
  PaymentStatus,
  SessionModality,
  TherapySession,
} from '@/types/database';
import { dayKey } from '@/lib/calendar/schedule-utils';

// ---------------------------------------------------------------------------
// Período
// ---------------------------------------------------------------------------

/** Datas locais "yyyy-MM-dd", ambas inclusivas. */
export interface DateRange {
  from: string;
  to: string;
}

export type PeriodPreset = 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'this_year' | 'all' | 'custom';

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  this_month: 'Este mês',
  last_month: 'Mês passado',
  last_30_days: 'Últimos 30 dias',
  last_90_days: 'Últimos 90 dias',
  this_year: 'Este ano',
  all: 'Todo o período',
  custom: 'Personalizado',
};

/** null significa "sem filtro de período". */
export function resolvePeriod(preset: PeriodPreset, now: Date = new Date(), custom?: DateRange): DateRange | null {
  switch (preset) {
    case 'this_month':
      return { from: dayKey(startOfMonth(now)), to: dayKey(endOfMonth(now)) };
    case 'last_month': {
      const last = subMonths(now, 1);
      return { from: dayKey(startOfMonth(last)), to: dayKey(endOfMonth(last)) };
    }
    case 'last_30_days':
      return { from: dayKey(subDays(now, 29)), to: dayKey(now) };
    case 'last_90_days':
      return { from: dayKey(subDays(now, 89)), to: dayKey(now) };
    case 'this_year':
      return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
    case 'custom':
      return custom && custom.from && custom.to && custom.from <= custom.to ? custom : null;
    default:
      return null;
  }
}

export function isInRange(iso: string, range: DateRange | null): boolean {
  if (!range) return true;
  const key = dayKey(iso);
  return key >= range.from && key <= range.to;
}

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatPercent = (value: number | null): string => (value === null ? '—' : `${Math.round(value * 100)}%`);

// ---------------------------------------------------------------------------
// Agendamentos e sessões
// ---------------------------------------------------------------------------

export interface AppointmentStats {
  total: number;
  completed: number;
  noShow: number;
  canceled: number;
  rescheduled: number;
  /** Agendadas ou confirmadas que ainda vão acontecer. */
  upcoming: number;
  /** Agendadas ou confirmadas cujo horário já passou sem serem concluídas, faltadas ou canceladas. */
  unresolved: number;
  /** Realizadas / (realizadas + faltas). Cancelamentos avisados não contam como falta. */
  attendanceRate: number | null;
  cancellationRate: number | null;
  hoursCompleted: number;
}

export function computeAppointmentStats(appointments: Appointment[], now: Date = new Date()): AppointmentStats {
  const stats: AppointmentStats = {
    total: appointments.length, completed: 0, noShow: 0, canceled: 0, rescheduled: 0,
    upcoming: 0, unresolved: 0, attendanceRate: null, cancellationRate: null, hoursCompleted: 0,
  };
  let completedMs = 0;

  for (const a of appointments) {
    switch (a.status) {
      case 'completed':
        stats.completed++;
        completedMs += Math.max(0, new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime());
        break;
      case 'no_show': stats.noShow++; break;
      case 'canceled': stats.canceled++; break;
      case 'rescheduled': stats.rescheduled++; break;
      default:
        if (new Date(a.ends_at).getTime() < now.getTime()) stats.unresolved++;
        else stats.upcoming++;
    }
  }

  const attended = stats.completed + stats.noShow;
  stats.attendanceRate = attended > 0 ? stats.completed / attended : null;
  stats.cancellationRate = stats.total > 0 ? stats.canceled / stats.total : null;
  stats.hoursCompleted = Math.round((completedMs / 3_600_000) * 10) / 10;
  return stats;
}

export interface MonthBucket {
  key: string;
  label: string;
  completed: number;
  no_show: number;
  canceled: number;
  other: number;
}

export function appointmentsByMonth(appointments: Appointment[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>();
  for (const a of appointments) {
    const key = dayKey(a.starts_at).slice(0, 7);
    let bucket = map.get(key);
    if (!bucket) {
      const [y, m] = key.split('-').map(Number);
      bucket = { key, label: format(new Date(y, m - 1, 1), 'MMM/yy', { locale: ptBR }), completed: 0, no_show: 0, canceled: 0, other: 0 };
      map.set(key, bucket);
    }
    if (a.status === 'completed') bucket.completed++;
    else if (a.status === 'no_show') bucket.no_show++;
    else if (a.status === 'canceled') bucket.canceled++;
    else bucket.other++;
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Cancelados e remarcados liberaram o horário; faltas não (o horário estava reservado). */
const heldSlot = (status: AppointmentStatus) => status !== 'canceled' && status !== 'rescheduled';

/** Atendimentos com horário reservado por dia da semana. */
export function appointmentsByWeekday(appointments: Appointment[]): { label: string; count: number }[] {
  const counts = new Array(7).fill(0);
  for (const a of appointments) if (heldSlot(a.status)) counts[new Date(a.starts_at).getDay()]++;
  return counts.map((count, i) => ({ label: WEEKDAY_SHORT[i], count }));
}

export function appointmentsByModality(appointments: Appointment[]): { modality: SessionModality; count: number }[] {
  const counts: Record<string, number> = {};
  for (const a of appointments) if (heldSlot(a.status)) counts[a.modality] = (counts[a.modality] || 0) + 1;
  return Object.entries(counts)
    .map(([modality, count]) => ({ modality: modality as SessionModality, count }))
    .sort((a, b) => b.count - a.count);
}

export interface PatientAppointmentRow {
  patientId: string;
  name: string;
  total: number;
  completed: number;
  noShow: number;
  canceled: number;
  attendanceRate: number | null;
}

export function appointmentsByPatient(appointments: Appointment[], patientName: (id: string) => string): PatientAppointmentRow[] {
  const map = new Map<string, PatientAppointmentRow>();
  for (const a of appointments) {
    let row = map.get(a.patient_id);
    if (!row) {
      row = { patientId: a.patient_id, name: patientName(a.patient_id), total: 0, completed: 0, noShow: 0, canceled: 0, attendanceRate: null };
      map.set(a.patient_id, row);
    }
    row.total++;
    if (a.status === 'completed') row.completed++;
    else if (a.status === 'no_show') row.noShow++;
    else if (a.status === 'canceled') row.canceled++;
  }
  for (const row of map.values()) {
    const attended = row.completed + row.noShow;
    row.attendanceRate = attended > 0 ? row.completed / attended : null;
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  completed: 'Realizada',
  canceled: 'Cancelada',
  no_show: 'Faltou',
  rescheduled: 'Remarcada',
};

// ---------------------------------------------------------------------------
// Pagamento de sessões
// ---------------------------------------------------------------------------

export type PaymentBucket = 'received' | 'pending' | 'insurance' | 'free';

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  paid_pix: 'Pago via Pix',
  paid_card: 'Pago via Cartão',
  insurance: 'Convênio / Reembolso',
  free: 'Isento / Social',
};

export function paymentBucket(status: PaymentStatus | undefined): PaymentBucket {
  if (status === 'paid_pix' || status === 'paid_card') return 'received';
  if (status === 'insurance') return 'insurance';
  if (status === 'free') return 'free';
  return 'pending';
}

export interface PaymentRow {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  modality: SessionModality;
  appointmentStatus: AppointmentStatus;
  paymentStatus: PaymentStatus;
  bucket: PaymentBucket;
  price: number;
  /** Sessão realizada, de dia anterior a hoje, ainda sem pagamento. */
  overdue: boolean;
}

/** Cancelados e remarcados não geram cobrança. Faltas entram: cobrar ou não é decisão do profissional (Isento). */
export function buildPaymentRows(appointments: Appointment[], patientName: (id: string) => string, now: Date = new Date()): PaymentRow[] {
  const today = dayKey(now);
  return appointments
    .filter(a => a.status !== 'canceled' && a.status !== 'rescheduled')
    .map(a => {
      const paymentStatus = a.payment_status || 'pending';
      const bucket = paymentBucket(paymentStatus);
      return {
        id: a.id,
        patientId: a.patient_id,
        patientName: patientName(a.patient_id),
        startsAt: a.starts_at,
        modality: a.modality,
        appointmentStatus: a.status,
        paymentStatus,
        bucket,
        price: a.price ?? 0,
        overdue: bucket === 'pending' && a.status === 'completed' && dayKey(a.starts_at) < today,
      };
    })
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export interface PaymentSummary {
  received: number;
  /** Tudo que ainda não foi pago (inclui o que está em atraso). */
  pending: number;
  overdue: number;
  insurance: number;
  free: number;
  total: number;
  count: number;
}

export function summarizePayments(rows: PaymentRow[]): PaymentSummary {
  const summary: PaymentSummary = { received: 0, pending: 0, overdue: 0, insurance: 0, free: 0, total: 0, count: rows.length };
  for (const row of rows) {
    summary[row.bucket] += row.price;
    if (row.overdue) summary.overdue += row.price;
    summary.total += row.price;
  }
  return summary;
}

export interface OverdueByPatient {
  patientId: string;
  name: string;
  sessions: number;
  amount: number;
}

export function overdueByPatient(rows: PaymentRow[]): OverdueByPatient[] {
  const map = new Map<string, OverdueByPatient>();
  for (const row of rows) {
    if (!row.overdue) continue;
    const entry = map.get(row.patientId) || { patientId: row.patientId, name: row.patientName, sessions: 0, amount: 0 };
    entry.sessions++;
    entry.amount += row.price;
    map.set(row.patientId, entry);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

// ---------------------------------------------------------------------------
// Anotações de sessões
// ---------------------------------------------------------------------------

export interface SessionNoteRow {
  session: TherapySession;
  patientName: string;
  excerpt: string;
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Campos visíveis a quem lê o relatório. As anotações privadas (`private_notes`) nunca entram na busca nem no resultado. */
function searchableText(s: TherapySession): string {
  return [
    s.summary, (s.main_topics || []).join(' '), s.soap_subjective, s.soap_objective, s.soap_assessment, s.soap_plan,
    s.interventions_used, s.evolution_observed, s.homework_assigned, s.next_session_plan,
  ].filter(Boolean).join(' ');
}

function buildExcerpt(s: TherapySession): string {
  const source = s.summary || s.evolution_observed || s.soap_subjective || s.soap_assessment || '';
  const clean = source.replace(/\s+/g, ' ').trim();
  return clean.length > 180 ? `${clean.slice(0, 177)}…` : clean;
}

export function filterSessionNotes(
  sessions: TherapySession[],
  patientName: (id: string) => string,
  filters: { query?: string; patientId?: string; range?: DateRange | null }
): SessionNoteRow[] {
  const query = fold((filters.query || '').trim());
  return sessions
    .filter(s => !filters.patientId || s.patient_id === filters.patientId)
    .filter(s => isInRange(s.session_date, filters.range ?? null))
    .filter(s => !query || fold(searchableText(s)).includes(query) || fold(patientName(s.patient_id)).includes(query))
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
    .map(session => ({ session, patientName: patientName(session.patient_id), excerpt: buildExcerpt(session) }));
}

// ---------------------------------------------------------------------------
// Financeiro do paciente
// ---------------------------------------------------------------------------

export interface PatientFinancial {
  sessions: PaymentRow[];
  sessionSummary: PaymentSummary;
  /** Receitas do paciente que não são de uma sessão avulsa (ex.: pagamento de pacote), sem cancelados. */
  otherTransactions: FinancialTransaction[];
  otherReceived: number;
  otherPending: number;
  packages: (PatientPackage & { remaining: number })[];
  totalReceived: number;
  totalPending: number;
}

/**
 * Recebido e pendente somam sessões (pelo status de pagamento do atendimento) e lançamentos que não estão ligados a
 * um atendimento. Lançamentos ligados a um atendimento não entram de novo, para não contar o mesmo valor duas vezes.
 */
export function buildPatientFinancial(
  patientId: string,
  appointments: Appointment[],
  transactions: FinancialTransaction[],
  packages: PatientPackage[],
  patientName: (id: string) => string,
  now: Date = new Date()
): PatientFinancial {
  const sessions = buildPaymentRows(appointments.filter(a => a.patient_id === patientId), patientName, now);
  const sessionSummary = summarizePayments(sessions);

  const otherTransactions = transactions
    .filter(t => t.patient_id === patientId && t.type === 'income' && t.status !== 'canceled' && !t.appointment_id)
    .sort((a, b) => b.due_date.localeCompare(a.due_date));
  const otherReceived = otherTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const otherPending = otherTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  return {
    sessions,
    sessionSummary,
    otherTransactions,
    otherReceived,
    otherPending,
    packages: packages
      .filter(p => p.patient_id === patientId)
      .map(p => ({ ...p, remaining: Math.max(0, p.total_sessions - p.sessions_completed) })),
    totalReceived: sessionSummary.received + otherReceived,
    totalPending: sessionSummary.pending + otherPending,
  };
}
