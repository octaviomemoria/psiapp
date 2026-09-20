import { supabase, isSupabaseConfigured } from './client';
import {
  UserProfile,
  Psychologist,
  Patient,
  PatientGroup,
  Appointment,
  TherapySession,
  SessionPrivateNotes,
  Goal,
  AssignedExercise,
  ExerciseTemplate,
  DiaryEntry,
  MoodLog,
  PsychometricResult,
  CognitiveDiagram,
  VoiceAnchor,
  PatientInvite,
  FinancialCategory,
  FinancialTransaction,
  PatientPackage
} from '@/types/database';

import { isUuid } from '@/lib/utils';

export interface WriteResult<T = undefined> {
  ok: boolean;
  data?: T;
  /** Mensagem legível para exibir ao usuário. */
  error?: string;
}

export interface AdminAuditRow {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'EXPORT';
  performed_by: string | null;
  actor_role: string | null;
  created_at: string;
  /** Somente nomes de colunas alteradas (UPDATE); nunca valores. */
  changed_columns: string[] | null;
}

/** Traduz erros do PostgREST/Postgres para uma mensagem que orienta o usuário. */
function describeDbError(err: { code?: string; message?: string } | null | undefined, action: string): string {
  const code = err?.code;
  const msg = err?.message || 'erro desconhecido';
  if (code === '42501' || /row-level security/i.test(msg)) {
    return `${action}: o banco recusou a gravação por permissão (RLS). Saia e entre novamente; se persistir, avise o suporte.`;
  }
  if (code === '42703' || code === 'PGRST204' || /column .* does not exist|Could not find the .* column/i.test(msg)) {
    return `${action}: o banco de dados está desatualizado (falta uma coluna). Aplique a migração 04 e as seguintes (05, 06...) de supabase/migrations no SQL Editor do Supabase. Detalhe: ${msg}`;
  }
  if (code === '22P02') {
    return `${action}: identificador inválido. O cadastro do paciente ou da conta não chegou a ser gravado no banco.`;
  }
  if (code === '23503') {
    return `${action}: o paciente ou psicólogo referenciado não existe no banco.`;
  }
  return `${action}: ${msg}`;
}

const SESSION_COLUMNS = [
  'id', 'appointment_id', 'psychologist_id', 'patient_id', 'session_number', 'session_date',
  'duration_minutes', 'modality', 'main_topics', 'summary', 'soap_subjective', 'soap_objective',
  'soap_assessment', 'soap_plan', 'interventions_used', 'evolution_observed', 'homework_assigned',
  'next_session_plan', 'status',
] as const;

/** Mantém somente colunas que existem em therapy_sessions (descarta campos só de tela, como private_notes). */
function toSessionRow(session: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  for (const col of SESSION_COLUMNS) {
    if (session[col] !== undefined) row[col] = session[col];
  }
  return row;
}

/** Colunas de texto opcionais de `patients`: string vazia vira NULL no banco. */
const PATIENT_TEXT_COLUMNS = [
  'social_name', 'phone', 'emergency_contact_name', 'emergency_contact_phone', 'clinical_notes_overview',
  'mobile', 'landline', 'cpf', 'rg', 'country', 'zip_code', 'city', 'state', 'street', 'address_number',
  'neighborhood', 'address_complement', 'birthplace', 'education_level', 'race', 'occupation',
  'relative_name', 'relative_relationship', 'relative_phone', 'how_found_us', 'referred_by',
  'guardian_name', 'guardian_email', 'guardian_mobile', 'guardian_cpf', 'guardian_rg',
] as const;

/** Demais colunas graváveis de `patients` (obrigatórias, datas, booleanos, listas e FKs). */
const PATIENT_OTHER_COLUMNS = [
  'full_name', 'birth_date', 'gender', 'email', 'status', 'started_at', 'ended_at', 'group_id',
  'has_social_name', 'tags', 'guardian_birth_date', 'guardian_allow_billing_contact', 'guardian_send_reminders',
] as const;

/**
 * Mantém somente colunas que existem em `patients`. Campos só de tela (profile, psychologist_id,
 * anamnesis_completed) nunca vão ao banco. Texto vazio vira NULL; data vazia também (sem inventar data).
 */
export function toPatientRow(patient: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  for (const col of PATIENT_TEXT_COLUMNS) {
    if (patient[col] !== undefined) row[col] = patient[col] === '' ? null : patient[col];
  }
  for (const col of PATIENT_OTHER_COLUMNS) {
    if (patient[col] === undefined) continue;
    const isDate = col === 'birth_date' || col === 'guardian_birth_date' || col === 'ended_at';
    row[col] = isDate && patient[col] === '' ? null : patient[col];
  }
  return row;
}

export const SupabaseService = {
  // ==========================================
  // AUTENTICAÇÃO E PERFIL DO USUÁRIO
  // ==========================================
  async getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao buscar perfil:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Erro de conexão com Supabase:', err);
      return null;
    }
  },

  async getPsychologistByProfileId(profileId: string): Promise<Psychologist | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('psychologists')
        .select('*, profile:profiles(*)')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao buscar dados da psicóloga:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Erro de conexão com Supabase:', err);
      return null;
    }
  },

  async ensureProfileAndPsychologist(user: any, metadata?: any): Promise<{ profile: UserProfile; psychologist: Psychologist } | null> {
    if (!isSupabaseConfigured || !supabase || !user) return null;
    try {
      let profile = await this.getCurrentUserProfile(user.id);
      const displayName = metadata?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Psicólogo(a)';
      const role = metadata?.role || user.user_metadata?.role || 'psychologist';
      const crp = metadata?.crp_number || user.user_metadata?.crp_number || '';
      const crpState = metadata?.crp_state || user.user_metadata?.crp_state || 'SP';

      if (!profile) {
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            role,
            full_name: displayName,
            display_name: displayName,
          })
          .select()
          .single();

        if (profileErr) {
          console.warn('Erro ao criar perfil no Supabase:', profileErr.message);
          profile = {
            id: user.id,
            user_id: user.id,
            email: user.email,
            role: role as any,
            full_name: displayName,
            display_name: displayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else {
          profile = newProfile;
        }
      }

      if (!profile) return null;

      let psychologist = await this.getPsychologistByProfileId(profile.id);
      if (!psychologist && profile.role === 'psychologist') {
        const approach = metadata?.approach || user.user_metadata?.approach || 'TCC (Terapia Cognitivo-Comportamental)';
        const psychCrp = metadata?.crp_number || user.user_metadata?.crp_number || '06/000000';
        const psychState = metadata?.crp_state || user.user_metadata?.crp_state || 'SP';

        const { data: newPsych, error: psychErr } = await supabase
          .from('psychologists')
          .insert({
            profile_id: profile.id,
            crp_number: psychCrp,
            crp_state: psychState,
            approach,
            specialties: ['TCC', 'Clínica'],
            bio: 'Atendimento clínico com sigilo profissional.',
            session_default_price: 180,
            session_default_duration_minutes: 50
          })
          .select('*, profile:profiles(*)')
          .single();

        if (psychErr) {
          console.warn('Erro ao criar psicólogo no Supabase:', psychErr.message);
          psychologist = {
            id: `psych-${profile.id}`,
            profile_id: profile.id,
            crp_number: psychCrp,
            crp_state: psychState,
            approach,
            specialties: ['TCC', 'Clínica'],
            bio: 'Atendimento clínico com sigilo profissional.',
            session_default_price: 180,
            session_default_duration_minutes: 50,
            profile
          };
        } else {
          psychologist = newPsych;
        }
      }

      return { profile, psychologist: psychologist! };
    } catch (err) {
      console.warn('Erro em ensureProfileAndPsychologist:', err);
      return null;
    }
  },

  // ==========================================
  // PACIENTES (MULTI-TENANT REAL POR PSICÓLOGO)
  // ==========================================
  /** Retorna null quando a consulta falha (diferente de lista vazia), para a tela não apagar dados por erro de rede. */
  async getPatients(psychologistId?: string): Promise<Patient[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      if (psychologistId) {
        const { data, error } = await supabase
          .from('psychologist_patient_relationships')
          .select('patient:patients(*)')
          .eq('psychologist_id', psychologistId)
          .eq('status', 'active');

        if (error) {
          console.warn('Erro ao buscar vínculos de pacientes:', error.message);
          return null;
        }

        return (data || [])
          .map((rel: any) => rel.patient)
          .filter(Boolean)
          .sort((a: Patient, b: Patient) => a.full_name.localeCompare(b.full_name));
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.warn('Erro ao buscar pacientes:', error.message);
        return null;
      }
      return data || [];
    } catch (err) {
      console.warn('Erro de conexão:', err);
      return null;
    }
  },

  /**
   * Grava paciente + vínculo com o psicólogo.
   * O id é gerado no cliente e o INSERT não usa RETURNING: a política de leitura de patients
   * só enxerga pacientes já vinculados, então insert().select() era recusado pelo RLS.
   */
  async insertPatient(
    patient: Omit<Patient, 'created_at' | 'updated_at'> & { id: string },
    psychologistId: string
  ): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    if (!isUuid(psychologistId)) {
      return { ok: false, error: 'Sua conta de psicólogo ainda não está sincronizada com o banco. Saia e entre novamente.' };
    }
    try {
      const payload: any = {
        ...toPatientRow(patient),
        id: patient.id,
        // Sem data informada grava NULL: antes o banco recebia 01/01/1995 e a idade ficava falsa.
        birth_date: patient.birth_date || null,
        status: patient.status || 'active',
        started_at: patient.started_at || new Date().toISOString(),
      };

      const { error: patientErr } = await supabase.from('patients').upsert([payload], { onConflict: 'id' });
      if (patientErr) {
        console.error('Erro ao inserir paciente no Supabase:', patientErr);
        return { ok: false, error: describeDbError(patientErr, 'Não foi possível cadastrar o paciente') };
      }

      const { error: relErr } = await supabase
        .from('psychologist_patient_relationships')
        .upsert([{
          psychologist_id: psychologistId,
          patient_id: patient.id,
          status: 'active',
          started_at: new Date().toISOString()
        }], { onConflict: 'psychologist_id,patient_id', ignoreDuplicates: true });

      if (relErr) {
        console.error('Erro ao vincular paciente ao psicólogo:', relErr);
        return { ok: false, error: describeDbError(relErr, 'Paciente criado, mas o vínculo com você falhou') };
      }

      return { ok: true };
    } catch (err: any) {
      console.error('Erro de rede:', err);
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    if (!isUuid(id)) {
      return { ok: false, error: 'Este paciente ainda não foi gravado no banco. Cadastre-o novamente.' };
    }
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          ...toPatientRow(updates),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar paciente:', error);
        return { ok: false, error: describeDbError(error, 'Não foi possível salvar as alterações do paciente') };
      }
      return { ok: true };
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  // ==========================================
  // GRUPOS DE PACIENTES
  // ==========================================
  /** Retorna null quando a consulta falha (ex.: migração 06 ainda não aplicada), para a tela manter o que já tem. */
  async getPatientGroups(psychologistId: string): Promise<PatientGroup[] | null> {
    if (!isSupabaseConfigured || !supabase || !isUuid(psychologistId)) return null;
    try {
      const { data, error } = await supabase
        .from('patient_groups')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('name', { ascending: true });
      if (error) {
        console.warn('Erro ao buscar grupos de pacientes:', error.message);
        return null;
      }
      return data || [];
    } catch (err) {
      console.warn('Erro de conexão:', err);
      return null;
    }
  },

  async insertPatientGroup(group: PatientGroup): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    if (!isUuid(group.psychologist_id)) {
      return { ok: false, error: 'Sua conta de psicólogo ainda não está sincronizada com o banco. Saia e entre novamente.' };
    }
    try {
      const { error } = await supabase
        .from('patient_groups')
        .upsert([{ id: group.id, psychologist_id: group.psychologist_id, name: group.name }], { onConflict: 'id' });
      if (error) {
        console.error('Erro ao gravar grupo:', error);
        return { ok: false, error: describeDbError(error, 'Não foi possível criar o grupo') };
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  async updatePatientGroup(id: string, name: string): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    try {
      const { error } = await supabase.from('patient_groups').update({ name }).eq('id', id);
      if (error) return { ok: false, error: describeDbError(error, 'Não foi possível renomear o grupo') };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  async deletePatientGroup(id: string): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    try {
      const { error } = await supabase.from('patient_groups').delete().eq('id', id);
      if (error) return { ok: false, error: describeDbError(error, 'Não foi possível excluir o grupo') };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  async deletePatient(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Erro ao deletar paciente:', err);
      return false;
    }
  },

  // ==========================================
  // SESSÕES CLÍNICAS & NOTAS PRIVADAS (CFP)
  // ==========================================
  /** Retorna null quando a consulta falha (diferente de lista vazia). */
  async getSessions(psychologistId?: string, patientId?: string): Promise<TherapySession[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      let query = supabase
        .from('therapy_sessions')
        .select('*, private_notes:session_private_notes(*)')
        .order('session_date', { ascending: false });

      if (psychologistId) query = query.eq('psychologist_id', psychologistId);
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) {
        console.warn('Erro ao buscar sessões:', error.message);
        return null;
      }

      return (data || []).map((s: any) => ({
        ...s,
        private_notes: Array.isArray(s.private_notes) ? s.private_notes[0] : s.private_notes
      }));
    } catch (err) {
      console.warn('Erro de conexão:', err);
      return null;
    }
  },

  /**
   * Grava a sessão (e as notas privadas) de forma idempotente: o id é gerado no cliente e a escrita é um
   * upsert, então repetir a chamada após uma falha não duplica o registro.
   */
  async insertSession(session: TherapySession, privateNotes?: SessionPrivateNotes): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    if (!isUuid(session.psychologist_id)) {
      return { ok: false, error: 'Sua conta de psicólogo ainda não está sincronizada com o banco. Saia e entre novamente.' };
    }
    if (!isUuid(session.patient_id)) {
      return { ok: false, error: 'Este paciente ainda não foi gravado no banco (cadastro incompleto). Cadastre-o novamente antes de registrar a sessão.' };
    }
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .upsert([toSessionRow(session)], { onConflict: 'id' });

      if (error) {
        console.error('Erro ao salvar sessão no Supabase:', error);
        return { ok: false, error: describeDbError(error, 'Não foi possível gravar a sessão') };
      }

      if (privateNotes && (privateNotes.private_clinical_hypothesis || privateNotes.supervision_notes || privateNotes.risk_assessment_notes || privateNotes.transference_countertransference_notes)) {
        const { error: notesErr } = await supabase
          .from('session_private_notes')
          .upsert([{
            id: privateNotes.id,
            session_id: session.id,
            psychologist_id: session.psychologist_id,
            patient_id: session.patient_id,
            private_clinical_hypothesis: privateNotes.private_clinical_hypothesis || '',
            supervision_notes: privateNotes.supervision_notes || null,
            transference_countertransference_notes: privateNotes.transference_countertransference_notes || null,
            risk_assessment_notes: privateNotes.risk_assessment_notes || null,
          }], { onConflict: 'id' });

        if (notesErr) {
          console.error('Erro ao salvar notas privadas:', notesErr);
          return { ok: false, error: describeDbError(notesErr, 'A sessão foi gravada, mas as anotações privadas não') };
        }
      }

      return { ok: true };
    } catch (err: any) {
      console.error('Erro de rede ao salvar sessão:', err);
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  async updateSession(
    id: string,
    updates: Partial<TherapySession>,
    privateNotesUpdates?: Partial<SessionPrivateNotes>,
    ownerIds?: { psychologist_id: string; patient_id: string }
  ): Promise<WriteResult> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    if (!isUuid(id)) {
      return { ok: false, error: 'Esta sessão nunca foi gravada no banco e não pode ser editada. Registre-a novamente.' };
    }
    try {
      const { id: _ignoredId, ...rowUpdates } = toSessionRow(updates as any);
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ ...rowUpdates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar sessão:', error);
        return { ok: false, error: describeDbError(error, 'Não foi possível atualizar a sessão') };
      }

      if (privateNotesUpdates) {
        const { data: existing, error: findErr } = await supabase
          .from('session_private_notes')
          .select('id')
          .eq('session_id', id)
          .maybeSingle();

        if (findErr) {
          return { ok: false, error: describeDbError(findErr, 'A sessão foi atualizada, mas as anotações privadas não') };
        }

        const notesPayload = {
          private_clinical_hypothesis: privateNotesUpdates.private_clinical_hypothesis || '',
          supervision_notes: privateNotesUpdates.supervision_notes || null,
          transference_countertransference_notes: privateNotesUpdates.transference_countertransference_notes || null,
          risk_assessment_notes: privateNotesUpdates.risk_assessment_notes || null,
          updated_at: new Date().toISOString(),
        };

        const hasContent = Boolean(
          notesPayload.private_clinical_hypothesis ||
          notesPayload.supervision_notes ||
          notesPayload.transference_countertransference_notes ||
          notesPayload.risk_assessment_notes
        );

        let notesErr: { code?: string; message?: string } | null = null;
        if (existing?.id) {
          ({ error: notesErr } = await supabase.from('session_private_notes').update(notesPayload).eq('id', existing.id));
        } else if (hasContent && ownerIds) {
          // Antes, editar uma sessão sem notas privadas descartava as notas novas sem avisar.
          ({ error: notesErr } = await supabase.from('session_private_notes').insert([{
            session_id: id,
            psychologist_id: ownerIds.psychologist_id,
            patient_id: ownerIds.patient_id,
            ...notesPayload,
          }]));
        }
        if (notesErr) {
          return { ok: false, error: describeDbError(notesErr, 'A sessão foi atualizada, mas as anotações privadas não') };
        }
      }

      return { ok: true };
    } catch (err: any) {
      console.error('Erro de rede ao atualizar sessão:', err);
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  // ==========================================
  // FEED DE AGENDA (iCal) — token secreto por psicólogo
  // ==========================================
  /** Devolve o token do feed do psicólogo logado. rotate = true gera um novo e invalida o link anterior. */
  async getCalendarFeedToken(rotate = false): Promise<WriteResult<string>> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    try {
      const { data, error } = await supabase.rpc('get_or_create_calendar_feed_token', { p_rotate: rotate });
      if (error) {
        console.error('Erro ao obter token do feed:', error);
        if (error.code === 'PGRST202' || /Could not find the function/i.test(error.message)) {
          return { ok: false, error: 'O banco ainda não tem a migração 05 (feed de agenda). Aplique-a no SQL Editor do Supabase.' };
        }
        return { ok: false, error: describeDbError(error, 'Não foi possível gerar o link da agenda') };
      }
      if (typeof data !== 'string' || data.length < 48) {
        return { ok: false, error: 'Resposta inválida do servidor ao gerar o link da agenda.' };
      }
      return { ok: true, data };
    } catch (err: any) {
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  // ==========================================
  // AUDITORIA (visão do superadmin, sem conteúdo clínico)
  // ==========================================
  /** Eventos da trilha de auditoria. A visão só devolve linhas para superadmin e nunca traz o conteúdo dos registros. */
  async getAdminAuditLog(options: { from?: number; pageSize?: number; table?: string } = {}): Promise<WriteResult<AdminAuditRow[]>> {
    if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase não configurado.' };
    const from = options.from ?? 0;
    const pageSize = options.pageSize ?? 50;
    try {
      let query = supabase
        .from('clinical_audit_log_admin')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, from + pageSize - 1);
      if (options.table) query = query.eq('table_name', options.table);

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao carregar a trilha de auditoria:', error);
        if (error.code === 'PGRST205' || error.code === '42P01' || /clinical_audit_log_admin/i.test(error.message)) {
          return { ok: false, error: 'A visão de auditoria ainda não existe no banco. Aplique a migração 05 no SQL Editor do Supabase.' };
        }
        return { ok: false, error: describeDbError(error, 'Não foi possível carregar a auditoria') };
      }
      return { ok: true, data: (data || []) as AdminAuditRow[] };
    } catch (err: any) {
      return { ok: false, error: `Sem conexão com o servidor: ${err?.message || err}` };
    }
  },

  async deleteSession(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .delete()
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
      return false;
    }
  },

  // ==========================================
  // AGENDAMENTOS
  // ==========================================
  async getAppointments(psychologistId?: string, patientId?: string): Promise<Appointment[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('appointments').select('*').order('starts_at', { ascending: true });
      if (psychologistId) query = query.eq('psychologist_id', psychologistId);
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) {
        console.warn('Erro ao buscar agendamentos:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Erro de rede:', err);
      return [];
    }
  },

  async insertAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar agendamento:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Erro de rede:', err);
      return null;
    }
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Erro de rede:', err);
      return false;
    }
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Erro ao deletar agendamento:', err);
      return false;
    }
  },

  // ==========================================
  // OBJETIVOS TERAPÊUTICOS
  // ==========================================
  async getGoals(psychologistId?: string, patientId?: string): Promise<Goal[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('goals').select('*').order('created_at', { ascending: false });
      if (psychologistId) query = query.eq('psychologist_id', psychologistId);
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('goals').insert([goal]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // EXERCÍCIOS, MODELOS E RESPOSTAS (RPD)
  // ==========================================
  async getExerciseTemplates(psychologistId?: string): Promise<ExerciseTemplate[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('exercise_templates').select('*').order('created_at', { ascending: false });
      if (psychologistId) {
        query = query.or(`psychologist_id.eq.${psychologistId},is_public_library.eq.true`);
      }
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertExerciseTemplate(template: Omit<ExerciseTemplate, 'id' | 'created_at'>): Promise<ExerciseTemplate | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('exercise_templates').insert([template]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async getAssignedExercises(psychologistId?: string, patientId?: string): Promise<AssignedExercise[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase
        .from('assigned_exercises')
        .select('*, answer:exercise_answers(*), feedback:exercise_feedback(*)')
        .order('assigned_at', { ascending: false });

      if (psychologistId) query = query.eq('psychologist_id', psychologistId);
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return [];

      return (data || []).map((e: any) => ({
        ...e,
        answer: Array.isArray(e.answer) ? e.answer[0] : e.answer,
        feedback: Array.isArray(e.feedback) ? e.feedback[0] : e.feedback,
      }));
    } catch {
      return [];
    }
  },

  async insertAssignedExercise(exercise: Omit<AssignedExercise, 'id' | 'created_at'>): Promise<AssignedExercise | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { template, answer, feedback, ...cleanPayload } = exercise as any;
      const { data, error } = await supabase.from('assigned_exercises').insert([cleanPayload]).select().single();
      if (error) {
        console.error('Erro ao atribuir exercício:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Erro de rede:', err);
      return null;
    }
  },

  async submitExerciseResponse(assignedExerciseId: string, patientId: string, responses: Record<string, any>, notes?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error: ansErr } = await supabase
        .from('exercise_answers')
        .insert([{
          assigned_exercise_id: assignedExerciseId,
          patient_id: patientId,
          responses,
          patient_notes: notes || null,
          submitted_at: new Date().toISOString()
        }]);

      if (ansErr) {
        console.error('Erro ao salvar resposta do exercício:', ansErr.message);
        return false;
      }

      await supabase
        .from('assigned_exercises')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assignedExerciseId);

      return true;
    } catch (err) {
      console.error('Erro de rede ao responder exercício:', err);
      return false;
    }
  },

  async insertExerciseFeedback(assignedExerciseId: string, psychologistId: string, feedbackText: string, clinicalObservations?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error: fbErr } = await supabase
        .from('exercise_feedback')
        .insert([{
          assigned_exercise_id: assignedExerciseId,
          psychologist_id: psychologistId,
          feedback_text: feedbackText,
          clinical_observations: clinicalObservations || null,
          created_at: new Date().toISOString()
        }]);

      if (fbErr) return false;

      await supabase
        .from('assigned_exercises')
        .update({
          status: 'reviewed',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', assignedExerciseId);

      return true;
    } catch {
      return false;
    }
  },

  // ==========================================
  // DIÁRIO & HUMOR
  // ==========================================
  async getDiaryEntries(patientId?: string, psychologistId?: string): Promise<DiaryEntry[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('diary_entries').select('*').order('entry_date', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at' | 'entry_date'> & { entry_date?: string }): Promise<DiaryEntry | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('diary_entries').insert([{
        ...entry,
        entry_date: entry.entry_date || new Date().toISOString()
      }]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('diary_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteDiaryEntry(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('diary_entries').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async getMoodLogs(patientId?: string): Promise<MoodLog[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('mood_logs').select('*').order('logged_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertMoodLog(log: Omit<MoodLog, 'id' | 'created_at' | 'logged_at'> & { logged_at?: string }): Promise<MoodLog | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('mood_logs').insert([{
        ...log,
        logged_at: log.logged_at || new Date().toISOString()
      }]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  // ==========================================
  // ESCALAS PSICOMÉTRICAS
  // ==========================================
  async getPsychometricResults(patientId?: string, psychologistId?: string): Promise<PsychometricResult[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('psychometric_results').select('*').order('taken_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (psychologistId) query = query.eq('psychologist_id', psychologistId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertPsychometricResult(result: Omit<PsychometricResult, 'id' | 'taken_at'> & { taken_at?: string }): Promise<PsychometricResult | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('psychometric_results').insert([{
        ...result,
        taken_at: result.taken_at || new Date().toISOString()
      }]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  // ==========================================
  // DIAGRAMAS COGNITIVOS & ÂNCORAS DE VOZ
  // ==========================================
  async getCognitiveDiagrams(patientId?: string, psychologistId?: string): Promise<CognitiveDiagram[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('cognitive_diagrams').select('*').order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (psychologistId) query = query.eq('psychologist_id', psychologistId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertCognitiveDiagram(diagram: Omit<CognitiveDiagram, 'id' | 'created_at'>): Promise<CognitiveDiagram | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('cognitive_diagrams').insert([{
        patient_id: diagram.patient_id,
        psychologist_id: diagram.psychologist_id,
        situation: diagram.situation,
        automatic_thoughts: diagram.automatic_thought,
        emotions: Array.isArray(diagram.emotions) ? diagram.emotions.join(', ') : diagram.emotions,
        bodily_sensations: diagram.physiological_reaction,
        behaviors: diagram.behavior,
        alternative_thought: diagram.alternative_thought,
        suds_score: diagram.outcome_emotion_intensity || 0,
        created_at: new Date().toISOString()
      }]).select().single();

      if (error) {
        console.error('Erro ao salvar diagrama cognitivo:', error.message);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  async getVoiceAnchors(patientId?: string, psychologistId?: string): Promise<VoiceAnchor[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('voice_anchors').select('*').order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      if (psychologistId) query = query.eq('psychologist_id', psychologistId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertVoiceAnchor(anchor: Omit<VoiceAnchor, 'id' | 'created_at'>): Promise<VoiceAnchor | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('voice_anchors').insert([anchor]).select().single();
      if (error) {
        console.error('Erro ao salvar âncora de voz:', error.message);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  // ==========================================
  // CONTRATOS & CONSENTIMENTOS LGPD
  // ==========================================
  async saveTherapeuticConsent(params: {
    userId: string;
    termsVersion: string;
    details?: Record<string, any>;
  }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('consents').insert([{
        user_id: params.userId,
        consent_type: 'therapeutic_contract_lgpd',
        terms_version: params.termsVersion,
        granted: true,
        granted_at: new Date().toISOString()
      }]);

      if (error) {
        console.warn('Erro ao registrar consentimento no Supabase:', error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // ==========================================
  // CONVITES DE PACIENTES
  // ==========================================
  async getPatientInvites(psychologistId: string): Promise<PatientInvite[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('patient_invites')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertPatientInvite(invite: Omit<PatientInvite, 'id' | 'created_at'>): Promise<PatientInvite | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('patient_invites').insert([invite]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  // ==========================================
  // MÓDULO FINANCEIRO (TRANSAÇÕES, CATEGORIAS & PACOTES)
  // ==========================================
  async getFinancialTransactions(psychologistId: string): Promise<FinancialTransaction[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('due_date', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertFinancialTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialTransaction | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao inserir transação financeira:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Erro na chamada Supabase de transação:', err);
      return null;
    }
  },

  async updateFinancialTransaction(id: string, updates: Partial<FinancialTransaction>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async deleteFinancialTransaction(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  async getFinancialCategories(psychologistId?: string): Promise<FinancialCategory[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('financial_categories').select('*');
      if (psychologistId) {
        query = query.or(`psychologist_id.is.null,psychologist_id.eq.${psychologistId}`);
      }
      const { data, error } = await query.order('name');
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getPatientPackages(psychologistId: string, patientId?: string): Promise<PatientPackage[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase
        .from('patient_packages')
        .select('*')
        .eq('psychologist_id', psychologistId);

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertPatientPackage(pkg: Omit<PatientPackage, 'id' | 'created_at' | 'updated_at'>): Promise<PatientPackage | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('patient_packages')
        .insert([pkg])
        .select()
        .single();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updatePatientPackage(id: string, updates: Partial<PatientPackage>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('patient_packages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }
};
