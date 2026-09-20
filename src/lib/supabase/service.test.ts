import assert from 'node:assert';
import { supabase } from './client';
import { SupabaseService, toPatientRow } from './service';
import { isUuid, newUuid, toLocalDateTimeInput } from '../utils';
import type { TherapySession, SessionPrivateNotes } from '@/types/database';

interface Call {
  table: string;
  op: string;
  rows?: any;
  opts?: any;
}

const calls: Call[] = [];
let failTable: string | null = null;
let failError: { code?: string; message: string } = { message: 'boom' };

// Substitui o cliente Supabase por um espião em memória (nenhuma chamada de rede)
(supabase as any).from = (table: string) => ({
  upsert: async (rows: any, opts?: any) => {
    calls.push({ table, op: 'upsert', rows, opts });
    return { error: failTable === table ? failError : null };
  },
  insert: async (rows: any) => {
    calls.push({ table, op: 'insert', rows });
    return { error: failTable === table ? failError : null };
  },
});

function reset() {
  calls.length = 0;
  failTable = null;
}

const PSY = newUuid();
const PAT = newUuid();

function buildSession(overrides: Partial<TherapySession> = {}): TherapySession {
  return {
    id: newUuid(),
    psychologist_id: PSY,
    patient_id: PAT,
    session_number: 3,
    session_date: '2026-09-20T13:00:00.000Z',
    duration_minutes: 50,
    modality: 'online',
    main_topics: ['Ansiedade'],
    summary: 'Resumo',
    soap_subjective: 'S',
    status: 'finalized',
    created_at: '2026-09-20T13:00:00.000Z',
    private_notes: { id: 'x' } as any, // campo só de tela: nunca deve ir ao banco
    ...overrides,
  } as TherapySession;
}

async function run() {
  console.log('🧪 Iniciando testes de gravação de sessões/pacientes (persistência clínica)...');

  // --- utilidades ---
  assert.ok(isUuid(newUuid()), 'newUuid gera UUID válido');
  assert.ok(!isUuid('pat-1789'), 'id temporário antigo não é UUID');
  assert.strictEqual(toLocalDateTimeInput(new Date(2026, 0, 15, 22, 30)), '2026-01-15T22:30', 'datetime-local usa fuso local');
  console.log('✅ PASS: utilidades de id e data local');

  // --- insertSession: paciente com id não-UUID é recusado sem tocar no banco ---
  reset();
  let r = await SupabaseService.insertSession(buildSession({ patient_id: 'pat-123' }));
  assert.strictEqual(r.ok, false);
  assert.match(r.error || '', /paciente ainda não foi gravado/i);
  assert.strictEqual(calls.length, 0);
  console.log('✅ PASS: paciente fantasma é recusado com mensagem clara');

  // --- insertSession: sucesso grava sessão + notas privadas de forma idempotente (upsert por id) ---
  reset();
  const session = buildSession();
  const notes: SessionPrivateNotes = {
    id: newUuid(), session_id: session.id, psychologist_id: PSY, patient_id: PAT,
    private_clinical_hypothesis: 'hipótese', created_at: '', updated_at: '',
  };
  r = await SupabaseService.insertSession(session, notes);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(calls[0].table, 'therapy_sessions');
  assert.strictEqual(calls[0].op, 'upsert');
  assert.strictEqual(calls[0].opts.onConflict, 'id');
  assert.strictEqual(calls[0].rows[0].id, session.id);
  assert.ok(!('private_notes' in calls[0].rows[0]), 'campos só de tela não vão ao banco');
  assert.strictEqual(calls[1].table, 'session_private_notes');
  assert.strictEqual(calls[1].rows[0].session_id, session.id);
  console.log('✅ PASS: sessão e notas privadas gravadas com upsert idempotente');

  // --- insertSession: coluna faltando no banco vira erro explícito (antes: falha silenciosa) ---
  reset();
  failTable = 'therapy_sessions';
  failError = { code: '42703', message: 'column "soap_subjective" of relation "therapy_sessions" does not exist' };
  r = await SupabaseService.insertSession(buildSession());
  assert.strictEqual(r.ok, false);
  assert.match(r.error || '', /migração 04/);
  console.log('✅ PASS: coluna ausente no banco é reportada ao usuário');

  // --- insertSession: falha nas notas privadas não é engolida ---
  reset();
  failTable = 'session_private_notes';
  failError = { code: '42501', message: 'new row violates row-level security policy' };
  r = await SupabaseService.insertSession(session, notes);
  assert.strictEqual(r.ok, false);
  assert.match(r.error || '', /anotações privadas/);
  console.log('✅ PASS: falha nas notas privadas é reportada');

  // --- insertPatient: grava paciente + vínculo, sem RETURNING ---
  reset();
  r = await SupabaseService.insertPatient({
    id: PAT, full_name: 'Lara', email: 'lara@example.com', status: 'active', started_at: '2026-09-20T00:00:00Z',
  } as any, PSY);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(calls[0].table, 'patients');
  assert.strictEqual(calls[0].rows[0].id, PAT);
  assert.strictEqual(calls[1].table, 'psychologist_patient_relationships');
  assert.strictEqual(calls[1].rows[0].patient_id, PAT);
  console.log('✅ PASS: paciente e vínculo gravados juntos');

  // --- insertPatient: falha no vínculo é reportada (antes: ignorada, paciente sumia no próximo login) ---
  reset();
  failTable = 'psychologist_patient_relationships';
  failError = { code: '42501', message: 'row-level security' };
  r = await SupabaseService.insertPatient({ id: PAT, full_name: 'Lara', email: 'l@x.com', status: 'active' } as any, PSY);
  assert.strictEqual(r.ok, false);
  assert.match(r.error || '', /vínculo/);
  console.log('✅ PASS: falha no vínculo é reportada');

  // --- insertPatient: conta do psicólogo com id não-UUID (fallback antigo) ---
  reset();
  r = await SupabaseService.insertPatient({ id: PAT, full_name: 'Lara', email: 'l@x.com', status: 'active' } as any, 'psych-abc');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(calls.length, 0);
  console.log('✅ PASS: conta de psicólogo não sincronizada é recusada');

  // --- cadastro completo: só colunas reais, vazio vira NULL, sem data inventada ---
  reset();
  r = await SupabaseService.insertPatient({
    id: PAT, full_name: 'Lara', email: 'l@x.com', status: 'active', birth_date: '',
    cpf: '52998224725', cpf_extra: 'x', mobile: '', zip_code: '01310-100', tags: ['TCC'], has_social_name: true,
    guardian_name: 'Ana', guardian_allow_billing_contact: true, guardian_birth_date: '',
    profile: { id: 'x' }, psychologist_id: PSY, anamnesis_completed: true,
  } as any, PSY);
  assert.strictEqual(r.ok, true);
  const row = calls[0].rows[0];
  assert.strictEqual(row.cpf, '52998224725');
  assert.strictEqual(row.mobile, null, 'texto vazio vira NULL');
  assert.strictEqual(row.birth_date, null, 'sem data de nascimento grava NULL (antes: 1995-01-01)');
  assert.strictEqual(row.guardian_birth_date, null);
  assert.deepStrictEqual(row.tags, ['TCC']);
  assert.strictEqual(row.has_social_name, true);
  assert.strictEqual(row.guardian_allow_billing_contact, true);
  for (const screenOnly of ['profile', 'psychologist_id', 'anamnesis_completed', 'cpf_extra']) {
    assert.ok(!(screenOnly in row), `${screenOnly} não deve ir ao banco`);
  }
  console.log('✅ PASS: cadastro completo grava só colunas reais e não inventa data de nascimento');

  assert.deepStrictEqual(toPatientRow({ full_name: 'A', rg: '' }), { full_name: 'A', rg: null });
  assert.deepStrictEqual(toPatientRow({}), {}, 'update parcial não toca em colunas ausentes');
  console.log('✅ PASS: toPatientRow em atualização parcial');

  // --- agendamento: patient_name (só de tela) derrubava toda gravação em produção ---
  reset();
  const apptId = newUuid();
  r = await SupabaseService.insertAppointment({
    id: apptId, psychologist_id: PSY, patient_id: PAT, patient_name: 'Lara', starts_at: '2026-09-21T12:00:00Z',
    ends_at: '2026-09-21T12:50:00Z', modality: 'online', status: 'scheduled', room_id: null,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(calls[0].table, 'appointments');
  assert.ok(!('patient_name' in calls[0].rows[0]), 'patient_name não existe na tabela appointments');
  assert.strictEqual(calls[0].rows[0].id, apptId);
  assert.strictEqual(calls[0].rows[0].room_id, null);
  console.log('✅ PASS: agendamento grava só colunas reais (sem patient_name)');

  reset();
  r = await SupabaseService.insertAppointment({
    id: 'apt-123', psychologist_id: PSY, patient_id: PAT, starts_at: 'x', ends_at: 'y', modality: 'online', status: 'scheduled',
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(calls.length, 0, 'id temporário não-UUID não vai ao banco');
  console.log('✅ PASS: agendamento com id inválido é recusado sem tocar no banco');

  reset();
  const series = [1, 2, 3].map(() => ({
    id: newUuid(), psychologist_id: PSY, patient_id: PAT, starts_at: 'a', ends_at: 'b', modality: 'online' as const, status: 'scheduled' as const, series_id: apptId, recurrence_rule: 'weekly' as const,
  }));
  r = await SupabaseService.insertAppointments(series);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(calls.length, 1, 'série inteira em uma única gravação');
  assert.strictEqual(calls[0].rows.length, 3);
  console.log('✅ PASS: série recorrente é gravada de uma vez');

  console.log('🎉 Todos os testes de persistência clínica passaram!');
}

run().catch(err => {
  console.error('❌ FALHA:', err);
  process.exit(1);
});
