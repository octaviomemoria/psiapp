import {
  appointmentsByModality, appointmentsByMonth, appointmentsByPatient, appointmentsByWeekday, buildPatientFinancial,
  buildPaymentRows, computeAppointmentStats, filterSessionNotes, isInRange, overdueByPatient, paymentBucket, resolvePeriod,
  summarizePayments,
} from './report-utils';
import { csvCell, toCsv } from './csv';
import type { Appointment, FinancialTransaction, PatientPackage, TherapySession } from '@/types/database';

// As datas de relatório usam o dia local: fixa o fuso (Date lê TZ a cada uso).
process.env.TZ = 'America/Sao_Paulo';

const failures: string[] = [];
const check = (condition: boolean, name: string) => {
  console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${name}`);
  if (!condition) failures.push(name);
};

const NOW = new Date(2026, 8, 20, 12, 0); // 20/09/2026 12:00
const at = (m: number, d: number, h = 10) => new Date(2026, m - 1, d, h, 0).toISOString();
const names: Record<string, string> = { p1: 'Lara Souza', p2: 'Bruno Lima' };
const nameOf = (id: string) => names[id] || 'Paciente';

function apt(id: string, patient: string, start: string, overrides: Partial<Appointment> = {}): Appointment {
  return {
    id, psychologist_id: 'psy', patient_id: patient, starts_at: start,
    ends_at: new Date(new Date(start).getTime() + 50 * 60000).toISOString(),
    modality: 'online', status: 'completed', price: 200, payment_status: 'pending', ...overrides,
  };
}

// --- período ---
check(JSON.stringify(resolvePeriod('this_month', NOW)) === '{"from":"2026-09-01","to":"2026-09-30"}', 'período: este mês');
check(JSON.stringify(resolvePeriod('last_month', NOW)) === '{"from":"2026-08-01","to":"2026-08-31"}', 'período: mês passado');
check(JSON.stringify(resolvePeriod('last_30_days', NOW)) === '{"from":"2026-08-22","to":"2026-09-20"}', 'período: últimos 30 dias inclui hoje');
check(JSON.stringify(resolvePeriod('this_year', NOW)) === '{"from":"2026-01-01","to":"2026-12-31"}', 'período: este ano');
check(resolvePeriod('all', NOW) === null, 'período: tudo = sem filtro');
check(resolvePeriod('custom', NOW, { from: '2026-05-10', to: '2026-05-01' }) === null, 'período personalizado invertido é ignorado');
const sep = resolvePeriod('this_month', NOW);
check(isInRange(at(9, 30, 23), sep) && !isInRange(at(10, 1, 0), sep) && isInRange(at(9, 1, 0), sep), 'limites do período usam o dia local');
check(isInRange(at(1, 1), null), 'sem período, tudo entra');

// --- estatísticas de atendimento ---
const list: Appointment[] = [
  apt('a1', 'p1', at(9, 1), { status: 'completed' }),
  apt('a2', 'p1', at(9, 8), { status: 'completed' }),
  apt('a3', 'p1', at(9, 15), { status: 'no_show' }),
  apt('a4', 'p2', at(9, 2), { status: 'canceled' }),
  apt('a5', 'p2', at(9, 9), { status: 'completed', modality: 'presencial' }),
  apt('a6', 'p2', at(9, 12), { status: 'confirmed' }), // já passou sem desfecho
  apt('a7', 'p2', at(9, 25), { status: 'scheduled' }), // futuro
  apt('a8', 'p2', at(9, 16), { status: 'rescheduled' }),
];
const stats = computeAppointmentStats(list, NOW);
check(stats.total === 8 && stats.completed === 3 && stats.noShow === 1 && stats.canceled === 1 && stats.rescheduled === 1, 'contagens por situação');
check(stats.upcoming === 1 && stats.unresolved === 1, 'futuras e sem desfecho são separadas');
check(stats.attendanceRate === 3 / 4, 'comparecimento = realizadas / (realizadas + faltas)');
check(stats.cancellationRate === 1 / 8, 'cancelamento = canceladas / total');
check(stats.hoursCompleted === 2.5, 'horas realizadas somam a duração real (3 x 50 min)');
const empty = computeAppointmentStats([], NOW);
check(empty.attendanceRate === null && empty.cancellationRate === null, 'sem dados a taxa é nula, não zero');
check(computeAppointmentStats([apt('x', 'p1', at(9, 1), { status: 'canceled' })], NOW).attendanceRate === null, 'só cancelamentos: comparecimento indefinido');

const months = appointmentsByMonth([...list, apt('b1', 'p1', at(8, 20), { status: 'completed' })]);
check(months.length === 2 && months[0].key === '2026-08' && months[1].completed === 3 && months[1].other === 3, 'agrupa por mês em ordem cronológica');
const weekday = appointmentsByWeekday(list);
check(weekday.reduce((s, w) => s + w.count, 0) === 6, 'dia da semana ignora cancelados e remarcados, mas conta faltas');
check(appointmentsByModality(list)[0].modality === 'online' && appointmentsByModality(list)[0].count === 5, 'modalidade mais usada primeiro');
const perPatient = appointmentsByPatient(list, nameOf);
check(perPatient[0].patientId === 'p2' && perPatient[0].total === 5 && perPatient[1].attendanceRate === 2 / 3, 'por paciente: ordem por volume e taxa própria');

// --- pagamentos ---
check(paymentBucket('paid_pix') === 'received' && paymentBucket('paid_card') === 'received' && paymentBucket(undefined) === 'pending' && paymentBucket('insurance') === 'insurance' && paymentBucket('free') === 'free', 'status de pagamento viram grupos');
const payAppts: Appointment[] = [
  apt('c1', 'p1', at(9, 1), { payment_status: 'paid_pix', price: 200 }),
  apt('c2', 'p1', at(9, 8), { payment_status: 'pending', price: 200 }), // atrasada
  apt('c3', 'p2', at(9, 9), { payment_status: 'pending', price: 250, status: 'completed' }), // atrasada
  apt('c4', 'p2', at(9, 25), { payment_status: 'pending', price: 250, status: 'scheduled' }), // futura: pendente, não atrasada
  apt('c5', 'p2', at(9, 3), { payment_status: 'insurance', price: 300 }),
  apt('c6', 'p2', at(9, 4), { payment_status: 'free', price: 100 }),
  apt('c7', 'p2', at(9, 5), { status: 'canceled', payment_status: 'pending', price: 999 }),
  apt('c8', 'p1', at(9, 6), { status: 'rescheduled', payment_status: 'pending', price: 999 }),
];
const rows = buildPaymentRows(payAppts, nameOf, NOW);
check(rows.length === 6 && !rows.some(r => r.price === 999), 'cancelados e remarcados não geram cobrança');
check(rows[0].id === 'c4', 'linhas ordenadas da mais recente para a mais antiga');
const sum = summarizePayments(rows);
check(sum.received === 200 && sum.pending === 700 && sum.overdue === 450 && sum.insurance === 300 && sum.free === 100 && sum.total === 1300, 'resumo de pagamentos');
check(!rows.find(r => r.id === 'c4')!.overdue, 'sessão futura pendente não está em atraso');
const overdue = overdueByPatient(rows);
check(overdue.length === 2 && overdue[0].patientId === 'p2' && overdue[0].amount === 250 && overdue[1].amount === 200, 'inadimplência por paciente, maior valor primeiro');
check(buildPaymentRows([apt('n', 'p1', at(9, 1), { price: undefined })], nameOf, NOW)[0].price === 0, 'atendimento sem preço conta zero (sem valor inventado)');

// --- anotações de sessões ---
function session(id: string, patient: string, date: string, overrides: Partial<TherapySession> = {}): TherapySession {
  return {
    id, psychologist_id: 'psy', patient_id: patient, session_number: 1, session_date: date, duration_minutes: 50,
    modality: 'online', main_topics: [], summary: '', status: 'finalized', created_at: date, ...overrides,
  };
}
const sessions = [
  session('s1', 'p1', at(9, 1), { summary: 'Trabalhamos ansiedade no trabalho.', main_topics: ['Ansiedade'], evolution_observed: 'Melhora do sono' }),
  session('s2', 'p2', at(9, 8), { summary: 'Conflito familiar', soap_assessment: 'Padrão de evitação' }),
  session('s3', 'p1', at(8, 20), { summary: 'Primeira sessão', private_notes: { private_clinical_hypothesis: 'HIPOTESE SECRETA' } as any }),
];
check(filterSessionNotes(sessions, nameOf, {}).map(r => r.session.id).join() === 's2,s1,s3', 'anotações da mais recente para a mais antiga');
check(filterSessionNotes(sessions, nameOf, { query: 'ansiedade' }).length === 1, 'busca no resumo e nos temas');
check(filterSessionNotes(sessions, nameOf, { query: 'ANSIEDADE' }).length === 1 && filterSessionNotes(sessions, nameOf, { query: 'evitacao' }).length === 1, 'busca ignora maiúsculas e acentos');
check(filterSessionNotes(sessions, nameOf, { query: 'bruno' }).length === 1, 'busca também pelo nome do paciente');
check(filterSessionNotes(sessions, nameOf, { query: 'hipotese secreta' }).length === 0, 'anotações privadas nunca entram na busca');
check(filterSessionNotes(sessions, nameOf, { patientId: 'p1' }).length === 2, 'filtra por paciente');
check(filterSessionNotes(sessions, nameOf, { range: resolvePeriod('this_month', NOW) }).length === 2, 'filtra por período');
const long = filterSessionNotes([session('l', 'p1', at(9, 1), { summary: 'x'.repeat(400) })], nameOf, {})[0];
check(long.excerpt.length === 178 && long.excerpt.endsWith('…'), 'trecho longo é cortado com reticências');

// --- financeiro do paciente ---
function tx(id: string, overrides: Partial<FinancialTransaction>): FinancialTransaction {
  return {
    id, psychologist_id: 'psy', patient_id: 'p1', title: 't', type: 'income', category_name: 'c', amount: 100,
    due_date: '2026-09-10', status: 'completed', is_tax_deductible: false, created_at: '2026-09-10', ...overrides,
  };
}
const txs = [
  tx('t1', { amount: 800, package_id: 'pk1' }),
  tx('t2', { amount: 200, appointment_id: 'c1' }), // já contado pela sessão
  tx('t3', { amount: 150, status: 'pending' }),
  tx('t4', { amount: 500, status: 'canceled' }),
  tx('t5', { amount: 90, type: 'expense' }),
  tx('t6', { amount: 70, patient_id: 'p2' }),
];
const pkgs: PatientPackage[] = [
  { id: 'pk1', psychologist_id: 'psy', patient_id: 'p1', title: 'Pacote 4', total_sessions: 4, sessions_completed: 1, total_price: 800, session_unit_price: 200, payment_status: 'paid', start_date: '2026-09-01', created_at: '' },
  { id: 'pk2', psychologist_id: 'psy', patient_id: 'p2', title: 'Outro', total_sessions: 2, sessions_completed: 2, total_price: 400, session_unit_price: 200, payment_status: 'paid', start_date: '2026-09-01', created_at: '' },
];
const fin = buildPatientFinancial('p1', payAppts, txs, pkgs, nameOf, NOW);
check(fin.sessions.length === 2 && fin.sessionSummary.received === 200 && fin.sessionSummary.pending === 200, 'financeiro do paciente: só as sessões dele');
check(fin.otherTransactions.map(t => t.id).sort().join() === 't1,t3', 'lançamentos avulsos: sem cancelados, despesas, outros pacientes nem os ligados a atendimento');
check(fin.otherReceived === 800 && fin.otherPending === 150, 'lançamentos avulsos somados por situação');
check(fin.totalReceived === 1000 && fin.totalPending === 350, 'totais não contam o mesmo valor duas vezes');
check(fin.packages.length === 1 && fin.packages[0].remaining === 3, 'pacotes do paciente com sessões restantes');

// --- CSV ---
check(csvCell('=HYPERLINK("x")') === `"'=HYPERLINK(""x"")"`, 'CSV neutraliza fórmula e escapa aspas');
check(csvCell('+55 11') === "'+55 11" && csvCell('@user') === "'@user" && csvCell('-cmd') === "'-cmd", 'CSV neutraliza + @ -');
check(csvCell('a;b') === '"a;b"' && csvCell('linha1\nlinha2') === 'linha1 linha2', 'CSV protege separador e quebra de linha');
check(csvCell(1234.5) === '1234,50' && csvCell(7) === '7' && csvCell(null) === '' && csvCell(true) === 'Sim', 'CSV formata números, vazio e booleano');
const csv = toCsv(['Nome', 'Valor'], [['Lara', 200], ['=1+1', 10.5]]);
check(csv.startsWith('﻿Nome;Valor\r\n') && csv.includes("\r\n'=1+1;10,50"), 'CSV com BOM, cabeçalho e linhas');

if (failures.length > 0) {
  console.error(`\n${failures.length} teste(s) falharam.`);
  process.exit(1);
}
console.log('\nTodos os testes de relatórios passaram.');
