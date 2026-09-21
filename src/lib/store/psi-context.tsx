'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  UserProfile,
  Psychologist,
  Patient,
  PatientGroup,
  BookingSettings,
  BookingRequest,
  AnamnesisTemplate,
  AnamnesisResponse,
  RecurrenceRule,
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
  PlatformAuditLog,
  FinancialCategory,
  FinancialTransaction,
  PatientPackage,
  FinancialMetrics,
  TransactionStatus
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
  INITIAL_PLATFORM_LOGS,
  INITIAL_FINANCIAL_CATEGORIES,
  INITIAL_FINANCIAL_TRANSACTIONS,
  INITIAL_PATIENT_PACKAGES
} from './initial-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { SupabaseService, WriteResult } from '@/lib/supabase/service';
import { newUuid } from '@/lib/utils';
import { getBillingResponsible } from '@/lib/utils/patient';
import { expandRecurrence, findConflicts } from '@/lib/calendar/schedule-utils';
import { FILL_LINK_VALID_DAYS, generateFillToken } from '@/lib/anamnesis/anamnesis-utils';
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
  patientGroups: PatientGroup[];
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

  // Módulo Financeiro, Livro Caixa & Pacotes
  financialCategories: FinancialCategory[];
  financialTransactions: FinancialTransaction[];
  patientPackages: PatientPackage[];
  financialMetrics: FinancialMetrics;
  addFinancialTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) => FinancialTransaction;
  updateFinancialTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  deleteFinancialTransaction: (id: string) => void;
  addPatientPackage: (pkg: Omit<PatientPackage, 'id' | 'created_at' | 'updated_at'>) => PatientPackage;
  updatePatientPackage: (id: string, updates: Partial<PatientPackage>) => void;
  consumePackageSession: (packageId: string) => void;

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
  /** Só confirma (ok: true) depois que o banco gravou; se falhar, desfaz a alteração na tela. */
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<WriteResult>;
  deletePatient: (id: string) => void;
  addPatientGroup: (name: string) => Promise<WriteResult<PatientGroup>>;
  renamePatientGroup: (id: string, name: string) => Promise<WriteResult>;
  deletePatientGroup: (id: string) => Promise<WriteResult>;
  /** Só confirma (ok: true) depois que o banco gravou; em modo demo grava apenas na memória. */
  addSession: (session: Omit<TherapySession, 'id' | 'created_at'>, privateNotes?: Omit<SessionPrivateNotes, 'id' | 'session_id' | 'psychologist_id' | 'patient_id' | 'created_at' | 'updated_at'>) => Promise<WriteResult>;
  updateSession: (id: string, updates: Partial<TherapySession>, privateNotesUpdates?: Partial<SessionPrivateNotes>) => Promise<WriteResult>;
  deleteSession: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<WriteResult<Appointment>>;
  addAppointmentSeries: (appointment: Omit<Appointment, 'id'>, rule: RecurrenceRule, count: number) => Promise<WriteResult<Appointment[]>>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<WriteResult>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, cancellationReason?: string) => void;
  updateAppointmentPayment: (id: string, paymentStatus: PaymentStatus, price?: number, receiptNumber?: string) => void;
  deleteAppointment: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
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
  addRoom: (room: Omit<ClinicRoom, 'id'>) => Promise<WriteResult<ClinicRoom>>;
  updateRoom: (id: string, updates: Partial<ClinicRoom>) => Promise<WriteResult>;
  deleteRoom: (id: string) => Promise<WriteResult>;

  // Anamnese
  anamnesisTemplates: AnamnesisTemplate[];
  anamnesisResponses: AnamnesisResponse[];
  saveAnamnesisTemplate: (template: AnamnesisTemplate) => Promise<WriteResult<AnamnesisTemplate>>;
  deleteAnamnesisTemplate: (id: string) => Promise<WriteResult>;
  setPatientGroupTemplate: (groupId: string, templateId: string | null) => Promise<WriteResult>;
  createAnamnesisResponse: (patientId: string, template: AnamnesisTemplate, mode: 'fill' | 'link') => Promise<WriteResult<AnamnesisResponse>>;
  updateAnamnesisResponse: (id: string, updates: Partial<Pick<AnamnesisResponse, 'answers' | 'status' | 'fill_token' | 'token_expires_at'>>) => Promise<WriteResult<AnamnesisResponse>>;
  deleteAnamnesisResponse: (id: string) => Promise<WriteResult>;

  // Agendamento online
  bookingSettings: BookingSettings | null;
  bookingRequests: BookingRequest[];
  saveBookingSettings: (settings: BookingSettings) => Promise<WriteResult>;
  approveBookingRequest: (id: string, options?: { room_id?: string | null }) => Promise<WriteResult<Appointment>>;
  declineBookingRequest: (id: string, reason?: string) => Promise<WriteResult>;

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

const LOCAL_STORAGE_KEY = 'psiapp_state_v4';

// Por quanto tempo um registro recém-gravado é preservado caso um recarregamento em tempo real leia o banco antes do commit.
const RECENT_WINDOW_MS = 2 * 60 * 1000;

// Paciente "vazio" exibido quando não há nenhum selecionado. Constante de módulo: uma referência estável
// (um objeto novo a cada render fazia 13 callbacks do contexto serem recriados a cada render).
const NO_PATIENT_SELECTED: Patient = {
  id: 'pat-default',
  full_name: 'Nenhum paciente selecionado',
  email: '',
  phone: '',
  birth_date: '',
  status: 'active',
  started_at: new Date().toISOString(),
};
const DATA_SOURCE_KEY = 'psiapp_data_source_v2';

export const PsiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeDataSource, setActiveDataSource] = useState<'supabase_live' | 'demo_mode'>('supabase_live');

  const [currentRole, setCurrentRole] = useState<UserRole>('psychologist');
  const [currentPsychologist, setCurrentPsychologist] = useState<Psychologist>(INITIAL_PSYCHOLOGIST);
  const [currentPatientId, setCurrentPatientId] = useState<string>(INITIAL_PATIENTS[0]?.id || '');

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [patientGroups, setPatientGroups] = useState<PatientGroup[]>([]);
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
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null);
  const [anamnesisTemplates, setAnamnesisTemplates] = useState<AnamnesisTemplate[]>([]);
  const [anamnesisResponses, setAnamnesisResponses] = useState<AnamnesisResponse[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);

  // Estados do Módulo Financeiro, Livro Caixa & Pacotes
  const [financialCategories, setFinancialCategories] = useState<FinancialCategory[]>(INITIAL_FINANCIAL_CATEGORIES);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(INITIAL_FINANCIAL_TRANSACTIONS);
  const [patientPackages, setPatientPackages] = useState<PatientPackage[]>(INITIAL_PATIENT_PACKAGES);

  // Estados do Gerente da Clínica e SuperAdmin SaaS
  const [clinic, setClinic] = useState<Clinic>(INITIAL_CLINIC);
  const [clinicPsychologists, setClinicPsychologists] = useState<ClinicPsychologist[]>(INITIAL_CLINIC_PSYCHOLOGISTS);
  const [clinicRooms, setClinicRooms] = useState<ClinicRoom[]>(INITIAL_CLINIC_ROOMS);
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);
  const [saasTenants, setSaasTenants] = useState<SaaSTenant[]>(INITIAL_SAAS_TENANTS);
  const [platformLogs, setPlatformLogs] = useState<PlatformAuditLog[]>(INITIAL_PLATFORM_LOGS);

  const isLiveProduction = activeDataSource === 'supabase_live' || Boolean(authUser);

  // Registros gravados há pouco: protegem contra um recarregamento em tempo real que tenha lido o banco antes do commit.
  const recentSessionsRef = useRef<Map<string, { item: TherapySession; at: number }>>(new Map());
  const recentPatientsRef = useRef<Map<string, { item: Patient; at: number }>>(new Map());

  const resetToDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DATA_SOURCE_KEY, 'supabase_live');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('psiapp_state_v3');
    }
    setActiveDataSource('supabase_live');
    setAuthUser(null);
    setAuthProfile(null);
    setCurrentRole('psychologist');
    setCurrentPsychologist(INITIAL_PSYCHOLOGIST);
    setPatients(INITIAL_PATIENTS);
    setPatientGroups([]);
    setBookingSettings(null);
    setBookingRequests([]);
    setAnamnesisTemplates([]);
    setAnamnesisResponses([]);
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
    setFinancialCategories(INITIAL_FINANCIAL_CATEGORIES);
    setFinancialTransactions(INITIAL_FINANCIAL_TRANSACTIONS);
    setPatientPackages(INITIAL_PATIENT_PACKAGES);
    setClinic(INITIAL_CLINIC);
    setClinicPsychologists(INITIAL_CLINIC_PSYCHOLOGISTS);
    setClinicRooms(INITIAL_CLINIC_ROOMS);
    setSaasPlans(INITIAL_SAAS_PLANS);
    setSaasTenants(INITIAL_SAAS_TENANTS);
    setPlatformLogs(INITIAL_PLATFORM_LOGS);
    setCurrentPatientId('');
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

          // Carregar em paralelo todas as coleções clínicas do psicólogo
          const [
            livePatients,
            liveAppointments,
            liveSessions,
            liveGoals,
            liveExercises,
            liveTemplates,
            livePsychometrics,
            liveDiagrams,
            liveAnchors,
            liveDiary,
            liveMoods,
            liveInvites,
            liveCategories,
            liveTransactions,
            livePackages,
            liveGroups,
            liveRooms,
            liveBookingSettings,
            liveBookingRequests,
            liveAnamnesisTemplates,
            liveAnamnesisResponses
          ] = await Promise.all([
            SupabaseService.getPatients(psychologist.id),
            SupabaseService.getAppointments(psychologist.id),
            SupabaseService.getSessions(psychologist.id),
            SupabaseService.getGoals(psychologist.id),
            SupabaseService.getAssignedExercises(psychologist.id),
            SupabaseService.getExerciseTemplates(psychologist.id),
            SupabaseService.getPsychometricResults(undefined, psychologist.id),
            SupabaseService.getCognitiveDiagrams(undefined, psychologist.id),
            SupabaseService.getVoiceAnchors(undefined, psychologist.id),
            SupabaseService.getDiaryEntries(undefined, psychologist.id),
            SupabaseService.getMoodLogs(),
            SupabaseService.getPatientInvites(psychologist.id),
            SupabaseService.getFinancialCategories(psychologist.id),
            SupabaseService.getFinancialTransactions(psychologist.id),
            SupabaseService.getPatientPackages(psychologist.id),
            SupabaseService.getPatientGroups(psychologist.id),
            SupabaseService.getRooms(psychologist.id),
            SupabaseService.getBookingSettings(psychologist.id),
            SupabaseService.getBookingRequests(psychologist.id),
            SupabaseService.getAnamnesisTemplates(psychologist.id),
            SupabaseService.getAnamnesisResponses(psychologist.id),
          ]);

          // null = consulta falhou (ex.: migração 09 pendente): mantém o que já está na tela.
          if (liveAnamnesisTemplates) setAnamnesisTemplates(liveAnamnesisTemplates);
          if (liveAnamnesisResponses) setAnamnesisResponses(liveAnamnesisResponses);

          // null = consulta falhou (ex.: migração 07 pendente): mantém o que já está na tela.
          if (liveRooms) setClinicRooms(liveRooms);
          if (liveBookingRequests) setBookingRequests(liveBookingRequests);
          setBookingSettings(liveBookingSettings);

          // null = consulta falhou (ex.: migração 06 pendente): não apaga os grupos já carregados.
          if (liveGroups) setPatientGroups(liveGroups);

          // null = a consulta falhou: mantém o que já está na tela em vez de apagar tudo.
          if (livePatients) {
            const now = Date.now();
            const liveIds = new Set(livePatients.map(p => p.id));
            const pendingLocal = [...recentPatientsRef.current.values()]
              .filter(r => now - r.at < RECENT_WINDOW_MS && !liveIds.has(r.item.id))
              .map(r => r.item);
            const merged = [...pendingLocal, ...livePatients];
            setPatients(merged);
            setCurrentPatientId(prev => (prev && merged.some(p => p.id === prev)) ? prev : (merged[0]?.id || ''));
          }

          setAppointments(liveAppointments || []);
          if (liveSessions) {
            const now = Date.now();
            const liveIds = new Set(liveSessions.map(s => s.id));
            const pendingLocal = [...recentSessionsRef.current.values()]
              .filter(r => now - r.at < RECENT_WINDOW_MS && !liveIds.has(r.item.id))
              .map(r => r.item);
            setSessions([...pendingLocal, ...liveSessions]);
          }
          setGoals(liveGoals || []);
          setAssignedExercises(liveExercises || []);
          if (liveTemplates && liveTemplates.length > 0) {
            setExerciseTemplates(liveTemplates);
          }
          setPsychometricResults(livePsychometrics || []);
          setCognitiveDiagrams(liveDiagrams || []);
          setVoiceAnchors(liveAnchors || []);
          setDiaryEntries(liveDiary || []);
          setMoodLogs(liveMoods || []);
          setPatientInvites(liveInvites || []);
          if (liveCategories && liveCategories.length > 0) {
            setFinancialCategories(liveCategories);
          }
          setFinancialTransactions(liveTransactions || []);
          setPatientPackages(livePackages || []);
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
    setPatientGroups([]);
    setBookingSettings(null);
    setBookingRequests([]);
    setAnamnesisTemplates([]);
    setAnamnesisResponses([]);
    setAppointments([]);
    setSessions([]);
    setGoals([]);
    setAssignedExercises([]);
    setDiaryEntries([]);
    setMoodLogs([]);
    setPsychometricResults([]);
    setCognitiveDiagrams([]);
    setVoiceAnchors([]);
    setPatientInvites([]);
    setFinancialCategories(INITIAL_FINANCIAL_CATEGORIES);
    setFinancialTransactions([]);
    setPatientPackages([]);
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
          setActiveDataSource('supabase_live');
          resetToDemoData();
        }
      }
      setIsAuthLoading(false);
    });

    // Inscrição em tempo real (Supabase Realtime)
    const realtimeChannel = supabase
      .channel('psi_clinical_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'psychometric_results' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diary_entries' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assigned_exercises' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anamnesis_responses' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
        loadLiveDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_packages' }, () => {
        loadLiveDataFromSupabase();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase?.removeChannel(realtimeChannel);
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
          if (parsed.patientGroups) setPatientGroups(parsed.patientGroups);
          if (parsed.bookingSettings) setBookingSettings(parsed.bookingSettings);
          if (parsed.anamnesisTemplates) setAnamnesisTemplates(parsed.anamnesisTemplates);
          if (parsed.anamnesisResponses) setAnamnesisResponses(parsed.anamnesisResponses);
          if (parsed.bookingRequests) setBookingRequests(parsed.bookingRequests);
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
          if (parsed.financialCategories) setFinancialCategories(parsed.financialCategories);
          if (parsed.financialTransactions) setFinancialTransactions(parsed.financialTransactions);
          if (parsed.patientPackages) setPatientPackages(parsed.patientPackages);
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
        patientGroups,
        bookingSettings,
        bookingRequests,
        anamnesisTemplates,
        anamnesisResponses,
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
        financialCategories,
        financialTransactions,
        patientPackages,
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
    patientGroups,
    bookingSettings,
    bookingRequests,
    anamnesisTemplates,
    anamnesisResponses,
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
    financialCategories,
    financialTransactions,
    patientPackages,
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

  const currentPatient = useMemo(
    () => patients.find(p => p.id === currentPatientId) || patients[0] || NO_PATIENT_SELECTED,
    [patients, currentPatientId]
  );

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
  }, [loadLiveDataFromSupabase, resetToDemoData]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setAuthProfile(null);
    setActiveDataSource('supabase_live');
    resetToDemoData();
  }, [resetToDemoData]);

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
    const psychId = patientData.psychologist_id || currentPsychologist.id;
    // UUID definitivo desde o início: o mesmo id vale na tela e no banco (sem id temporário para reconciliar).
    const newId = newUuid();
    const newPatient: Patient = {
      ...patientData,
      psychologist_id: psychId,
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

    // Atualização otimista no estado da aplicação
    setPatients(prev => [newPatient, ...prev]);
    setCurrentPatientId(newPatient.id);

    if (isSupabaseConfigured && isLiveProduction) {
      recentPatientsRef.current.set(newId, { item: newPatient, at: Date.now() });
      SupabaseService.insertPatient({
        ...patientData,
        id: newId,
        psychologist_id: psychId,
        status: 'active',
        started_at: newPatient.started_at
      }, psychId).then(result => {
        if (result.ok) return;
        // Falhou: não deixa um paciente "fantasma" na lista (sessões dele nunca seriam gravadas).
        recentPatientsRef.current.delete(newId);
        setPatients(prev => prev.filter(p => p.id !== newId));
        setCurrentPatientId(prev => prev === newId ? '' : prev);
        setNotifications(prev => [{
          id: `notif-${Date.now()}-err`,
          recipient_role: 'psychologist',
          title: `Paciente ${patientData.full_name} NÃO foi salvo`,
          message: result.error || 'Falha ao gravar no banco. Cadastre novamente.',
          type: 'feedback_received',
          read: false,
          created_at: new Date().toISOString()
        }, ...prev]);
      });
    }

    return newPatient;
  }, [isLiveProduction, currentPsychologist]);

  const patientsRef = useRef<Patient[]>(patients);
  patientsRef.current = patients;

  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>): Promise<WriteResult> => {
    const previous = patientsRef.current.find(p => p.id === id);
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (!(isSupabaseConfigured && isLiveProduction)) return { ok: true };

    const result = await SupabaseService.updatePatient(id, updates);
    if (!result.ok && previous) {
      // Falhou no banco: devolve só os campos que foram alterados, para a tela não mostrar dado que não foi salvo.
      const restored: Record<string, any> = {};
      for (const key of Object.keys(updates)) restored[key] = (previous as any)[key];
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...restored } : p));
      setNotifications(prev => [{
        id: `notif-${Date.now()}-err`,
        recipient_role: 'psychologist',
        title: `Alterações de ${previous.full_name} NÃO foram salvas`,
        message: result.error || 'Falha ao gravar no banco. Tente novamente.',
        type: 'feedback_received',
        read: false,
        created_at: new Date().toISOString()
      }, ...prev]);
    }
    return result;
  }, [isLiveProduction]);

  const addPatientGroup = useCallback(async (name: string): Promise<WriteResult<PatientGroup>> => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Informe o nome do grupo.' };
    if (patientGroups.some(g => g.name.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false, error: 'Já existe um grupo com esse nome.' };
    }
    const group: PatientGroup = {
      id: newUuid(),
      psychologist_id: currentPsychologist.id,
      name: trimmed,
      created_at: new Date().toISOString(),
    };
    setPatientGroups(prev => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.insertPatientGroup(group);
      if (!result.ok) {
        setPatientGroups(prev => prev.filter(g => g.id !== group.id));
        return { ok: false, error: result.error };
      }
    }
    return { ok: true, data: group };
  }, [patientGroups, currentPsychologist, isLiveProduction]);

  const renamePatientGroup = useCallback(async (id: string, name: string): Promise<WriteResult> => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Informe o nome do grupo.' };
    if (patientGroups.some(g => g.id !== id && g.name.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false, error: 'Já existe um grupo com esse nome.' };
    }
    const previous = patientGroups.find(g => g.id === id);
    setPatientGroups(prev => prev.map(g => g.id === id ? { ...g, name: trimmed } : g).sort((a, b) => a.name.localeCompare(b.name)));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.updatePatientGroup(id, trimmed);
      if (!result.ok && previous) {
        setPatientGroups(prev => prev.map(g => g.id === id ? previous : g));
        return result;
      }
    }
    return { ok: true };
  }, [patientGroups, isLiveProduction]);

  const deletePatientGroup = useCallback(async (id: string): Promise<WriteResult> => {
    const previous = patientGroups.find(g => g.id === id);
    if (!previous) return { ok: true };
    const affected = patientsRef.current.filter(p => p.group_id === id).map(p => p.id);
    setPatientGroups(prev => prev.filter(g => g.id !== id));
    // O banco faz ON DELETE SET NULL; a tela acompanha.
    setPatients(prev => prev.map(p => p.group_id === id ? { ...p, group_id: null } : p));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.deletePatientGroup(id);
      if (!result.ok) {
        setPatientGroups(prev => [...prev, previous].sort((a, b) => a.name.localeCompare(b.name)));
        setPatients(prev => prev.map(p => affected.includes(p.id) ? { ...p, group_id: id } : p));
        return result;
      }
    }
    return { ok: true };
  }, [patientGroups, isLiveProduction]);

  const deletePatient = useCallback((id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (currentPatientId === id) {
      setCurrentPatientId('');
    }
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.deletePatient(id);
    }
  }, [currentPatientId, isLiveProduction]);

  const addSession = useCallback(async (
    sessionData: Omit<TherapySession, 'id' | 'created_at'>,
    privateNotesData?: Omit<SessionPrivateNotes, 'id' | 'session_id' | 'psychologist_id' | 'patient_id' | 'created_at' | 'updated_at'>
  ): Promise<WriteResult> => {
    const sessionId = newUuid();
    const nowIso = new Date().toISOString();
    let privateNotes: SessionPrivateNotes | undefined = undefined;
    if (privateNotesData) {
      privateNotes = {
        id: newUuid(),
        session_id: sessionId,
        psychologist_id: sessionData.psychologist_id,
        patient_id: sessionData.patient_id,
        private_clinical_hypothesis: privateNotesData.private_clinical_hypothesis || '',
        supervision_notes: privateNotesData.supervision_notes,
        transference_countertransference_notes: privateNotesData.transference_countertransference_notes,
        risk_assessment_notes: privateNotesData.risk_assessment_notes,
        created_at: nowIso,
        updated_at: nowIso,
      };
    }

    const newSession: TherapySession = {
      ...sessionData,
      id: sessionId,
      session_date: sessionData.session_date || nowIso,
      private_notes: privateNotes,
      created_at: nowIso,
    };

    // Registro clínico: só entra na tela como "salvo" depois que o banco confirmar.
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.insertSession(newSession, privateNotes);
      if (!result.ok) return result;
      recentSessionsRef.current.set(sessionId, { item: newSession, at: Date.now() });
    }

    setSessions(prev => [newSession, ...prev.filter(s => s.id !== sessionId)]);
    return { ok: true };
  }, [isLiveProduction]);

  const updateSession = useCallback(async (
    id: string,
    updates: Partial<TherapySession>,
    privateNotesUpdates?: Partial<SessionPrivateNotes>
  ): Promise<WriteResult> => {
    const current = sessions.find(s => s.id === id);

    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.updateSession(
        id,
        updates,
        privateNotesUpdates,
        current ? { psychologist_id: current.psychologist_id, patient_id: current.patient_id } : undefined
      );
      if (!result.ok) return result;
    }

    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      let updatedPrivateNotes = s.private_notes;
      if (privateNotesUpdates) {
        updatedPrivateNotes = s.private_notes
          ? { ...s.private_notes, ...privateNotesUpdates, updated_at: new Date().toISOString() }
          : {
              id: newUuid(),
              session_id: s.id,
              psychologist_id: s.psychologist_id,
              patient_id: s.patient_id,
              private_clinical_hypothesis: privateNotesUpdates.private_clinical_hypothesis || '',
              supervision_notes: privateNotesUpdates.supervision_notes,
              transference_countertransference_notes: privateNotesUpdates.transference_countertransference_notes,
              risk_assessment_notes: privateNotesUpdates.risk_assessment_notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
      }
      return { ...s, ...updates, private_notes: updatedPrivateNotes };
    }));
    return { ok: true };
  }, [isLiveProduction, sessions]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.deleteSession(id);
    }
  }, [isLiveProduction]);

  const appointmentsRef = useRef<Appointment[]>(appointments);
  appointmentsRef.current = appointments;

  /** Falhas de gravação aparecem como notificação, para o usuário não achar que algo foi salvo. */
  const pushErrorNotification = useCallback((title: string, message: string) => {
    setNotifications(prev => [{
      id: `notif-${Date.now()}-err`,
      recipient_role: 'psychologist',
      title,
      message,
      type: 'feedback_received',
      read: false,
      created_at: new Date().toISOString()
    }, ...prev]);
  }, []);

  const defaultSessionPrice = currentPsychologist.session_default_price;
  const buildAppointment = useCallback((data: Omit<Appointment, 'id'>, overrides: Partial<Appointment> = {}): Appointment => ({
    ...data,
    id: newUuid(),
    price: data.price || defaultSessionPrice || 220,
    payment_status: data.payment_status || 'pending',
    ...overrides,
  }), [defaultSessionPrice]);

  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>): Promise<WriteResult<Appointment>> => {
    const newAppointment = buildAppointment(appointmentData);
    setAppointments(prev => [...prev, newAppointment]);
    if (!(isSupabaseConfigured && isLiveProduction)) return { ok: true, data: newAppointment };

    const result = await SupabaseService.insertAppointment(newAppointment);
    if (!result.ok) {
      setAppointments(prev => prev.filter(a => a.id !== newAppointment.id));
      pushErrorNotification('Agendamento NÃO foi salvo', result.error || 'Falha ao gravar no banco. Tente novamente.');
      return { ok: false, error: result.error };
    }
    return { ok: true, data: newAppointment };
  }, [isLiveProduction, buildAppointment, pushErrorNotification]);

  /** Cria a série inteira de uma vez (mesmo series_id): ou todas as ocorrências são gravadas ou nenhuma. */
  const addAppointmentSeries = useCallback(async (
    appointmentData: Omit<Appointment, 'id'>,
    rule: RecurrenceRule,
    count: number
  ): Promise<WriteResult<Appointment[]>> => {
    const seriesId = newUuid();
    const created = expandRecurrence(appointmentData.starts_at, appointmentData.ends_at, rule, count).map(occurrence =>
      buildAppointment(appointmentData, { ...occurrence, series_id: seriesId, recurrence_rule: rule })
    );
    setAppointments(prev => [...prev, ...created]);
    if (!(isSupabaseConfigured && isLiveProduction)) return { ok: true, data: created };

    const result = await SupabaseService.insertAppointments(created);
    if (!result.ok) {
      const ids = new Set(created.map(a => a.id));
      setAppointments(prev => prev.filter(a => !ids.has(a.id)));
      pushErrorNotification('Série de agendamentos NÃO foi salva', result.error || 'Falha ao gravar no banco. Tente novamente.');
      return { ok: false, error: result.error };
    }
    return { ok: true, data: created };
  }, [isLiveProduction, buildAppointment, pushErrorNotification]);

  /** Edição e remarcação. Se o banco recusar, a tela volta ao valor anterior. */
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>): Promise<WriteResult> => {
    const previous = appointmentsRef.current.find(a => a.id === id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (!(isSupabaseConfigured && isLiveProduction)) return { ok: true };

    const result = await SupabaseService.updateAppointment(id, updates);
    if (!result.ok && previous) {
      const restored: Record<string, any> = {};
      for (const key of Object.keys(updates)) restored[key] = (previous as any)[key];
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...restored } : a));
      pushErrorNotification('Alteração do agendamento NÃO foi salva', result.error || 'Falha ao gravar no banco. Tente novamente.');
    }
    return result;
  }, [isLiveProduction, pushErrorNotification]);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus, cancellationReason?: string) => {
    updateAppointment(id, { status, cancellation_reason: cancellationReason });
  }, [updateAppointment]);

  const updateAppointmentPayment = useCallback((id: string, paymentStatus: PaymentStatus, price?: number, receiptNumber?: string) => {
    const generatedReceipt = receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();
    const isPaid = paymentStatus.startsWith('paid');

    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        payment_status: paymentStatus,
        price: price !== undefined ? price : a.price,
        receipt_number: generatedReceipt,
        paid_at: isPaid ? nowIso : a.paid_at,
      };
    }));

    // Sincronizar com transação financeira
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      const finalPrice = Number(price !== undefined ? price : (apt.price || 220));
      const patient = patients.find(p => p.id === apt.patient_id);

      setFinancialTransactions(prev => {
        const existing = prev.find(t => t.appointment_id === id);
        if (existing) {
          const updated = prev.map(t => t.id === existing.id ? {
            ...t,
            status: isPaid ? ('completed' as TransactionStatus) : ('pending' as TransactionStatus),
            paid_at: isPaid ? nowIso : undefined,
            amount: finalPrice,
            receipt_number: generatedReceipt,
            updated_at: nowIso
          } : t);
          if (isSupabaseConfigured && isLiveProduction) {
            SupabaseService.updateFinancialTransaction(existing.id, {
              status: isPaid ? 'completed' : 'pending',
              paid_at: isPaid ? nowIso : undefined,
              amount: finalPrice,
              receipt_number: generatedReceipt
            });
          }
          return updated;
        } else {
          const newTx: FinancialTransaction = {
            id: `tx-${Date.now()}`,
            psychologist_id: currentPsychologist.id,
            patient_id: apt.patient_id,
            appointment_id: apt.id,
            title: `Sessão de Psicoterapia - ${apt.patient_name || patient?.full_name || 'Paciente'}`,
            description: `Atendimento clínico agendado para ${apt.starts_at}`,
            type: 'income',
            category_name: 'Atendimento Clínico Individual',
            amount: finalPrice,
            due_date: apt.starts_at ? apt.starts_at.split('T')[0] : nowIso.split('T')[0],
            paid_at: isPaid ? nowIso : undefined,
            status: isPaid ? 'completed' : 'pending',
            payment_method: paymentStatus === 'paid_pix' ? 'pix' : paymentStatus === 'paid_card' ? 'credit_card' : paymentStatus === 'insurance' ? 'insurance_reimbursement' : 'pix',
            receipt_number: generatedReceipt,
            financial_responsible_name: getBillingResponsible(patient, apt.patient_name || 'Paciente').name,
            financial_responsible_cpf: getBillingResponsible(patient).cpf,
            is_tax_deductible: false,
            created_at: nowIso,
            updated_at: nowIso
          };
          if (isSupabaseConfigured && isLiveProduction) {
            SupabaseService.insertFinancialTransaction(newTx);
          }
          return [newTx, ...prev];
        }
      });
    }

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updateAppointment(id, {
        payment_status: paymentStatus,
        paid_at: isPaid ? nowIso : undefined,
      });
    }
  }, [appointments, patients, currentPsychologist.id, isLiveProduction]);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.deleteAppointment(id);
    }
  }, [isLiveProduction]);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    const tempGoalId = `goal-${Date.now()}`;
    const newGoal: Goal = {
      ...goalData,
      id: tempGoalId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertGoal(goalData).then(realGoal => {
        if (realGoal && realGoal.id) {
          setGoals(prev => prev.map(g => g.id === tempGoalId ? realGoal : g));
        }
      });
    }
  }, [isLiveProduction]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g));
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updateGoal(id, updates);
    }
  }, [isLiveProduction]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const createExerciseTemplate = useCallback((templateData: Omit<ExerciseTemplate, 'id' | 'created_at'>): ExerciseTemplate => {
    const tempTplId = `tpl-${Date.now()}`;
    const newTemplate: ExerciseTemplate = {
      ...templateData,
      id: tempTplId,
      created_at: new Date().toISOString(),
    };
    setExerciseTemplates(prev => [newTemplate, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertExerciseTemplate(templateData).then(realTpl => {
        if (realTpl && realTpl.id) {
          setExerciseTemplates(prev => prev.map(t => t.id === tempTplId ? realTpl : t));
        }
      });
    }

    return newTemplate;
  }, [isLiveProduction]);

  const assignExercise = useCallback((patientId: string, templateId: string, customInstructions?: string, dueDate?: string) => {
    const template = exerciseTemplates.find(t => t.id === templateId);
    const instructions = customInstructions || template?.instructions || '';
    const tempAssignId = `assign-${Date.now()}`;
    const newAssignment: AssignedExercise = {
      id: tempAssignId,
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
      }).then(realAssigned => {
        if (realAssigned && realAssigned.id) {
          setAssignedExercises(prev => prev.map(a => a.id === tempAssignId ? { ...realAssigned, template } : a));
        }
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

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertExerciseFeedback(assignmentId, currentPsychologist.id, feedbackText, clinicalObservations);
    }
  }, [currentPsychologist, isLiveProduction]);

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
    const tempResId = `res-${Date.now()}`;
    const newResult: PsychometricResult = {
      ...resultData,
      id: tempResId,
      taken_at: new Date().toISOString(),
    };
    setPsychometricResults(prev => [newResult, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertPsychometricResult({
        ...resultData,
        taken_at: new Date().toISOString()
      }).then(realRes => {
        if (realRes && realRes.id) {
          setPsychometricResults(prev => prev.map(r => r.id === tempResId ? realRes : r));
        }
      });
    }
  }, [isLiveProduction]);

  const addCognitiveDiagram = useCallback((diagramData: Omit<CognitiveDiagram, 'id' | 'created_at'>) => {
    const tempDiagId = `diag-${Date.now()}`;
    const newDiagram: CognitiveDiagram = {
      ...diagramData,
      id: tempDiagId,
      created_at: new Date().toISOString(),
    };
    setCognitiveDiagrams(prev => [newDiagram, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertCognitiveDiagram(diagramData).then(realDiag => {
        if (realDiag && realDiag.id) {
          setCognitiveDiagrams(prev => prev.map(d => d.id === tempDiagId ? realDiag : d));
        }
      });
    }
  }, [isLiveProduction]);

  const addVoiceAnchor = useCallback((anchorData: Omit<VoiceAnchor, 'id' | 'created_at'>) => {
    const tempVaId = `va-${Date.now()}`;
    const newAnchor: VoiceAnchor = {
      ...anchorData,
      id: tempVaId,
      created_at: new Date().toISOString(),
    };
    setVoiceAnchors(prev => [newAnchor, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertVoiceAnchor(anchorData).then(realVa => {
        if (realVa && realVa.id) {
          setVoiceAnchors(prev => prev.map(v => v.id === tempVaId ? realVa : v));
        }
      });
    }
  }, [isLiveProduction]);

  const createPatientInvite = useCallback((name: string, email: string, phone: string): PatientInvite => {
    const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const tempInvId = `inv-${Date.now()}`;
    const newInvite: PatientInvite = {
      id: tempInvId,
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
      SupabaseService.insertPatientInvite(newInvite).then(realInv => {
        if (realInv && realInv.id) {
          setPatientInvites(prev => prev.map(i => i.id === tempInvId ? realInv : i));
        }
      });
    }

    return newInvite;
  }, [currentPsychologist, isLiveProduction]);

  const acceptPatientInvite = useCallback((token: string): boolean => {
    const invite = patientInvites.find(i => i.token === token && i.status === 'pending');
    if (!invite) return false;

    setPatientInvites(prev => prev.map(i => i.id === invite.id ? { ...i, status: 'accepted' } : i));
    
    // Criar paciente correspondente
    addPatient({
      full_name: invite.patient_name,
      email: invite.patient_email,
      phone: invite.patient_phone,
      birth_date: '',
      gender: 'Não informado',
      status: 'active',
      clinical_notes_overview: 'Paciente cadastrado via convite de onboarding seguro.'
    });

    return true;
  }, [patientInvites, addPatient]);

  const submitExerciseResponse = useCallback((assignedExerciseId: string, responses: Record<string, any>, notes?: string) => {
    const now = new Date().toISOString();
    setAssignedExercises(prev => prev.map(e => {
      if (e.id !== assignedExerciseId) return e;
      return {
        ...e,
        status: 'completed',
        completed_at: now,
        answer: {
          id: `ans-${Date.now()}`,
          assigned_exercise_id: assignedExerciseId,
          patient_id: currentPatient.id,
          responses,
          patient_notes: notes,
          submitted_at: now,
          created_at: now,
        }
      };
    }));

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.submitExerciseResponse(assignedExerciseId, currentPatient.id, responses, notes);
    }
  }, [currentPatient, isLiveProduction]);

  const addDiaryEntry = useCallback((entryData: Omit<DiaryEntry, 'id' | 'patient_id' | 'created_at' | 'updated_at'>) => {
    const tempDiaryId = `diary-${Date.now()}`;
    const newEntry: DiaryEntry = {
      ...entryData,
      id: tempDiaryId,
      patient_id: currentPatient.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDiaryEntries(prev => [newEntry, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertDiaryEntry({
        ...entryData,
        patient_id: currentPatient.id,
      }).then(realEntry => {
        if (realEntry && realEntry.id) {
          setDiaryEntries(prev => prev.map(d => d.id === tempDiaryId ? realEntry : d));
        }
      });
    }
  }, [currentPatient, isLiveProduction]);

  const updateDiaryEntry = useCallback((id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updateDiaryEntry(id, updates);
    }
  }, [isLiveProduction]);

  const deleteDiaryEntry = useCallback((id: string) => {
    setDiaryEntries(prev => prev.filter(d => d.id !== id));
    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.deleteDiaryEntry(id);
    }
  }, [isLiveProduction]);

  const addMoodLog = useCallback((moodData: Omit<MoodLog, 'id' | 'patient_id' | 'logged_at'>) => {
    const tempMoodId = `mood-${Date.now()}`;
    const newMoodLog: MoodLog = {
      ...moodData,
      id: tempMoodId,
      patient_id: currentPatient.id,
      logged_at: new Date().toISOString(),
    };
    setMoodLogs(prev => [...prev, newMoodLog]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertMoodLog({
        ...moodData,
        patient_id: currentPatient.id,
      }).then(realMood => {
        if (realMood && realMood.id) {
          setMoodLogs(prev => prev.map(m => m.id === tempMoodId ? realMood : m));
        }
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

  // Salas: do psicólogo logado ficam no banco; no painel do gerente (sem conta de psicólogo) ficam só na tela.
  const shouldPersistRooms = isSupabaseConfigured && isLiveProduction && currentRole === 'psychologist';

  const addRoom = useCallback(async (roomData: Omit<ClinicRoom, 'id'>): Promise<WriteResult<ClinicRoom>> => {
    const room: ClinicRoom = { ...roomData, id: newUuid(), status: roomData.status || 'available' };
    setClinicRooms(prev => [...prev, room].sort((a, b) => a.name.localeCompare(b.name)));
    if (shouldPersistRooms) {
      const result = await SupabaseService.upsertRoom(room, currentPsychologist.id);
      if (!result.ok) {
        setClinicRooms(prev => prev.filter(r => r.id !== room.id));
        return { ok: false, error: result.error };
      }
    }
    return { ok: true, data: room };
  }, [shouldPersistRooms, currentPsychologist.id]);

  const updateRoom = useCallback(async (id: string, updates: Partial<ClinicRoom>): Promise<WriteResult> => {
    const previous = clinicRooms.find(r => r.id === id);
    if (!previous) return { ok: false, error: 'Sala não encontrada.' };
    const next = { ...previous, ...updates };
    setClinicRooms(prev => prev.map(r => r.id === id ? next : r).sort((a, b) => a.name.localeCompare(b.name)));
    if (shouldPersistRooms) {
      const result = await SupabaseService.upsertRoom(next, currentPsychologist.id);
      if (!result.ok) {
        setClinicRooms(prev => prev.map(r => r.id === id ? previous : r));
        return result;
      }
    }
    return { ok: true };
  }, [clinicRooms, shouldPersistRooms, currentPsychologist.id]);

  const deleteRoom = useCallback(async (id: string): Promise<WriteResult> => {
    const previous = clinicRooms.find(r => r.id === id);
    if (!previous) return { ok: true };
    setClinicRooms(prev => prev.filter(r => r.id !== id));
    // O banco faz ON DELETE SET NULL nos agendamentos; a tela acompanha.
    setAppointments(prev => prev.map(a => a.room_id === id ? { ...a, room_id: null } : a));
    if (shouldPersistRooms) {
      const result = await SupabaseService.deleteRoom(id);
      if (!result.ok) {
        setClinicRooms(prev => [...prev, previous].sort((a, b) => a.name.localeCompare(b.name)));
        return result;
      }
    }
    return { ok: true };
  }, [clinicRooms, shouldPersistRooms]);

  const updateRoomStatus = useCallback((roomId: string, status: 'available' | 'occupied' | 'maintenance', sessionInfo?: any) => {
    setClinicRooms(prev => prev.map(r => r.id === roomId ? { ...r, status, current_session_info: sessionInfo } : r));
    if (shouldPersistRooms) {
      const room = clinicRooms.find(r => r.id === roomId);
      if (room) SupabaseService.upsertRoom({ ...room, status }, currentPsychologist.id);
    }
  }, [clinicRooms, shouldPersistRooms, currentPsychologist.id]);

  // Anamnese: modelos personalizados, respostas e vínculo grupo -> modelo
  const saveAnamnesisTemplate = useCallback(async (template: AnamnesisTemplate): Promise<WriteResult<AnamnesisTemplate>> => {
    const toSave: AnamnesisTemplate = {
      ...template,
      psychologist_id: currentPsychologist.id,
      is_system: false,
      updated_at: new Date().toISOString(),
    };
    const previous = anamnesisTemplates.find(t => t.id === toSave.id);
    setAnamnesisTemplates(prev => [...prev.filter(t => t.id !== toSave.id), toSave].sort((a, b) => a.name.localeCompare(b.name)));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.upsertAnamnesisTemplate(toSave, currentPsychologist.id);
      if (!result.ok) {
        setAnamnesisTemplates(prev => previous ? prev.map(t => t.id === toSave.id ? previous : t) : prev.filter(t => t.id !== toSave.id));
        return { ok: false, error: result.error };
      }
    }
    return { ok: true, data: toSave };
  }, [anamnesisTemplates, currentPsychologist.id, isLiveProduction]);

  const deleteAnamnesisTemplate = useCallback(async (id: string): Promise<WriteResult> => {
    const previous = anamnesisTemplates.find(t => t.id === id);
    if (!previous) return { ok: true };
    setAnamnesisTemplates(prev => prev.filter(t => t.id !== id));
    // Grupos que apontavam para o modelo apagado voltam a não ter modelo.
    const affected = patientGroups.filter(g => g.anamnesis_template_id === id).map(g => g.id);
    setPatientGroups(prev => prev.map(g => g.anamnesis_template_id === id ? { ...g, anamnesis_template_id: null } : g));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.deleteAnamnesisTemplate(id);
      if (!result.ok) {
        setAnamnesisTemplates(prev => [...prev, previous].sort((a, b) => a.name.localeCompare(b.name)));
        setPatientGroups(prev => prev.map(g => affected.includes(g.id) ? { ...g, anamnesis_template_id: id } : g));
        return result;
      }
      await Promise.all(affected.map(groupId => SupabaseService.setPatientGroupTemplate(groupId, null)));
    }
    return { ok: true };
  }, [anamnesisTemplates, patientGroups, isLiveProduction]);

  const setPatientGroupTemplate = useCallback(async (groupId: string, templateId: string | null): Promise<WriteResult> => {
    const previous = patientGroups.find(g => g.id === groupId);
    if (!previous) return { ok: false, error: 'Grupo não encontrado.' };
    setPatientGroups(prev => prev.map(g => g.id === groupId ? { ...g, anamnesis_template_id: templateId } : g));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.setPatientGroupTemplate(groupId, templateId);
      if (!result.ok) {
        setPatientGroups(prev => prev.map(g => g.id === groupId ? previous : g));
        return result;
      }
    }
    return { ok: true };
  }, [patientGroups, isLiveProduction]);

  /** mode "fill": psicólogo preenche (rascunho). mode "link": gera link de uso único para o paciente. */
  const createAnamnesisResponse = useCallback(async (
    patientId: string,
    template: AnamnesisTemplate,
    mode: 'fill' | 'link'
  ): Promise<WriteResult<AnamnesisResponse>> => {
    const nowIso = new Date().toISOString();
    const response: AnamnesisResponse = {
      id: newUuid(),
      psychologist_id: currentPsychologist.id,
      patient_id: patientId,
      template_id: template.id,
      template_name: template.name,
      template_snapshot: template.schema.map(f => ({ ...f, options: f.options ? [...f.options] : undefined })),
      answers: {},
      status: mode === 'link' ? 'sent' : 'draft',
      filled_by: mode === 'link' ? 'patient' : 'psychologist',
      completed_at: null,
      fill_token: mode === 'link' ? generateFillToken() : null,
      token_expires_at: mode === 'link' ? new Date(Date.now() + FILL_LINK_VALID_DAYS * 86_400_000).toISOString() : null,
      created_at: nowIso,
      updated_at: nowIso,
    };
    setAnamnesisResponses(prev => [response, ...prev]);
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.upsertAnamnesisResponse(response);
      if (!result.ok) {
        setAnamnesisResponses(prev => prev.filter(r => r.id !== response.id));
        return { ok: false, error: result.error };
      }
    }
    return { ok: true, data: response };
  }, [currentPsychologist.id, isLiveProduction]);

  const updateAnamnesisResponse = useCallback(async (
    id: string,
    updates: Partial<Pick<AnamnesisResponse, 'answers' | 'status' | 'fill_token' | 'token_expires_at'>>
  ): Promise<WriteResult<AnamnesisResponse>> => {
    const previous = anamnesisResponses.find(r => r.id === id);
    if (!previous) return { ok: false, error: 'Anamnese não encontrada.' };
    const next: AnamnesisResponse = {
      ...previous,
      ...updates,
      updated_at: new Date().toISOString(),
      completed_at: updates.status === 'completed' ? (previous.completed_at || new Date().toISOString()) : updates.status ? null : previous.completed_at,
    };
    // Quando o psicólogo conclui ou edita, o link do paciente deixa de valer.
    if (updates.status === 'completed') {
      next.fill_token = null;
      next.token_expires_at = null;
    }
    setAnamnesisResponses(prev => prev.map(r => r.id === id ? next : r));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.upsertAnamnesisResponse(next);
      if (!result.ok) {
        setAnamnesisResponses(prev => prev.map(r => r.id === id ? previous : r));
        return { ok: false, error: result.error };
      }
    }
    return { ok: true, data: next };
  }, [anamnesisResponses, isLiveProduction]);

  const deleteAnamnesisResponse = useCallback(async (id: string): Promise<WriteResult> => {
    const previous = anamnesisResponses.find(r => r.id === id);
    if (!previous) return { ok: true };
    setAnamnesisResponses(prev => prev.filter(r => r.id !== id));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.deleteAnamnesisResponse(id);
      if (!result.ok) {
        setAnamnesisResponses(prev => [previous, ...prev]);
        return result;
      }
    }
    return { ok: true };
  }, [anamnesisResponses, isLiveProduction]);

  // Agendamento online: configuração do link público e solicitações recebidas
  const saveBookingSettings = useCallback(async (settings: BookingSettings): Promise<WriteResult> => {
    const previous = bookingSettings;
    setBookingSettings(settings);
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.saveBookingSettings(settings);
      if (!result.ok) {
        setBookingSettings(previous);
        return result;
      }
    }
    return { ok: true };
  }, [bookingSettings, isLiveProduction]);

  const decideBookingRequest = useCallback(async (id: string, updates: Partial<BookingRequest>): Promise<WriteResult> => {
    const previous = bookingRequests.find(r => r.id === id);
    if (!previous) return { ok: false, error: 'Solicitação não encontrada.' };
    const decidedAt = new Date().toISOString();
    setBookingRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates, decided_at: decidedAt } : r));
    if (isSupabaseConfigured && isLiveProduction) {
      const result = await SupabaseService.updateBookingRequest(id, { ...updates, decided_at: decidedAt });
      if (!result.ok) {
        setBookingRequests(prev => prev.map(r => r.id === id ? previous : r));
        return result;
      }
    }
    return { ok: true };
  }, [bookingRequests, isLiveProduction]);

  const declineBookingRequest = useCallback(async (id: string, reason?: string): Promise<WriteResult> => {
    return decideBookingRequest(id, { status: 'declined', decline_reason: reason?.trim() || null });
  }, [decideBookingRequest]);

  /**
   * Aprova: reconfere o horário, reaproveita o paciente de mesmo e-mail (ou cadastra um novo), cria o agendamento
   * e só então marca a solicitação como aprovada.
   */
  const approveBookingRequest = useCallback(async (id: string, options: { room_id?: string | null } = {}): Promise<WriteResult<Appointment>> => {
    const request = bookingRequests.find(r => r.id === id);
    if (!request) return { ok: false, error: 'Solicitação não encontrada.' };
    if (request.status !== 'pending') return { ok: false, error: 'Esta solicitação já foi respondida.' };

    const conflicts = findConflicts(appointmentsRef.current, {
      starts_at: request.requested_start,
      ends_at: request.requested_end,
      psychologist_id: currentPsychologist.id,
      room_id: options.room_id,
    });
    if (conflicts.length > 0) {
      return { ok: false, error: 'Este horário já está ocupado na sua agenda. Recuse a solicitação ou libere o horário antes de aprovar.' };
    }

    const email = request.email.trim().toLowerCase();
    let patient = patientsRef.current.find(p => (p.email || '').trim().toLowerCase() === email);
    if (!patient) {
      patient = addPatient({
        full_name: request.patient_name,
        email: request.email,
        phone: request.phone || '',
        mobile: request.phone || '',
        birth_date: '',
        status: 'active',
        how_found_us: 'Site ou plataforma de agendamento',
        clinical_notes_overview: request.message || undefined,
      });
    }

    const created = await addAppointment({
      psychologist_id: currentPsychologist.id,
      patient_id: patient.id,
      patient_name: patient.full_name,
      starts_at: request.requested_start,
      ends_at: request.requested_end,
      modality: request.modality,
      location_or_link: undefined,
      room_id: options.room_id ?? null,
      status: 'confirmed',
      notes: request.message ? `Solicitação online: ${request.message}` : 'Solicitado pela página de agendamento online.',
    });
    if (!created.ok || !created.data) return { ok: false, error: created.error };

    const decided = await decideBookingRequest(id, { status: 'approved', appointment_id: created.data.id });
    if (!decided.ok) return { ok: false, error: decided.error };
    return { ok: true, data: created.data };
  }, [bookingRequests, currentPsychologist.id, addAppointment, addPatient, decideBookingRequest]);

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

  // ===========================================================================
  // MÓDULO FINANCEIRO, LIVRO CAIXA & GESTÃO DE PACOTES
  // ===========================================================================

  const financialMetrics: FinancialMetrics = useMemo(() => {
    let totalIncomeReceived = 0;
    let totalIncomePending = 0;
    let totalExpensesPaid = 0;
    let totalExpensesPending = 0;
    let taxDeductibleExpenses = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const t of financialTransactions) {
      if (t.status === 'canceled') continue;

      const amount = Number(t.amount) || 0;
      const isCompleted = t.status === 'completed';
      const isPending = t.status === 'pending';
      const dueDate = t.due_date ? new Date(t.due_date) : null;
      const isOverdue = isPending && dueDate ? dueDate < now : false;

      if (t.type === 'income') {
        if (isCompleted) {
          totalIncomeReceived += amount;
        } else if (isPending) {
          totalIncomePending += amount;
          if (isOverdue) {
            overdueCount += 1;
            overdueAmount += amount;
          }
        }
      } else if (t.type === 'expense') {
        if (isCompleted) {
          totalExpensesPaid += amount;
          if (t.is_tax_deductible) {
            taxDeductibleExpenses += amount;
          }
        } else if (isPending) {
          totalExpensesPending += amount;
        }
      }
    }

    const netIncome = totalIncomeReceived - totalExpensesPaid;

    return {
      totalIncomeReceived,
      totalIncomePending,
      totalExpensesPaid,
      totalExpensesPending,
      netIncome,
      taxDeductibleExpenses,
      overdueCount,
      overdueAmount,
    };
  }, [financialTransactions]);

  const addFinancialTransaction = useCallback((data: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `tx-${Date.now()}`;
    const newTx: FinancialTransaction = {
      ...data,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFinancialTransactions(prev => [newTx, ...prev]);

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertFinancialTransaction(data).then(realTx => {
        if (realTx && realTx.id) {
          setFinancialTransactions(prev => prev.map(t => t.id === tempId ? realTx : t));
        }
      });
    }
    return newTx;
  }, [isLiveProduction]);

  const updateFinancialTransaction = useCallback((id: string, updates: Partial<FinancialTransaction>) => {
    const updated_at = new Date().toISOString();
    setFinancialTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates, updated_at } : t));

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updateFinancialTransaction(id, updates);
    }
  }, [isLiveProduction]);

  const deleteFinancialTransaction = useCallback((id: string) => {
    setFinancialTransactions(prev => prev.filter(t => t.id !== id));

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.deleteFinancialTransaction(id);
    }
  }, [isLiveProduction]);

  const addPatientPackage = useCallback((data: Omit<PatientPackage, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `pkg-${Date.now()}`;
    const newPkg: PatientPackage = {
      ...data,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPatientPackages(prev => [newPkg, ...prev]);

    // Criar transação financeira correspondente para o pacote contratado
    const patient = patients.find(p => p.id === data.patient_id);
    const title = `Pacote de ${data.total_sessions} Sessões - ${patient?.full_name || 'Paciente'}`;
    const nowIso = new Date().toISOString();
    const isPaid = data.payment_status === 'paid';

    addFinancialTransaction({
      psychologist_id: data.psychologist_id,
      patient_id: data.patient_id,
      package_id: tempId,
      title,
      description: data.notes || `Pacote terapêutico (${data.total_sessions} sessões - R$ ${data.session_unit_price}/sessão)`,
      type: 'income',
      category_name: 'Pacote / Mensalidade de Sessões',
      amount: data.total_price,
      due_date: data.start_date || nowIso.split('T')[0],
      paid_at: isPaid ? nowIso : undefined,
      status: isPaid ? 'completed' : 'pending',
      payment_method: 'pix',
      financial_responsible_name: patient ? getBillingResponsible(patient).name : undefined,
      financial_responsible_cpf: getBillingResponsible(patient).cpf,
      is_tax_deductible: false,
    });

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.insertPatientPackage(data).then(realPkg => {
        if (realPkg && realPkg.id) {
          setPatientPackages(prev => prev.map(p => p.id === tempId ? realPkg : p));
        }
      });
    }
    return newPkg;
  }, [isLiveProduction, patients, addFinancialTransaction]);

  const updatePatientPackage = useCallback((id: string, updates: Partial<PatientPackage>) => {
    const updated_at = new Date().toISOString();
    setPatientPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at } : p));

    if (isSupabaseConfigured && isLiveProduction) {
      SupabaseService.updatePatientPackage(id, updates);
    }
  }, [isLiveProduction]);

  const consumePackageSession = useCallback((packageId: string) => {
    setPatientPackages(prev => prev.map(pkg => {
      if (pkg.id !== packageId) return pkg;
      const newCompleted = Math.min(pkg.sessions_completed + 1, pkg.total_sessions);
      const updated = {
        ...pkg,
        sessions_completed: newCompleted,
        updated_at: new Date().toISOString(),
      };
      if (isSupabaseConfigured && isLiveProduction) {
        SupabaseService.updatePatientPackage(packageId, { sessions_completed: newCompleted });
      }
      return updated;
    }));
  }, [isLiveProduction]);

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
        patientGroups,
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
        financialCategories,
        financialTransactions,
        patientPackages,
        financialMetrics,
        addFinancialTransaction,
        updateFinancialTransaction,
        deleteFinancialTransaction,
        addPatientPackage,
        updatePatientPackage,
        consumePackageSession,
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
        deletePatient,
        addPatientGroup,
        renamePatientGroup,
        deletePatientGroup,
        addSession,
        updateSession,
        deleteSession,
        addAppointment,
        addAppointmentSeries,
        updateAppointment,
        updateAppointmentStatus,
        updateAppointmentPayment,
        deleteAppointment,
        addGoal,
        updateGoal,
        deleteGoal,
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
        addRoom,
        updateRoom,
        deleteRoom,
        anamnesisTemplates,
        anamnesisResponses,
        saveAnamnesisTemplate,
        deleteAnamnesisTemplate,
        setPatientGroupTemplate,
        createAnamnesisResponse,
        updateAnamnesisResponse,
        deleteAnamnesisResponse,
        bookingSettings,
        bookingRequests,
        saveBookingSettings,
        approveBookingRequest,
        declineBookingRequest,
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
