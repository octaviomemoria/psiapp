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
  PlatformAuditLog,
  FinancialCategory,
  FinancialTransaction,
  PatientPackage
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

export const INITIAL_FINANCIAL_CATEGORIES: FinancialCategory[] = [
  // Receitas
  { id: 'cat-inc-individual', name: 'Atendimento Clínico Individual', type: 'income', icon: 'user', color: '#0d9488', is_tax_deductible: false, is_system: true },
  { id: 'cat-inc-package', name: 'Pacote / Mensalidade de Sessões', type: 'income', icon: 'layers', color: '#059669', is_tax_deductible: false, is_system: true },
  { id: 'cat-inc-couple', name: 'Terapia de Casal / Familiar', type: 'income', icon: 'users', color: '#0284c7', is_tax_deductible: false, is_system: true },
  { id: 'cat-inc-supervision-given', name: 'Supervisão Clínica Ministrada', type: 'income', icon: 'graduation-cap', color: '#7c3aed', is_tax_deductible: false, is_system: true },
  { id: 'cat-inc-evaluation', name: 'Avaliação Psicológica & Laudos', type: 'income', icon: 'file-text', color: '#d97706', is_tax_deductible: false, is_system: true },
  { id: 'cat-inc-workshops', name: 'Palestras, Cursos & Workshops', type: 'income', icon: 'presentation', color: '#dc2626', is_tax_deductible: false, is_system: true },
  { id: 'cat-inc-other', name: 'Outras Receitas', type: 'income', icon: 'plus-circle', color: '#64748b', is_tax_deductible: false, is_system: true },
  
  // Despesas (com indicação de dedutibilidade no Livro Caixa / Carnê-Leão da Receita Federal)
  { id: 'cat-exp-rent', name: 'Sublocação / Aluguel de Sala', type: 'expense', icon: 'building', color: '#e11d48', is_tax_deductible: true, is_system: true },
  { id: 'cat-exp-crp', name: 'Anuidade CRP / CFP / e-Psi', type: 'expense', icon: 'award', color: '#9333ea', is_tax_deductible: true, is_system: true },
  { id: 'cat-exp-supervision-recv', name: 'Supervisão Clínica Recebida', type: 'expense', icon: 'user-check', color: '#2563eb', is_tax_deductible: true, is_system: true },
  { id: 'cat-exp-courses', name: 'Cursos, Especialização & Livros', type: 'expense', icon: 'book-open', color: '#0891b2', is_tax_deductible: true, is_system: true },
  { id: 'cat-exp-tests', name: 'Testes Psicométricos & Materiais', type: 'expense', icon: 'clipboard-list', color: '#ea580c', is_tax_deductible: true, is_system: true },
  { id: 'cat-exp-software', name: 'Softwares, Apps & Telefonia', type: 'expense', icon: 'laptop', color: '#4f46e5', is_tax_deductible: true, is_system: true },
  { id: 'cat-exp-marketing', name: 'Marketing & Divulgação', type: 'expense', icon: 'megaphone', color: '#d97706', is_tax_deductible: false, is_system: true },
  { id: 'cat-exp-accounting', name: 'Contabilidade & Tarifas Bancárias', type: 'expense', icon: 'calculator', color: '#475569', is_tax_deductible: false, is_system: true },
  { id: 'cat-exp-taxes', name: 'Impostos (Carnê-Leão / DAS / ISS)', type: 'expense', icon: 'landmark', color: '#b91c1c', is_tax_deductible: false, is_system: true },
  { id: 'cat-exp-other', name: 'Outras Despesas Operacionais', type: 'expense', icon: 'receipt', color: '#64748b', is_tax_deductible: false, is_system: true },
];

export const INITIAL_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [];
export const INITIAL_PATIENT_PACKAGES: PatientPackage[] = [];

