import {
  UserProfile,
  Psychologist,
  Patient,
  Appointment,
  TherapySession,
  Goal,
  ExerciseTemplate,
  AssignedExercise,
  DiaryEntry,
  MoodLog,
  ContentItem,
  PatientContent,
  InAppNotification,
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

export const INITIAL_PSYCHOLOGIST_PROFILE: UserProfile = {
  id: '',
  full_name: 'Meu Consultório',
  display_name: 'Psicólogo(a)',
  email: '',
  phone: '',
  role: 'psychologist',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_PSYCHOLOGIST: Psychologist = {
  id: '',
  profile_id: '',
  crp_number: '',
  crp_state: 'SP',
  approach: 'Psicoterapia Clínica',
  specialties: ['TCC', 'Práticas Baseadas em Evidências'],
  bio: 'Atendimento clínico com sigilo profissional.',
  session_default_price: 200,
  session_default_duration_minutes: 50,
  profile: INITIAL_PSYCHOLOGIST_PROFILE,
};

// Coleções 100% limpas (zero dados mockados)
export const INITIAL_PATIENTS: Patient[] = [];
export const INITIAL_APPOINTMENTS: Appointment[] = [];
export const INITIAL_SESSIONS: TherapySession[] = [];
export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_EXERCISE_TEMPLATES: ExerciseTemplate[] = [];
export const INITIAL_ASSIGNED_EXERCISES: AssignedExercise[] = [];
export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [];
export const INITIAL_MOOD_LOGS: MoodLog[] = [];
export const INITIAL_CONTENT_ITEMS: ContentItem[] = [];
export const INITIAL_PATIENT_CONTENTS: PatientContent[] = [];
export const INITIAL_NOTIFICATIONS: InAppNotification[] = [];
export const INITIAL_PSYCHOMETRIC_RESULTS: PsychometricResult[] = [];
export const INITIAL_COGNITIVE_DIAGRAMS: CognitiveDiagram[] = [];
export const INITIAL_VOICE_ANCHORS: VoiceAnchor[] = [];
export const INITIAL_INVITES: PatientInvite[] = [];

export const INITIAL_CLINIC: Clinic = {
  id: '',
  name: 'Minha Clínica',
  trade_name: 'Clínica de Psicologia',
  email: '',
  owner_user_id: '',
  active: true,
  created_at: new Date().toISOString()
};

export const INITIAL_CLINIC_PSYCHOLOGISTS: ClinicPsychologist[] = [];
export const INITIAL_CLINIC_ROOMS: ClinicRoom[] = [];

export const INITIAL_SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'plan-single',
    code: 'single',
    name: 'Consultório Individual',
    price_monthly: 97,
    max_psychologists: 1,
    features: ['Prontuário SOAP', 'Agenda & WhatsApp', 'Exercícios TCC & ACT', 'Diário Emocional']
  },
  {
    id: 'plan-clinic-pro',
    code: 'clinic_pro',
    name: 'Clínica Pro (Equipe)',
    price_monthly: 247,
    max_psychologists: 5,
    popular: true,
    features: ['Multi-profissionais', 'Gestão de Salas', 'Supervisão Compartilhada', 'Suporte Prioritário']
  },
  {
    id: 'plan-enterprise',
    code: 'clinic_enterprise',
    name: 'Enterprise Multi-Unidades',
    price_monthly: 497,
    max_psychologists: 20,
    features: ['Salas ilimitadas', 'Relatórios Customizados', 'SLA Garantido', 'Gerente de Conta']
  }
];

export const INITIAL_SAAS_TENANTS: SaaSTenant[] = [];
export const INITIAL_PLATFORM_LOGS: PlatformAuditLog[] = [];
export const INITIAL_TEST_ACCOUNTS: { email: string; password: string; role: string }[] = [];
