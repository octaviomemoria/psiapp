import { supabase, isSupabaseConfigured } from './client';
import {
  UserProfile,
  Psychologist,
  Patient,
  Appointment,
  TherapySession,
  Goal,
  AssignedExercise,
  DiaryEntry,
  MoodLog,
  PsychometricResult,
  CognitiveDiagram,
  VoiceAnchor,
  PatientInvite
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

  // ==========================================
  // PACIENTES
  // ==========================================
  async getPatients(psychologistId: string): Promise<Patient[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
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

  async insertPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir paciente no Supabase:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Erro de rede:', err);
      return null;
    }
  },

  // ==========================================
  // SESSÕES CLÍNICAS
  // ==========================================
  async getSessions(psychologistId?: string, patientId?: string): Promise<TherapySession[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('therapy_sessions').select('*').order('session_date', { ascending: false });
      if (psychologistId) query = query.eq('psychologist_id', psychologistId);
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) {
        console.warn('Erro ao buscar sessões:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Erro de conexão:', err);
      return [];
    }
  },

  async insertSession(session: Omit<TherapySession, 'id' | 'created_at' | 'updated_at'>): Promise<TherapySession | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert([session])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar sessão no Supabase:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Erro de rede:', err);
      return null;
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
        .update(updates)
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Erro de rede:', err);
      return false;
    }
  },

  // ==========================================
  // OBJETIVOS TERAPÊUTICOS
  // ==========================================
  async getGoals(patientId?: string): Promise<Goal[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('goals').select('*').order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch (err) {
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

  // ==========================================
  // EXERCÍCIOS ATRIBUÍDOS
  // ==========================================
  async getAssignedExercises(patientId?: string): Promise<AssignedExercise[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('assigned_exercises').select('*').order('assigned_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async insertAssignedExercise(exercise: Omit<AssignedExercise, 'id' | 'created_at'>): Promise<AssignedExercise | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('assigned_exercises').insert([exercise]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  // ==========================================
  // DIÁRIO & HUMOR
  // ==========================================
  async getDiaryEntries(patientId: string): Promise<DiaryEntry[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('patient_id', patientId)
        .order('entry_date', { ascending: false });

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

  async getMoodLogs(patientId: string): Promise<MoodLog[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('logged_at', { ascending: false });

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
  async getPsychometricResults(patientId?: string): Promise<PsychometricResult[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('psychometric_results').select('*').order('taken_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);

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
  }
};
