import { supabase, isSupabaseConfigured } from './client';
import {
  UserProfile,
  Psychologist,
  Patient,
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
  async getPatients(psychologistId?: string): Promise<Patient[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      if (psychologistId) {
        const { data, error } = await supabase
          .from('psychologist_patient_relationships')
          .select('patient:patients(*)')
          .eq('psychologist_id', psychologistId)
          .eq('status', 'active');

        if (!error && data && data.length > 0) {
          return data
            .map((rel: any) => rel.patient)
            .filter(Boolean)
            .sort((a: Patient, b: Patient) => a.full_name.localeCompare(b.full_name));
        }
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.warn('Erro ao buscar pacientes:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Erro de conexão:', err);
      return [];
    }
  },

  async insertPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>, psychologistId?: string): Promise<Patient | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const payload: any = {
        full_name: patient.full_name,
        social_name: patient.social_name || null,
        birth_date: patient.birth_date || '1995-01-01',
        gender: patient.gender || 'Não informado',
        email: patient.email,
        phone: patient.phone || null,
        emergency_contact_name: patient.emergency_contact_name || null,
        emergency_contact_phone: patient.emergency_contact_phone || null,
        status: patient.status || 'active',
        started_at: patient.started_at || new Date().toISOString(),
        clinical_notes_overview: patient.clinical_notes_overview || null
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir paciente no Supabase:', error.message);
        return null;
      }

      // Vincular na tabela psychologist_patient_relationships para garantir isolamento
      if (data && psychologistId) {
        await supabase
          .from('psychologist_patient_relationships')
          .insert([{
            psychologist_id: psychologistId,
            patient_id: data.id,
            status: 'active',
            started_at: new Date().toISOString()
          }]);
      }

      return data;
    } catch (err) {
      console.error('Erro de rede:', err);
      return null;
    }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      return false;
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
  async getSessions(psychologistId?: string, patientId?: string): Promise<TherapySession[]> {
    if (!isSupabaseConfigured || !supabase) return [];
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
        return [];
      }

      return (data || []).map((s: any) => ({
        ...s,
        private_notes: Array.isArray(s.private_notes) ? s.private_notes[0] : s.private_notes
      }));
    } catch (err) {
      console.warn('Erro de conexão:', err);
      return [];
    }
  },

  async insertSession(
    session: Omit<TherapySession, 'id' | 'created_at' | 'updated_at'>,
    privateNotes?: Omit<SessionPrivateNotes, 'id' | 'session_id' | 'psychologist_id' | 'patient_id' | 'created_at' | 'updated_at'>
  ): Promise<TherapySession | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { private_notes, ...cleanSession } = session as any;
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert([cleanSession])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar sessão no Supabase:', error.message);
        return null;
      }

      // Se houver notas privadas com sigilo absoluto (Resolução CFP)
      if (data && privateNotes && (privateNotes.private_clinical_hypothesis || privateNotes.supervision_notes || privateNotes.risk_assessment_notes)) {
        const { data: notesData } = await supabase
          .from('session_private_notes')
          .insert([{
            session_id: data.id,
            psychologist_id: data.psychologist_id,
            patient_id: data.patient_id,
            private_clinical_hypothesis: privateNotes.private_clinical_hypothesis || '',
            supervision_notes: privateNotes.supervision_notes || null,
            transference_countertransference_notes: privateNotes.transference_countertransference_notes || null,
            risk_assessment_notes: privateNotes.risk_assessment_notes || null,
          }])
          .select()
          .single();

        return {
          ...data,
          private_notes: notesData || undefined
        };
      }

      return data;
    } catch (err) {
      console.error('Erro de rede ao salvar sessão:', err);
      return null;
    }
  },

  async updateSession(
    id: string,
    updates: Partial<TherapySession>,
    privateNotesUpdates?: Partial<SessionPrivateNotes>
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { private_notes, ...cleanUpdates } = updates as any;
      const { error } = await supabase
        .from('therapy_sessions')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar sessão:', error.message);
        return false;
      }

      if (privateNotesUpdates) {
        await supabase
          .from('session_private_notes')
          .update({
            ...privateNotesUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', id);
      }

      return true;
    } catch (err) {
      console.error('Erro de rede ao atualizar sessão:', err);
      return false;
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
