import {
  addDaysToDateKey, dayKey, expandRecurrence, findConflicts, generateSlots, getMonthGrid, getWeekDays,
  groupAppointmentsByDay, isValidSlug, slugify, todayInBrazil, validateWeeklyHours, weekdayOfDateKey,
} from './schedule-utils';
import type { Appointment } from '@/types/database';

// Fixa o fuso do teste (as grades de calendário usam datas locais): Date lê TZ a cada uso.
process.env.TZ = 'America/Sao_Paulo';

const failures: string[] = [];
const check = (condition: boolean, name: string) => {
  console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${name}`);
  if (!condition) failures.push(name);
};

function apt(id: string, startsAt: string, minutes: number, overrides: Partial<Appointment> = {}): Appointment {
  return {
    id, psychologist_id: 'psy-1', patient_id: 'pat-1', modality: 'online', status: 'scheduled',
    starts_at: startsAt, ends_at: new Date(new Date(startsAt).getTime() + minutes * 60000).toISOString(),
    ...overrides,
  };
}

// --- calendário ---
const grid = getMonthGrid(new Date(2026, 8, 20)); // setembro/2026: 1º cai numa terça
check(grid.length % 7 === 0 && grid.length >= 35, 'grade mensal tem semanas completas');
check(grid[0].getDay() === 0 && dayKey(grid[0]) === '2026-08-30', 'grade começa no domingo anterior ao dia 1');
check(dayKey(grid[grid.length - 1]) === '2026-10-03', 'grade termina no sábado depois do último dia');
const week = getWeekDays(new Date(2026, 8, 20));
check(week.length === 7 && dayKey(week[0]) === '2026-09-20' && dayKey(week[6]) === '2026-09-26', 'semana vai de domingo a sábado');

const grouped = groupAppointmentsByDay([
  apt('b', new Date(2026, 8, 20, 15, 0).toISOString(), 50),
  apt('a', new Date(2026, 8, 20, 9, 0).toISOString(), 50),
  apt('c', new Date(2026, 8, 21, 9, 0).toISOString(), 50),
]);
check(Object.keys(grouped).length === 2 && grouped['2026-09-20'].map(x => x.id).join() === 'a,b', 'agrupa por dia e ordena por horário');

// --- conflitos ---
const t = (h: number, m = 0) => new Date(2026, 8, 21, h, m).toISOString();
const existing = [
  apt('e1', t(10), 50, { patient_id: 'pat-1', room_id: 'room-1' }),
  apt('e2', t(11), 50, { patient_id: 'pat-2', psychologist_id: 'psy-2', room_id: 'room-2' }),
  apt('e3', t(14), 50, { status: 'canceled' }),
];
const conflict = (start: string, end: string, extra = {}) => findConflicts(existing, { starts_at: start, ends_at: end, psychologist_id: 'psy-1', patient_id: 'pat-9', ...extra });
check(conflict(t(10, 30), t(11, 20)).map(c => c.kind).join() === 'psychologist', 'detecta choque com o próprio horário do psicólogo');
check(conflict(t(10, 50), t(11, 40)).length === 0, 'horários encostados (fim = início) não conflitam');
check(conflict(t(14), t(14, 50)).length === 0, 'agendamento cancelado libera o horário');
check(conflict(t(10), t(10, 50), { patient_id: 'pat-1' }).map(c => c.kind).sort().join() === 'patient,psychologist', 'detecta psicólogo e paciente ao mesmo tempo');
check(conflict(t(11), t(11, 50), { room_id: 'room-2' }).map(c => c.kind).join() === 'room', 'detecta choque de sala mesmo com outro psicólogo');
check(conflict(t(11), t(11, 50)).length === 0, 'outro psicólogo em outra sala não conflita');
check(findConflicts(existing, { starts_at: t(10), ends_at: t(10, 50), psychologist_id: 'psy-1', ignoreId: 'e1' }).length === 0, 'ao editar ignora o próprio agendamento');
check(findConflicts([apt('n', t(9), 50, { status: 'no_show' }), apt('r', t(9), 50, { status: 'rescheduled' })], { starts_at: t(9), ends_at: t(9, 50), psychologist_id: 'psy-1' }).length === 0, 'falta e remarcado não ocupam horário');

// conta ainda sem id (não sincronizada): mesmo assim o choque entre atendimentos do mesmo psicólogo é detectado
check(findConflicts([apt('u1', t(10), 50, { psychologist_id: '' })], { starts_at: t(10, 30), ends_at: t(11, 20), psychologist_id: '' }).length === 1, 'conflito é detectado mesmo com id de psicólogo vazio');

// --- recorrência ---
const weekly = expandRecurrence(new Date(2026, 8, 21, 10).toISOString(), new Date(2026, 8, 21, 10, 50).toISOString(), 'weekly', 4);
check(weekly.length === 4 && dayKey(weekly[3].starts_at) === '2026-10-12', 'semanal gera 4 datas com 7 dias de intervalo');
check(weekly.every(o => new Date(o.starts_at).getHours() === 10 && new Date(o.ends_at).getTime() - new Date(o.starts_at).getTime() === 50 * 60000), 'mantém horário e duração');
const biweekly = expandRecurrence(new Date(2026, 8, 21, 10).toISOString(), new Date(2026, 8, 21, 10, 50).toISOString(), 'biweekly', 3);
check(dayKey(biweekly[2].starts_at) === '2026-10-19', 'quinzenal soma 14 dias');
const monthly = expandRecurrence(new Date(2026, 0, 31, 10).toISOString(), new Date(2026, 0, 31, 10, 50).toISOString(), 'monthly', 3);
check(dayKey(monthly[1].starts_at) === '2026-02-28' && dayKey(monthly[2].starts_at) === '2026-03-31', 'mensal ajusta fim de mês');
check(expandRecurrence(t(10), t(11), 'weekly', 500).length === 52, 'limita a 52 ocorrências');
check(expandRecurrence(t(10), t(11), 'weekly', 0).length === 1, 'sempre gera ao menos a primeira');

// --- datas de Brasília ---
check(todayInBrazil(new Date('2026-09-21T02:00:00Z')) === '2026-09-20', 'em Brasília, 02:00 UTC ainda é o dia anterior');
check(addDaysToDateKey('2026-09-30', 1) === '2026-10-01' && addDaysToDateKey('2026-01-01', -1) === '2025-12-31', 'soma dias em datas puras');
check(weekdayOfDateKey('2026-09-21') === 1, '21/09/2026 é segunda-feira');

// --- horários livres ---
const hours = { '1': [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '15:40' }] };
const now = new Date('2026-09-18T12:00:00Z');
const base = { date: '2026-09-21', weeklyHours: hours, slotMinutes: 50, busy: [], minNoticeHours: 12, maxDaysAhead: 30, now };
const slots = generateSlots(base);
check(slots.map(s => s.label).join() === '09:00,09:50,10:40,14:00,14:50', 'gera slots alinhados dentro de cada janela');
check(slots[0].starts_at === '2026-09-21T12:00:00.000Z', '09:00 de Brasília = 12:00 UTC');
check(generateSlots({ ...base, date: '2026-09-22' }).length === 0, 'dia sem janela não tem horários');
const busy = [{ start: '2026-09-21T12:50:00.000Z', end: '2026-09-21T13:40:00.000Z' }];
check(generateSlots({ ...base, busy }).map(s => s.label).join() === '09:00,10:40,14:00,14:50', 'remove horários ocupados');
check(generateSlots({ ...base, now: new Date('2026-09-21T11:00:00Z'), minNoticeHours: 2 }).map(s => s.label).join() === '10:40,14:00,14:50', 'respeita antecedência mínima');
check(generateSlots({ ...base, maxDaysAhead: 1 }).length === 0, 'respeita o limite de dias à frente');

// --- validação de janelas e slug ---
check(validateWeeklyHours(hours) === null, 'janelas válidas');
check(validateWeeklyHours({ '1': [{ start: '10:00', end: '09:00' }] }) !== null, 'fim antes do início é inválido');
check(validateWeeklyHours({ '1': [{ start: '09:00', end: '12:00' }, { start: '11:00', end: '13:00' }] }) !== null, 'janelas sobrepostas são inválidas');
check(slugify('Dra. Ana Lima Ávila') === 'dra-ana-lima-avila', 'slugify remove acentos e pontuação');
check(slugify('  --A--  ') === 'a', 'slugify apara hífens');
check(isValidSlug('ana-lima') && !isValidSlug('-ana') && !isValidSlug('a') && !isValidSlug('Ana') && !isValidSlug('ana_lima'), 'slug válido segue a regra do banco');

if (failures.length > 0) {
  console.error(`\n${failures.length} teste(s) falharam.`);
  process.exit(1);
}
console.log('\nTodos os testes de agenda passaram.');
