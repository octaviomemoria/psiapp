import { addDays, addMonths, addWeeks, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';
import type { Appointment, AppointmentStatus, RecurrenceRule, WeeklyHours } from '@/types/database';

// ---------------------------------------------------------------------------
// Calendário (datas locais do navegador; semana começa no domingo)
// ---------------------------------------------------------------------------

/** Chave de dia local "yyyy-MM-dd". */
export function dayKey(value: Date | string): string {
  return format(typeof value === 'string' ? new Date(value) : value, 'yyyy-MM-dd');
}

/** Todos os dias exibidos no calendário mensal (semanas completas, domingo a sábado). */
export function getMonthGrid(reference: Date): Date[] {
  const start = startOfWeek(startOfMonth(reference), { weekStartsOn: 0 });
  const end = endOfMonth(reference);
  const days: Date[] = [];
  for (let d = start; d <= end || days.length % 7 !== 0; d = addDays(d, 1)) days.push(d);
  return days;
}

export function getWeekDays(reference: Date): Date[] {
  const start = startOfWeek(reference, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Agrupa por dia local, cada dia ordenado por horário. */
export function groupAppointmentsByDay<T extends Pick<Appointment, 'starts_at'>>(appointments: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const appointment of appointments) {
    const key = dayKey(appointment.starts_at);
    (groups[key] ||= []).push(appointment);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Conflitos
// ---------------------------------------------------------------------------

/** Só agendamentos vivos ocupam horário: cancelados, faltas e remarcados liberam a vaga. */
export function occupiesSlot(status: AppointmentStatus): boolean {
  return status === 'scheduled' || status === 'confirmed' || status === 'completed';
}

export function intervalsOverlap(aStart: string | number | Date, aEnd: string | number | Date, bStart: string | number | Date, bEnd: string | number | Date): boolean {
  return new Date(aStart).getTime() < new Date(bEnd).getTime() && new Date(aEnd).getTime() > new Date(bStart).getTime();
}

export type ConflictKind = 'psychologist' | 'patient' | 'room';

export interface Conflict {
  kind: ConflictKind;
  appointment: Appointment;
}

export interface ConflictCandidate {
  starts_at: string;
  ends_at: string;
  psychologist_id?: string;
  patient_id?: string;
  room_id?: string | null;
  /** Ignora este agendamento (ao editar) e os demais da mesma série. */
  ignoreId?: string;
}

export function findConflicts(existing: Appointment[], candidate: ConflictCandidate): Conflict[] {
  const conflicts: Conflict[] = [];
  for (const appointment of existing) {
    if (appointment.id === candidate.ignoreId) continue;
    if (!occupiesSlot(appointment.status)) continue;
    if (!intervalsOverlap(appointment.starts_at, appointment.ends_at, candidate.starts_at, candidate.ends_at)) continue;

    if (candidate.psychologist_id !== undefined && appointment.psychologist_id === candidate.psychologist_id) {
      conflicts.push({ kind: 'psychologist', appointment });
    }
    if (candidate.patient_id !== undefined && appointment.patient_id === candidate.patient_id) {
      conflicts.push({ kind: 'patient', appointment });
    }
    if (candidate.room_id && appointment.room_id === candidate.room_id) {
      conflicts.push({ kind: 'room', appointment });
    }
  }
  return conflicts;
}

// ---------------------------------------------------------------------------
// Recorrência
// ---------------------------------------------------------------------------

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  weekly: 'Toda semana',
  biweekly: 'A cada 2 semanas',
  monthly: 'Todo mês',
};

export const MAX_RECURRENCE_COUNT = 52;

/**
 * Ocorrências de uma série, já incluindo a primeira. Mantém o horário local (não soma 24h, para não
 * desalinhar em mudança de horário de verão) e limita o total a MAX_RECURRENCE_COUNT.
 */
export function expandRecurrence(
  startsAt: string,
  endsAt: string,
  rule: RecurrenceRule,
  count: number
): { starts_at: string; ends_at: string }[] {
  const total = Math.max(1, Math.min(MAX_RECURRENCE_COUNT, Math.floor(count) || 1));
  const start = new Date(startsAt);
  const durationMs = new Date(endsAt).getTime() - start.getTime();

  return Array.from({ length: total }, (_, i) => {
    const occurrence =
      rule === 'weekly' ? addWeeks(start, i) : rule === 'biweekly' ? addWeeks(start, i * 2) : addMonths(start, i);
    return {
      starts_at: occurrence.toISOString(),
      ends_at: new Date(occurrence.getTime() + durationMs).toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Agendamento online: horários em Brasília (UTC-3 fixo desde 2019), iguais aos validados no banco
// ---------------------------------------------------------------------------

export const BOOKING_TIMEZONE = 'America/Sao_Paulo';
const BR_OFFSET_MS = -3 * 60 * 60 * 1000;

export const WEEKDAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const DEFAULT_WEEKLY_HOURS: WeeklyHours = {
  '1': [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
  '2': [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
  '3': [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
  '4': [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
  '5': [{ start: '09:00', end: '12:00' }],
};

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Data de hoje em Brasília, "yyyy-MM-dd". */
export function todayInBrazil(now: Date = new Date()): string {
  return new Date(now.getTime() + BR_OFFSET_MS).toISOString().slice(0, 10);
}

/** Soma dias a uma data "yyyy-MM-dd" sem depender do fuso do navegador. */
export function addDaysToDateKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Dia da semana (0 = domingo) de uma data "yyyy-MM-dd". */
export function weekdayOfDateKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Instante ISO de um horário de Brasília. */
export function brazilLocalToIso(dateKey: string, minutesFromMidnight: number): string {
  return new Date(`${dateKey}T${minutesToTime(minutesFromMidnight)}:00-03:00`).toISOString();
}

export function formatBrazilTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: BOOKING_TIMEZONE, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export interface BookingSlot {
  starts_at: string;
  ends_at: string;
  label: string;
}

export interface SlotOptions {
  /** Dia em Brasília, "yyyy-MM-dd". */
  date: string;
  weeklyHours: WeeklyHours;
  slotMinutes: number;
  busy: { start: string; end: string }[];
  minNoticeHours: number;
  maxDaysAhead: number;
  now?: Date;
}

/** Horários livres de um dia: dentro das janelas, alinhados ao slot, com antecedência mínima e sem choque. */
export function generateSlots({ date, weeklyHours, slotMinutes, busy, minNoticeHours, maxDaysAhead, now = new Date() }: SlotOptions): BookingSlot[] {
  const earliest = now.getTime() + minNoticeHours * 3_600_000;
  const latest = now.getTime() + maxDaysAhead * 86_400_000;
  const windows = weeklyHours[String(weekdayOfDateKey(date))] || [];
  const slots: BookingSlot[] = [];

  for (const window of windows) {
    const windowEnd = timeToMinutes(window.end);
    for (let start = timeToMinutes(window.start); start + slotMinutes <= windowEnd; start += slotMinutes) {
      const startsAt = brazilLocalToIso(date, start);
      const endsAt = brazilLocalToIso(date, start + slotMinutes);
      const startMs = new Date(startsAt).getTime();
      if (startMs < earliest || startMs > latest) continue;
      if (busy.some(b => intervalsOverlap(startsAt, endsAt, b.start, b.end))) continue;
      slots.push({ starts_at: startsAt, ends_at: endsAt, label: minutesToTime(start) });
    }
  }
  return slots.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

/** Retorna a mensagem do primeiro problema nas janelas de atendimento, ou null se estiver tudo certo. */
export function validateWeeklyHours(weeklyHours: WeeklyHours): string | null {
  for (const [day, windows] of Object.entries(weeklyHours)) {
    const label = WEEKDAY_LABELS[Number(day)] ?? day;
    const sorted = [...windows].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    for (let i = 0; i < sorted.length; i++) {
      const w = sorted[i];
      if (!/^\d{2}:\d{2}$/.test(w.start) || !/^\d{2}:\d{2}$/.test(w.end)) return `${label}: horário inválido.`;
      if (timeToMinutes(w.end) <= timeToMinutes(w.start)) return `${label}: o fim deve ser depois do início.`;
      if (i > 0 && timeToMinutes(w.start) < timeToMinutes(sorted[i - 1].end)) return `${label}: as janelas de horário se sobrepõem.`;
    }
  }
  return null;
}

/** "Dra. Ana Lima" -> "dra-ana-lima". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

/** Mesma regra do banco: 3 a 40 caracteres, letras minúsculas, números e hífen (sem hífen nas pontas). */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug);
}
