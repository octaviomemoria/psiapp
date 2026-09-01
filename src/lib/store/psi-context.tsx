'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile,
  Psychologist,
  Patient,
  Appointment,
  TherapySession,
  SessionPrivateNotes,
  Goal,
  ExerciseTemplate,
  AssignedExercise,
  DiaryEntry,
  MoodLog,
  ContentItem,
  PatientContent,
  InAppNotification,
  UserRole,
  AppointmentStatus,
  PaymentStatus,
  GoalStatus,
  PsychometricResult,
  CognitiveDiagram,
  VoiceAnchor,
  PatientInvite,
  Clinic,
  ClinicPsychologist,
  ClinicRoom,
  SaaSTenant,
  SaaSPlan,
  PlatformAuditLog
} from '@/types/database';
import {
  INITIAL_PSYCHOLOGIST,
  INITIAL_PATIENTS,
  INITIAL_EXERCISE_TEMPLATES,
  INITIAL_ASSIGNED_EXERCISES,
  INITIAL_GOALS,
  INITIAL_DIARY_ENTRIES,
  INITIAL_MOOD_LOGS,
  INITIAL_APPOINTMENTS,
  INITIAL_SESSIONS,
  INITIAL_CONTENT_ITEMS,
  INITIAL_PATIENT_CONTENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PSYCHOMETRIC_RESULTS,
  INITIAL_COGNITIVE_DIAGRAMS,
  INITIAL_VOICE_ANCHORS,
  INITIAL_INVITES,
  INITIAL_CLINIC,
  INITIAL_CLINIC_PSYCHOLOGISTS,
  INITIAL_CLINIC_ROOMS,
  INITIAL_SAAS_PLANS,
  INITIAL_SAAS_TENANTS,
  INITIAL_PLATFORM_LOGS
} from './initial-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { SupabaseService } from '@/lib/supabase/service';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface PsiContextType {
  // Estado de Perfil e Autenticação Supabase
  authUser: SupabaseUser | null;
  authProfile: UserProfile | null;
  isLiveProduction: boolean;
  isAuthLoading: boolean;
  activeDataSource: 'supabase_live' | 'demo_mode';
  currentRole: UserRole;
  currentPsychologist: Psychologist;
  currentPatient: Patient;
  switchRole: (role: UserRole, patientId?: string) => void;
  selectPatientForView: (patientId: string) => void;
  toggleDataSource: (source: 'supabase_live' | 'demo_mode') => void;
  signOut: () => Promise<void>;

  // Coleções de Dados Clínicos
  patients: Patient[];
  appointments: Appointment[];
  sessions: TherapySession[];
  goals: Goal[];
  exerciseTemplates: ExerciseTemplate[];
  assignedExercises: AssignedExercise[];
  diaryEntries: DiaryEntry[];
  moodLogs: MoodLog[];
  contentItems: ContentItem[];
  patientContents: PatientContent[];
  notifications: InAppNotification[];
  psychometricResults: PsychometricResult[];
  cognitiveDiagrams: CognitiveDiagram[];
  voiceAnchors: VoiceAnchor[];
  patientInvites: PatientInvite[];

  // Coleções do Gerente da Clínica & SuperAdmin SaaS
  clinic: Clinic;
  clinicPsychologists: ClinicPsychologist[];
  clinicRooms: ClinicRoom[];
  saasPlans: SaaSPlan[];
  saasTenants: SaaSTenant[];
  platformLogs: PlatformAuditLog[];

  // Notificações
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<InAppNotification, 'id' | 'created_at'>) => void;

  // Ações do Psicólogo
  addPatient: (patient: Omit<Patient, 'id' | 'started_at'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addSession: (session: Omit<TherapySession, 'id' | 'created_at'>, privateNotes?: Omit<SessionPrivateNotes, 'id' | 'session_id' | 'psychologist_id' | 'patient_id' | 'created_at' | 'updated_at'>) => void;
  updateSession: (id: string, updates: Partial<TherapySession>, privateNotesUpdates?: Partial<SessionPrivateNotes>) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, cancellationReason?: string) => void;
  updateAppointmentPayment: (id: string, paymentStatus: PaymentStatus, price?: number, receiptNumber?: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  createExerciseTemplate: (template: Omit<ExerciseTemplate, 'id' | 'created_at'>) => ExerciseTemplate;
  assignExercise: (patientId: string, templateId: string, customInstructions?: string, dueDate?: string) => void;
  addExerciseFeedback: (assignmentId: string, feedbackText: string, clinicalObservations?: string) => void;
  assignContentToPatient: (patientId: string, contentId: string, personalizedNote?: string) => void;
  
  // Novas Ferramentas Clínicas & Gestão
  addPsychometricResult: (result: Omit<PsychometricResult, 'id' | 'taken_at'>) => void;
  addCognitiveDiagram: (diagram: Omit<CognitiveDiagram, 'id' | 'created_at'>) => void;
  addVoiceAnchor: (anchor: Omit<VoiceAnchor, 'id' | 'created_at'>) => void;
  createPatientInvite: (name: string, email: string, phone: string) => PatientInvite;
  acceptPatientInvite: (token: string, password?: string) => boolean;

  // Ações do Gerente da Clínica (Dono da Clínica)
  addClinicPsychologist: (psychologist: Omit<ClinicPsychologist, 'id' | 'clinic_id' | 'joined_at'>) => void;
  updateClinicPsychologist: (id: string, updates: Partial<ClinicPsychologist>) => void;
  reassignPatientPsychologist: (patientId: string, newPsychologistId: string, newPsychologistName: string) => void;
  updateRoomStatus: (roomId: string, status: 'available' | 'occupied' | 'maintenance', sessionInfo?: any) => void;

  // Ações do SuperAdmin (Dono do SaaS)
  updateTenantStatus: (tenantId: string, status: 'active' | 'trial' | 'past_due' | 'suspended') => void;
  updateTenantPlan: (tenantId: string, planCode: 'single' | 'clinic_pro' | 'clinic_enterprise') => void;
  addTenant: (tenant: Omit<SaaSTenant, 'id' | 'created_at'>) => void;

  // Ações do Paciente
  submitExerciseResponse: (assignedExerciseId: string, responses: Record<string, any>, notes?: string) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'patient_id' | 'created_at' | 'updated_at'>) => void;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;
  addMoodLog: (mood: Omit<MoodLog, 'id' | 'patient_id' | 'logged_at'>) => void;
  updatePatientContentStatus: (patientContentId: string, status: 'unread' | 'viewed' | 'completed') => void;

  // Resoluções de visualização com segurança
  getVisibleDiaryEntriesForPsychologist: (patientId: string) => DiaryEntry[];
  getPatientDiaryEntries: () => DiaryEntry[];
  getPatientAssignedExercises: () => AssignedExercise[];
  getPatientGoals: () => Goal[];
  getPatientMoodLogs: () => MoodLog[];
  getPatientAppointments: () => Appointment[];
  getPatientContents: () => PatientContent[];
  getPatientPsychometricResults: (patientId?: string) => PsychometricResult[];
  getPatientCognitiveDiagrams: (patientId?: string) => CognitiveDiagram[];
  getPatientVoiceAnchors: (patientId?: string) => VoiceAnchor[];
  getCurrentUserNotifications: () => InAppNotification[];

  // Utilidades
  resetToDemoData: () => void;
  loadLiveDataFromSupabase: () => Promise<void>;
  initializeNewPsychologistAccount: (params: {
    fullName: string;
    email: string;
    crp: string;
    crpState: string;
    approach: string;
  }) => void;
}

const PsiContext = createContext<PsiContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'psiapp_state_v3';
const DATA_SOURCE_KEY = 'psiapp_data_source_v1';

export const PsiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeDataSource, setActiveDataSource] = useState<'supabase_live' | 'demo_mode'>('demo_mode');

  const [currentRole, setCurrentRole] = useState<UserRole>('psychologist');
  const [currentPsychologist, setCurrentPsychologist] = useState<Psychologist>(INITIAL_PSYCHOLOGIST);
  const [currentPatientId, setCurrentPatientId] = useState<string>(INITIAL_PATIENTS[0]?.id || '');

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [sessions, setSessions] = useState<TherapySession[]>(INITIAL_SESSIONS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [exerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplate[]>(INITIAL_EXERCISE_TEMPLATES);
  const [assignedExercises, setAssignedExercises] = useState<AssignedExercise[]>(INITIAL_ASSIGNED_EXERCISES);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(INITIAL_DIARY_ENTRIES);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(INITIAL_MOOD_LOGS);
  const [contentItems, setContentItems] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [patientContents, setPatientContents] = useState<PatientContent[]>(INITIAL_PATIENT_CONTENTS);
  const [notifications, setNotifications] = useState<InAppNotification[]>(INITIAL_NOTIFICATIONS);
  const [psychometricResults, setPsychometricResults] = useState<PsychometricResult[]>(INITIAL_PSYCHOMETRIC_RESULTS);
  const [cognitiveDiagrams, setCognitiveDiagrams] = useState<CognitiveDiagram[]>(INITIAL_COGNITIVE_DIAGRAMS);
  const [voiceAnchors, setVoiceAnchors] = useState<VoiceAnchor[]>(INITIAL_VOICE_ANCHORS);
  const [patientInvites, setPatientInvites] = useState<PatientInvite[]>(INITIAL_INVITES);

  // Estados do Gerente da Clínica e SuperAdmin SaaS
  const [clinic, setClinic] = useState<Clinic>(INITIAL_CLINIC);
  const [clinicPsychologists, setClinicPsychologists] = useState<ClinicPsychologist[]>(INITIAL_CLINIC_PSYCHOLOGISTS);
  const [clinicRooms, setClinicRooms] = useState<ClinicRoom[]>(INITIAL_CLINIC_ROOMS);
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);
  const [saasTenants, setSaasTenants] = useState<SaaSTenant[]>(INITIAL_SAAS_TENANTS);
  const [platformLogs, setPlatformLogs] = useState<PlatformAuditLog[]>(INITIAL_PLATFORM_LOGS);

  const isLiveProduction = activeDataSource === 'supabase_live' || Boolean(authUser);

  const resetToDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DATA_SOURCE_KEY, 'demo_mode');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setActiveDataSource('demo_mode');
    setAuthUser(null);
    setAuthProfile(null);
    setCurrentRole('psychologist');
    setCurrentPsychologist(INITIAL_PSYCHOLOGIST);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setSessions(INITIAL_SESSIONS);
    setGoals(INITIAL_GOALS);
    setExerciseTemplates(INITIAL_EXERCISE_TEMPLATES);
    setAssignedExercises(INITIAL_ASSIGNED_EXERCISES);
    setDiaryEntries(INITIAL_DIARY_ENTRIES);
    setMoodLogs(INITIAL_MOOD_LOGS);
    setContentItems(INITIAL_CONTENT_ITEMS);
    setPatientContents(INITIAL_PATIENT_CONTENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPsychometricResults(INITIAL_PSYCHOMETRIC_RESULTS);
    setCognitiveDiagrams(INITIAL_COGNITIVE_DIAGRAMS);
    setVoiceAnchors(INITIAL_VOICE_ANCHORS);
    setPatientInvites(INITIAL_INVITES);
    setClinic(INITIAL_CLINIC);
    setClinicPsychologists(INITIAL_CLINIC_PSYCHOLOGISTS);
    setClinicRooms(INITIAL_CLINIC_ROOMS);
    setSaasPlans(INITIAL_SAAS_PLANS);
    setSaasTenants(INITIAL_SAAS_TENANTS);
    setPlatformLogs(INITIAL_PLATFORM_LOGS);
    setCurrentPatientId(INITIAL_PATIENTS[0]?.id || '');
  }, []);

  // Carregar dados reais do Supabase para o usuário autenticado
  const loadLiveDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      setAuthUser(user);
      setActiveDataSource('supabase_live');
      if (typeof window !== 'undefined') {
        localStorage.setItem(DATA_SOURCE_KEY, 'supabase_live');
      }

      const provisioned = await SupabaseService.ensureProfileAndPsychologist(user);
      if (provisioned) {
        const { profile, psychologist } = provisioned;
        setAuthProfile(profile);
        setCurrentRole(profile.role as UserRole);

        if (profile.role === 'psychologist' && psychologist) {
          setCurrentPsychologist(psychologist);

          // Carregar pacientes reais do psicólogo
          const livePatients = await SupabaseService.getPatients(psychologist.id);
          if (livePatients && livePatients.length > 0) {
            setPatients(livePatients);
            setCurrentPatientId(livePatients[0].id);
          } else {
            setPatients([]);
            setCurrentPatientId('');
          }

          // Carregar agendamentos e sessões reais
          const liveAppointments = await SupabaseService.getAppointments(psychologist.id);
          setAppointments(liveAppointments || []);

          const liveSessions = await SupabaseService.getSessions(psychologist.id);
          setSessions(liveSessions || []);

          const liveGoals = await SupabaseService.getGoals();
          setGoals(liveGoals || []);

          const liveInvites = await SupabaseService.getPatientInvites(psychologist.id);
          setPatientInvites(liveInvites || []);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do Supabase:', err);
    }
  }, []);

  const initializeNewPsychologistAccount = useCallback((params: {
    fullName: string;
    email: string;
    crp: string;
    crpState: string;
    approach: string;
  }) => {
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      full_name: params.fullName,
      display_name: params.fullName,
      email: params.email,
      role: 'psychologist',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newPsychologist: Psychologist = {
      id: `psych-${Date.now()}`,
      profile_id: newProfile.id,
      crp_number: params.crp || '06/000000',
      crp_state: params.crpState || 'SP',
      approach: params.approach,
      specialties: ['Psicoterapia Clínica', 'TCC / ACT'],
      bio: 'Atendimento clínico com sigilo profissional.',
      session_default_price: 180,
      session_default_duration_minutes: 50,
      profile: newProfile
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(DATA_SOURCE_KEY, 'supabase_live');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    setAuthProfile(newProfile);
    setCurrentPsychologist(newPsychologist);
    setCurrentRole('psychologist');
    setActiveDataSource('supabase_live');
    setPatients([]);
    setAppointments([]);
    setSessions([]);
    setGoals([]);
    setPatientInvites([]);
    setCurrentPatientId('');

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipient_role: 'psychologist',
        title: `Bem-vindo(a) ao PsiApp, ${params.fullName}!`,
        message: 'Seu consultório está pronto. Você já pode convidar seus primeiros pacientes ou cadastrá-los.',
        type: 'feedback_received',
        read: false,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  }, []);

  // Monitorar Autenticação do Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAuthLoading(false);
      return;
    }

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        setActiveDataSource('supabase_live');
        loadLiveDataFromSupabase();
      }
      setIsAuthLoading(false);
    });

    // Escutar alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        setActiveDataSource('supabase_live');
        await loadLiveDataFromSupabase();
      } else {
        if (event === 'SIGNED_OUT') {
          setActiveDataSource('demo_mode');
          resetToDemoData();
        }
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadLiveDataFromSupabase, resetToDemoData]);

  // Carregar do LocalStorage APENAS na montagem inicial (modo demo / persistência offline)
  const isLocalStorageLoaded = useRef(false);

  useEffect(() => {
    if (isLocalStorageLoaded.current) return;
    isLocalStorageLoaded.current = true;

    try {
      const savedSource = localStorage.getItem(DATA_SOURCE_KEY);
      if (savedSource === 'supabase_live' || savedSource === 'demo_mode') {
        setActiveDataSource(savedSource);
      }

      if (savedSource !== 'supabase_live') {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.patients) setPatients(parsed.patients);
          if (parsed.appointments) setAppointments(parsed.appointments);
          if (parsed.sessions) setSessions(parsed.sessions);
          if (parsed.goals) setGoals(parsed.goals);
          if (parsed.exerciseTemplates) setExerciseTemplates(parsed.exerciseTemplates);
          if (parsed.assignedExercises) setAssignedExercises(parsed.assignedExercises);
          if (parsed.diaryEntries) setDiaryEntries(parsed.diaryEntries);
          if (parsed.moodLogs) setMoodLogs(parsed.moodLogs);
          if (parsed.contentItems) setContentItems(parsed.contentItems);
          if (parsed.patientContents) setPatientContents(parsed.patientContents);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.psychometricResults) setPsychometricResults(parsed.psychometricResults);
          if (parsed.cognitiveDiagrams) setCognitiveDiagrams(parsed.cognitiveDiagrams);
          if (parsed.voiceAnchors) setVoiceAnchors(parsed.voiceAnchors);
          if (parsed.patientInvites) setPatientInvites(parsed.patientInvites);
          if (parsed.clinic) setClinic(parsed.clinic);
          if (parsed.clinicPsychologists) setClinicPsychologists(parsed.clinicPsychologists);
          if (parsed.clinicRooms) setClinicRooms(parsed.clinicRooms);
          if (parsed.saasPlans) setSaasPlans(parsed.saasPlans);
          if (parsed.saasTenants) setSaasTenants(parsed.saasTenants);
          if (parsed.platformLogs) setPlatformLogs(parsed.platformLogs);
          if (parsed.currentRole) setCurrentRole(parsed.currentRole);
          if (parsed.currentPatientId) setCurrentPatientId(parsed.currentPatientId);
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar dados do localStorage:', e);
    }
  }, []);

  // Salvar no LocalStorage a cada alteração
  useEffect(() => {
    try {
      localStorage.setItem(DATA_SOURCE_KEY, activeDataSource);
      const stateToSave = {
        patients,
        appointments,
        sessions,
        goals,
        exerciseTemplates,
        assignedExercises,
        diaryEntries,
        moodLogs,
        contentItems,
        patientContents,
        notifications,
        psychometricResults,
        cognitiveDiagrams,
        voiceAnchors,
        patientInvites,
        clinic,
        clinicPsychologists,
        clinicRooms,
        saasPlans,
        saasTenants,
        platformLogs,
        currentRole,
        currentPatientId,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }, [
    patients,
    appointments,
    sessions,
    goals,
    exerciseTemplates,
    assignedExercises,
    diaryEntries,
    moodLogs,
    contentItems,
    patientContents,
    notifications,
    psychometricResults,
    cognitiveDiagrams,
    voiceAnchors,
    patientInvites,
    clinic,
    clinicPsychologists,
    clinicRooms,
    saasPlans,
    saasTenants,
    platformLogs,
    currentRole,
    currentPatientId,
    activeDataSource
  ]);

  const currentPatient = patients.find(p => p.id === currentPatientId) || patients[0] || {
    id: 'pat-default',
    full_name: 'Nenhum paciente selecionado',
    email: '',
    phone: '',
    status: 'active' as const,
    started_at: new Date().toISOString()
  };

  const switchRole = useCallback((role: UserRole, patientId?: string) => {
    setCurrentRole(role);
    if (patientId) {
      setCurrentPatientId(patientId);
    }
  }, []);

  const selectPatientForView = useCallback((patientId: string) => {
    setCurrentPatientId(patientId);
  }, []);

  const toggleDataSource = useCallback((source: 'supabase_live' | 'demo_mode') => {
    setActiveDataSource(source);
    if (source === 'demo_mode') {
      resetToDemoData();
    } else {
      loadLiveDataFromSupabase();
    }
  }, [loadLiveDataFromSupabase]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setAuthProfile(null);
    setActiveDataSource('demo_mode');
    resetToDemoData();
  }, []);

  const addNotification = useCallback((notificationData: Omit<InAppNotification, 'id' | 'created_at'>) => {
    const newNotification: InAppNotification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getCurrentUserNotifications = useCallback(() => {
    if (currentRole === 'psychologist') {
      return notifications.filter(n => n.recipient_role === 'psychologist');
    }
    return notifications.filter(
      n => n.recipient_role === 'patient' && (n.recipient_patient_id === currentPatient.id || !n.recipient_patient_id)
    );
  }, [notifications, currentRole, currentPatient]);

  const unreadNotificationsCount = getCurrentUserNotifications().filter(n => !n.read).length;

  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'started_at'>): Patient => {
    const newId = `pat-${Date.now()}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      started_at: new Date().toISOString(),
      profile: {
        id: `prof-${Date.now()}`,
        full_name: patientData.full_name,
        display_name: patientData.social_name || patientData.full_name.split(' ')[0],
        email: patientData.email,
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    // Atualização otimista
    setPatients(prev => [newPatient, ...prev]);
    setCurrentPatientId(newPatient.id);

    // Sincronização com Supabase
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertPatient({
        ...patientData,
        status: 'active',
        started_at: new Date().toISOString()
      });
    }

    return newPatient;
  }, [isLiveProduction]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addSession = useCallback((
    sessionData: Omit<TherapySession, 'id' | 'created_at'>,
    privateNotesData?: Omit<SessionPrivateNotes, 'id' | 'session_id' | 'psychologist_id' | 'patient_id' | 'created_at' | 'updated_at'>
  ) => {
    const sessionId = `sess-${Date.now()}`;
    let privateNotes: SessionPrivateNotes | undefined = undefined;
    if (privateNotesData) {
      privateNotes = {
        id: `priv-${Date.now()}`,
        session_id: sessionId,
        psychologist_id: sessionData.psychologist_id,
        patient_id: sessionData.patient_id,
        private_clinical_hypothesis: privateNotesData.private_clinical_hypothesis || '',
        supervision_notes: privateNotesData.supervision_notes,
        transference_countertransference_notes: privateNotesData.transference_countertransference_notes,
        risk_assessment_notes: privateNotesData.risk_assessment_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const newSession: TherapySession = {
      ...sessionData,
      id: sessionId,
      private_notes: privateNotes,
      created_at: new Date().toISOString(),
    };

    setSessions(prev => [newSession, ...prev]);

    // Sincronizar com Supabase
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertSession({
        ...sessionData,
        status: 'finalized',
        session_date: new Date().toISOString()
      });
    }
  }, [isLiveProduction]);

  const updateSession = useCallback((
    id: string,
    updates: Partial<TherapySession>,
    privateNotesUpdates?: Partial<SessionPrivateNotes>
  ) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updatedPrivateNotes = privateNotesUpdates && s.private_notes ? {
        ...s.private_notes,
        ...privateNotesUpdates,
        updated_at: new Date().toISOString()
      } : s.private_notes;

      return {
        ...s,
        ...updates,
        private_notes: updatedPrivateNotes,
      };
    }));
  }, []);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      price: appointmentData.price || 220,
      payment_status: appointmentData.payment_status || 'pending',
    };
    setAppointments(prev => [...prev, newAppointment]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertAppointment({
        ...appointmentData,
        price: appointmentData.price || 220,
        payment_status: appointmentData.payment_status || 'pending',
      });
    }
  }, [isLiveProduction]);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus, cancellationReason?: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, cancellation_reason: cancellationReason } : a));

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updateAppointment(id, { status, cancellation_reason: cancellationReason });
    }
  }, [isLiveProduction]);

  const updateAppointmentPayment = useCallback((id: string, paymentStatus: PaymentStatus, price?: number, receiptNumber?: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        payment_status: paymentStatus,
        price: price !== undefined ? price : a.price,
        receipt_number: receiptNumber || a.receipt_number || `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        paid_at: paymentStatus.startsWith('paid') ? new Date().toISOString() : a.paid_at,
      };
    }));

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updateAppointment(id, {
        payment_status: paymentStatus,
        paid_at: paymentStatus.startsWith('paid') ? new Date().toISOString() : undefined,
      });
    }
  }, [isLiveProduction]);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertGoal(goalData);
    }
  }, [isLiveProduction]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g));
  }, []);

  const createExerciseTemplate = useCallback((templateData: Omit<ExerciseTemplate, 'id' | 'created_at'>): ExerciseTemplate => {
    const newTemplate: ExerciseTemplate = {
      ...templateData,
      id: `tpl-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExerciseTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, []);

  const assignExercise = useCallback((patientId: string, templateId: string, customInstructions?: string, dueDate?: string) => {
    const template = exerciseTemplates.find(t => t.id === templateId);
    const instructions = customInstructions || template?.instructions || '';
    const newAssignment: AssignedExercise = {
      id: `assign-${Date.now()}`,
      template_id: templateId,
      psychologist_id: currentPsychologist.id,
      patient_id: patientId,
      title: template?.title || 'Exercício Terapêutico',
      instructions,
      schema_fields: template?.schema_fields || [],
      due_date: dueDate,
      status: 'pending',
      assigned_at: new Date().toISOString(),
      template,
    };
    setAssignedExercises(prev => [newAssignment, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertAssignedExercise({
        template_id: templateId,
        psychologist_id: currentPsychologist.id,
        patient_id: patientId,
        title: template?.title || 'Exercício Terapêutico',
        instructions,
        schema_fields: template?.schema_fields || [],
        due_date: dueDate,
        status: 'pending',
        assigned_at: new Date().toISOString(),
      });
    }
  }, [exerciseTemplates, currentPsychologist, isLiveProduction]);

  const addExerciseFeedback = useCallback((assignmentId: string, feedbackText: string, clinicalObservations?: string) => {
    setAssignedExercises(prev => prev.map(e => {
      if (e.id !== assignmentId) return e;
      return {
        ...e,
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
        feedback: {
          id: `fb-${Date.now()}`,
          assigned_exercise_id: assignmentId,
          psychologist_id: currentPsychologist.id,
          feedback_text: feedbackText,
          clinical_observations: clinicalObservations,
          created_at: new Date().toISOString(),
        }
      };
    }));
  }, [currentPsychologist]);

  const assignContentToPatient = useCallback((patientId: string, contentId: string, personalizedNote?: string) => {
    const content = contentItems.find(c => c.id === contentId);
    const newPatientContent: PatientContent = {
      id: `pc-${Date.now()}`,
      content_id: contentId,
      patient_id: patientId,
      psychologist_id: currentPsychologist.id,
      personalized_note: personalizedNote,
      status: 'unread',
      assigned_at: new Date().toISOString(),
      content,
    };
    setPatientContents(prev => [newPatientContent, ...prev]);
  }, [contentItems, currentPsychologist]);

  const addPsychometricResult = useCallback((resultData: Omit<PsychometricResult, 'id' | 'taken_at'>) => {
    const newResult: PsychometricResult = {
      ...resultData,
      id: `res-${Date.now()}`,
      taken_at: new Date().toISOString(),
    };
    setPsychometricResults(prev => [newResult, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertPsychometricResult({
        ...resultData,
        taken_at: new Date().toISOString()
      });
    }
  }, [isLiveProduction]);

  const addCognitiveDiagram = useCallback((diagramData: Omit<CognitiveDiagram, 'id' | 'created_at'>) => {
    const newDiagram: CognitiveDiagram = {
      ...diagramData,
      id: `diag-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCognitiveDiagrams(prev => [newDiagram, ...prev]);
  }, []);

  const addVoiceAnchor = useCallback((anchorData: Omit<VoiceAnchor, 'id' | 'created_at'>) => {
    const newAnchor: VoiceAnchor = {
      ...anchorData,
      id: `va-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setVoiceAnchors(prev => [newAnchor, ...prev]);
  }, []);

  const createPatientInvite = useCallback((name: string, email: string, phone: string): PatientInvite => {
    const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const newInvite: PatientInvite = {
      id: `inv-${Date.now()}`,
      psychologist_id: currentPsychologist.id,
      token,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    setPatientInvites(prev => [newInvite, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertPatientInvite(newInvite);
    }

    return newInvite;
  }, [currentPsychologist, isLiveProduction]);

  const acceptPatientInvite = useCallback((token: string): boolean => {
    const invite = patientInvites.find(i => i.token === token && i.status === 'pending');
    if (!invite) return false;

    setPatientInvites(prev => prev.map(i => i.id === invite.id ? { ...i, status: 'accepted' } : i));
    
    // Criar paciente correspondente se não existir
    addPatient({
      full_name: invite.patient_name,
      email: invite.patient_email,
      phone: invite.patient_phone,
      birth_date: '1995-01-01',
      gender: 'Não informado',
      status: 'active',
      clinical_notes_overview: 'Paciente cadastrado via convite de onboarding seguro.'
    });

    return true;
  }, [patientInvites, addPatient]);

  const submitExerciseResponse = useCallback((assignedExerciseId: string, responses: Record<string, any>, notes?: string) => {
    setAssignedExercises(prev => prev.map(e => {
      if (e.id !== assignedExerciseId) return e;
      return {
        ...e,
        status: 'completed',
        completed_at: new Date().toISOString(),
        answer: {
          id: `ans-${Date.now()}`,
          assigned_exercise_id: assignedExerciseId,
          patient_id: currentPatient.id,
          responses,
          patient_notes: notes,
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      };
    }));
  }, [currentPatient]);

  const addDiaryEntry = useCallback((entryData: Omit<DiaryEntry, 'id' | 'patient_id' | 'created_at' | 'updated_at'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: `diary-${Date.now()}`,
      patient_id: currentPatient.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDiaryEntries(prev => [newEntry, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertDiaryEntry({
        ...entryData,
        patient_id: currentPatient.id,
      });
    }
  }, [currentPatient, isLiveProduction]);

  const updateDiaryEntry = useCallback((id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
  }, []);

  const deleteDiaryEntry = useCallback((id: string) => {
    setDiaryEntries(prev => prev.filter(d => d.id !== id));
  }, []);

  const addMoodLog = useCallback((moodData: Omit<MoodLog, 'id' | 'patient_id' | 'logged_at'>) => {
    const newMoodLog: MoodLog = {
      ...moodData,
      id: `mood-${Date.now()}`,
      patient_id: currentPatient.id,
      logged_at: new Date().toISOString(),
    };
    setMoodLogs(prev => [...prev, newMoodLog]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertMoodLog({
        ...moodData,
        patient_id: currentPatient.id,
      });
    }
  }, [currentPatient, isLiveProduction]);

  const updatePatientContentStatus = useCallback((patientContentId: string, status: 'unread' | 'viewed' | 'completed') => {
    setPatientContents(prev => prev.map(pc => {
      if (pc.id !== patientContentId) return pc;
      return {
        ...pc,
        status,
        opened_at: status === 'viewed' && !pc.opened_at ? new Date().toISOString() : pc.opened_at,
        completed_at: status === 'completed' ? new Date().toISOString() : pc.completed_at,
      };
    }));
  }, []);

  const getVisibleDiaryEntriesForPsychologist = useCallback((patientId: string): DiaryEntry[] => {
    return diaryEntries.filter(e => e.patient_id === patientId && e.is_shared_with_psychologist);
  }, [diaryEntries]);

  const getPatientDiaryEntries = useCallback((): DiaryEntry[] => {
    return diaryEntries.filter(e => e.patient_id === currentPatient.id);
  }, [diaryEntries, currentPatient]);

  const getPatientAssignedExercises = useCallback((): AssignedExercise[] => {
    return assignedExercises.filter(e => e.patient_id === currentPatient.id);
  }, [assignedExercises, currentPatient]);

  const getPatientGoals = useCallback((): Goal[] => {
    return goals.filter(g => g.patient_id === currentPatient.id && g.visible_to_patient);
  }, [goals, currentPatient]);

  const getPatientMoodLogs = useCallback((): MoodLog[] => {
    return moodLogs.filter(m => m.patient_id === currentPatient.id);
  }, [moodLogs, currentPatient]);

  const getPatientAppointments = useCallback((): Appointment[] => {
    return appointments.filter(a => a.patient_id === currentPatient.id);
  }, [appointments, currentPatient]);

  const getPatientContents = useCallback((): PatientContent[] => {
    return patientContents.filter(pc => pc.patient_id === currentPatient.id);
  }, [patientContents, currentPatient]);

  const getPatientPsychometricResults = useCallback((patientId?: string): PsychometricResult[] => {
    const targetId = patientId || currentPatient.id;
    return psychometricResults.filter(r => r.patient_id === targetId);
  }, [psychometricResults, currentPatient]);

  const getPatientCognitiveDiagrams = useCallback((patientId?: string): CognitiveDiagram[] => {
    const targetId = patientId || currentPatient.id;
    return cognitiveDiagrams.filter(d => d.patient_id === targetId);
  }, [cognitiveDiagrams, currentPatient]);

  const getPatientVoiceAnchors = useCallback((patientId?: string): VoiceAnchor[] => {
    const targetId = patientId || currentPatient.id;
    return voiceAnchors.filter(v => v.patient_id === targetId);
  }, [voiceAnchors, currentPatient]);

  // Ações do Gerente da Clínica (Dono da Clínica)
  const addClinicPsychologist = useCallback((psychologistData: Omit<ClinicPsychologist, 'id' | 'clinic_id' | 'joined_at'>) => {
    const newPsico: ClinicPsychologist = {
      ...psychologistData,
      id: `cpsi-${Date.now()}`,
      clinic_id: clinic.id,
      joined_at: new Date().toISOString(),
    };
    setClinicPsychologists(prev => [...prev, newPsico]);
    addNotification({
      recipient_role: 'manager',
      title: 'Novo Profissional Cadastrado',
      message: `${psychologistData.full_name} (${psychologistData.crp}) foi adicionado(a) à equipe da clínica.`,
      type: 'invite_accepted',
      read: false,
    });
  }, [clinic.id, addNotification]);

  const updateClinicPsychologist = useCallback((id: string, updates: Partial<ClinicPsychologist>) => {
    setClinicPsychologists(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const reassignPatientPsychologist = useCallback((patientId: string, newPsychologistId: string, newPsychologistName: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          clinical_notes_overview: `${p.clinical_notes_overview || ''}\n[Reatribuição Institucional]: Transferido para ${newPsychologistName} em ${new Date().toLocaleDateString('pt-BR')}.`
        };
      }
      return p;
    }));
    addNotification({
      recipient_role: 'manager',
      title: 'Paciente Reatribuído',
      message: `O paciente foi redistribuído com sucesso para o terapeuta ${newPsychologistName}.`,
      type: 'invite_accepted',
      read: false,
    });
  }, [addNotification]);

  const updateRoomStatus = useCallback((roomId: string, status: 'available' | 'occupied' | 'maintenance', sessionInfo?: any) => {
    setClinicRooms(prev => prev.map(r => r.id === roomId ? { ...r, status, current_session_info: sessionInfo } : r));
  }, []);

  // Ações do SuperAdmin (Dono do SaaS)
  const updateTenantStatus = useCallback((tenantId: string, status: 'active' | 'trial' | 'past_due' | 'suspended') => {
    setSaasTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status } : t));
    addNotification({
      recipient_role: 'superadmin',
      title: 'Status de Tenant Atualizado',
      message: `O status da clínica foi alterado para: ${status.toUpperCase()}.`,
      type: 'invite_accepted',
      read: false,
    });
  }, [addNotification]);

  const updateTenantPlan = useCallback((tenantId: string, planCode: 'single' | 'clinic_pro' | 'clinic_enterprise') => {
    const plan = saasPlans.find(p => p.code === planCode);
    setSaasTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          plan_code: planCode,
          monthly_mrr: plan?.price_monthly || t.monthly_mrr,
          max_psychologists: plan?.max_psychologists || t.max_psychologists
        };
      }
      return t;
    }));
    addNotification({
      recipient_role: 'superadmin',
      title: 'Upgrade/Downgrade de Plano',
      message: `Plano do tenant atualizado para ${plan?.name || planCode}.`,
      type: 'invite_accepted',
      read: false,
    });
  }, [saasPlans, addNotification]);

  const addTenant = useCallback((tenantData: Omit<SaaSTenant, 'id' | 'created_at'>) => {
    const newTenant: SaaSTenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setSaasTenants(prev => [newTenant, ...prev]);
    addNotification({
      recipient_role: 'superadmin',
      title: 'Nova Clínica Assinante',
      message: `${tenantData.clinic_name} foi cadastrada com sucesso no plano ${tenantData.plan_code}.`,
      type: 'invite_accepted',
      read: false,
    });
  }, [addNotification]);

  return (
    <PsiContext.Provider
      value={{
        authUser,
        authProfile,
        isLiveProduction,
        isAuthLoading,
        activeDataSource,
        currentRole,
        currentPsychologist,
        currentPatient,
        switchRole,
        selectPatientForView,
        toggleDataSource,
        signOut,
        patients,
        appointments,
        sessions,
        goals,
        exerciseTemplates,
        assignedExercises,
        diaryEntries,
        moodLogs,
        contentItems,
        patientContents,
        notifications,
        psychometricResults,
        cognitiveDiagrams,
        voiceAnchors,
        patientInvites,
        clinic,
        clinicPsychologists,
        clinicRooms,
        saasPlans,
        saasTenants,
        platformLogs,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        addPatient,
        updatePatient,
        addSession,
        updateSession,
        addAppointment,
        updateAppointmentStatus,
        updateAppointmentPayment,
        addGoal,
        updateGoal,
        createExerciseTemplate,
        assignExercise,
        addExerciseFeedback,
        assignContentToPatient,
        addPsychometricResult,
        addCognitiveDiagram,
        addVoiceAnchor,
        createPatientInvite,
        acceptPatientInvite,
        addClinicPsychologist,
        updateClinicPsychologist,
        reassignPatientPsychologist,
        updateRoomStatus,
        updateTenantStatus,
        updateTenantPlan,
        addTenant,
        submitExerciseResponse,
        addDiaryEntry,
        updateDiaryEntry,
        deleteDiaryEntry,
        addMoodLog,
        updatePatientContentStatus,
        getVisibleDiaryEntriesForPsychologist,
        getPatientDiaryEntries,
        getPatientAssignedExercises,
        getPatientGoals,
        getPatientMoodLogs,
        getPatientAppointments,
        getPatientContents,
        getPatientPsychometricResults,
        getPatientCognitiveDiagrams,
        getPatientVoiceAnchors,
        getCurrentUserNotifications,
        resetToDemoData,
        loadLiveDataFromSupabase,
        initializeNewPsychologistAccount,
      }}
    >
      {children}
    </PsiContext.Provider>
  );
};

export const usePsi = (): PsiContextType => {
  const context = useContext(PsiContext);
  if (!context) {
    throw new Error('usePsi deve ser utilizado dentro de um PsiProvider');
  }
  return context;
};
