export type UserRole = 'psychologist' | 'patient' | 'admin';

export type SessionModality = 'presencial' | 'online' | 'domiciliar';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show' | 'rescheduled';

export type PaymentStatus = 'pending' | 'paid_pix' | 'paid_card' | 'insurance' | 'free';

export type GoalStatus = 'not_started' | 'in_progress' | 'evolving' | 'completed' | 'paused';

export type ExerciseStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'expired';

export type MoodScore = 1 | 2 | 3 | 4 | 5; // 1: Muito mal, 2: Mal, 3: Neutro, 4: Bem, 5: Muito bem

export type ContentType = 'article' | 'video' | 'audio' | 'pdf' | 'guide';

export type NotificationType = 
  | 'exercise_completed' 
  | 'feedback_received' 
  | 'appointment_reminder' 
  | 'mood_checkin' 
  | 'content_assigned' 
  | 'diary_shared'
  | 'scale_completed'
  | 'invite_accepted';

export interface InAppNotification {
  id: string;
  recipient_role: UserRole;
  recipient_patient_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  target_tab?: string;
  created_at: string;
}

export type ExerciseFieldType = 
  | 'text' 
  | 'textarea' 
  | 'radio' 
  | 'checkbox' 
  | 'scale_10' 
  | 'mood_scale' 
  | 'checklist' 
  | 'date' 
  | 'boolean';

export interface ExerciseSchemaField {
  id: string;
  type: ExerciseFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Para radio, checkbox, checklist
  min?: number;
  max?: number;
  step?: number;
}

export interface UserProfile {
  id: string;
  user_id?: string;
  full_name: string;
  display_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Psychologist {
  id: string;
  profile_id: string;
  crp_number: string;
  crp_state: string;
  e_psi_verified?: boolean;
  approach: string; // Ex: TCC, Psicanálise, Humanista, ACT, DBT
  specialties: string[];
  bio: string;
  session_default_price?: number;
  session_default_duration_minutes?: number;
  profile?: UserProfile;
}

export interface Patient {
  id: string;
  linked_profile_id?: string;
  full_name: string;
  social_name?: string;
  birth_date: string;
  gender?: string;
  email: string;
  phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'inactive' | 'archived' | 'on_hold';
  started_at: string;
  ended_at?: string;
  clinical_notes_overview?: string;
  anamnesis_completed?: boolean;
  profile?: UserProfile;
}

export interface PatientInvite {
  id: string;
  psychologist_id: string;
  patient_id?: string;
  token: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  psychologist_id: string;
  patient_id: string;
  patient_name?: string;
  starts_at: string;
  ends_at: string;
  modality: SessionModality;
  location_or_link?: string;
  status: AppointmentStatus;
  cancellation_reason?: string;
  notes?: string;
  price?: number;
  payment_status?: PaymentStatus;
  receipt_number?: string;
  paid_at?: string;
}

export interface TherapySession {
  id: string;
  appointment_id?: string;
  psychologist_id: string;
  patient_id: string;
  session_number: number;
  session_date: string;
  duration_minutes: number;
  modality: SessionModality;
  main_topics: string[];
  summary: string;
  soap_subjective?: string;
  soap_objective?: string;
  soap_assessment?: string;
  soap_plan?: string;
  interventions_used?: string;
  evolution_observed?: string;
  homework_assigned?: string;
  next_session_plan?: string;
  status: 'draft' | 'finalized' | 'amended';
  private_notes?: SessionPrivateNotes;
  created_at: string;
}

export interface SessionPrivateNotes {
  id: string;
  session_id: string;
  psychologist_id: string;
  patient_id: string;
  private_clinical_hypothesis: string;
  supervision_notes?: string;
  transference_countertransference_notes?: string;
  risk_assessment_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CognitiveDiagram {
  id: string;
  session_id?: string;
  patient_id: string;
  psychologist_id: string;
  situation: string;
  automatic_thought: string;
  meaning_of_thought?: string;
  emotions: string[];
  emotion_intensity: number; // 0-100
  physiological_reaction: string;
  behavior: string;
  alternative_thought?: string;
  outcome_emotion_intensity?: number;
  created_at: string;
}

export interface PsychometricScaleType {
  id: 'phq9' | 'gad7' | 'dass21' | 'bdi2';
  name: string;
  acronym: string;
  description: string;
  questions_count: number;
  estimated_time: string;
  category: 'Depressão' | 'Ansiedade' | 'Múltiplo' | 'Humor';
}

export interface PsychometricResult {
  id: string;
  patient_id: string;
  psychologist_id: string;
  scale_id: 'phq9' | 'gad7' | 'dass21' | 'bdi2';
  scale_name: string;
  total_score: number;
  severity_level: 'Mínima' | 'Leve' | 'Moderada' | 'Moderadamente Grave' | 'Grave' | 'Extremamente Severa';
  risk_flag?: boolean; // Ex: Item 9 do PHQ-9 positivo
  answers: Record<string, number>;
  clinical_interpretation: string;
  taken_at: string;
}

export interface VoiceAnchor {
  id: string;
  patient_id: string;
  psychologist_id: string;
  title: string;
  category: string;
  instruction?: string;
  audio_url?: string;
  duration_seconds: number;
  transcript?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  patient_id: string;
  psychologist_id: string;
  title: string;
  description?: string;
  category: string;
  progress: number; // 0 a 100
  status: GoalStatus;
  target_date?: string;
  visible_to_patient: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseTemplate {
  id: string;
  psychologist_id?: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  schema_fields: ExerciseSchemaField[];
  is_public_library: boolean;
  created_at: string;
}

export interface AssignedExercise {
  id: string;
  template_id?: string;
  psychologist_id: string;
  patient_id: string;
  patient_name?: string;
  title: string;
  instructions: string;
  schema_fields: ExerciseSchemaField[];
  due_date?: string;
  status: ExerciseStatus;
  assigned_at: string;
  completed_at?: string;
  reviewed_at?: string;
  template?: ExerciseTemplate;
  answer?: ExerciseAnswer;
  feedback?: ExerciseFeedback;
}

export interface ExerciseAnswer {
  id: string;
  assigned_exercise_id: string;
  patient_id: string;
  responses: Record<string, any>;
  patient_notes?: string;
  submitted_at: string;
}

export interface ExerciseFeedback {
  id: string;
  assigned_exercise_id: string;
  psychologist_id: string;
  feedback_text: string;
  clinical_observations?: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  patient_id: string;
  title?: string;
  content: string;
  predominant_emotion: string;
  intensity: number; // 0 a 10
  is_shared_with_psychologist: boolean;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface MoodLog {
  id: string;
  patient_id: string;
  mood_score: MoodScore;
  emotions: string[];
  intensity: number; // 0 a 10
  notes?: string;
  logged_at: string;
}

export interface ContentItem {
  id: string;
  psychologist_id?: string;
  title: string;
  description: string;
  content_type: ContentType;
  url_or_file_path: string;
  category: string;
  tags: string[];
  estimated_read_time_minutes?: number;
  is_public: boolean;
  created_at: string;
}

export interface PatientContent {
  id: string;
  content_id: string;
  patient_id: string;
  psychologist_id: string;
  content?: ContentItem;
  personalized_note?: string;
  status: 'unread' | 'viewed' | 'completed';
  assigned_at: string;
  opened_at?: string;
  completed_at?: string;
}
