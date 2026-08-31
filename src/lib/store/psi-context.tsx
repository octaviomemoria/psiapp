'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  PatientInvite
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
  INITIAL_INVITES
} from './initial-data';

interface PsiContextType {
  // Estado de Perfil e Autenticação
  currentRole: UserRole;
  currentPsychologist: Psychologist;
  currentPatient: Patient;
  switchRole: (role: UserRole, patientId?: string) => void;
  selectPatientForView: (patientId: string) => void;

  // Coleções de Dados
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
}

const PsiContext = createContext<PsiContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'psiapp_state_v3';

export const PsiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('psychologist');
  const [currentPsychologist] = useState<Psychologist>(INITIAL_PSYCHOLOGIST);
  const [currentPatientId, setCurrentPatientId] = useState<string>(INITIAL_PATIENTS[0].id);

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

  // Carregar do LocalStorage na montagem
  useEffect(() => {
    try {
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
        if (parsed.currentRole) setCurrentRole(parsed.currentRole);
        if (parsed.currentPatientId) setCurrentPatientId(parsed.currentPatientId);
      }
    } catch (e) {
      console.warn('Erro ao restaurar dados do localStorage:', e);
    }
  }, []);

  // Salvar no LocalStorage a cada alteração
  useEffect(() => {
    try {
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
    currentRole,
    currentPatientId,
  ]);

  const currentPatient = patients.find(p => p.id === currentPatientId) || patients[0];

  const switchRole = useCallback((role: UserRole, patientId?: string) => {
    setCurrentRole(role);
    if (patientId) {
      setCurrentPatientId(patientId);
    }
  }, []);

  const selectPatientForView = useCallback((patientId: string) => {
    setCurrentPatientId(patientId);
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
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  }, []);

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
  }, []);

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

    // Notificar paciente sobre novo agendamento
    addNotification({
      recipient_role: 'patient',
      recipient_patient_id: appointmentData.patient_id,
      title: 'Nova Consulta Agendada',
      message: `Uma consulta foi agendada para ${new Date(appointmentData.starts_at).toLocaleDateString('pt-BR')} às ${new Date(appointmentData.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
      type: 'appointment_reminder',
      read: false,
      target_tab: 'inicio',
    });
  }, [addNotification]);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus, cancellationReason?: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, cancellation_reason: cancellationReason } : a));
  }, []);

  const updateAppointmentPayment = useCallback((id: string, paymentStatus: PaymentStatus, price?: number, receiptNumber?: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        payment_status: paymentStatus,
        price: price !== undefined ? price : a.price,
        receipt_number: receiptNumber || a.receipt_number || (paymentStatus.startsWith('paid') ? `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` : undefined),
        paid_at: paymentStatus.startsWith('paid') ? new Date().toISOString() : undefined,
      };
    }));
  }, []);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);

    // Notificar paciente
    addNotification({
      recipient_role: 'patient',
      recipient_patient_id: goalData.patient_id,
      title: 'Novo Objetivo Terapêutico',
      message: `Dra. Ana Martins definiu uma nova meta: "${goalData.title}".`,
      type: 'content_assigned',
      read: false,
      target_tab: 'entre_sessoes',
    });
  }, [addNotification]);

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
    if (!template) return;
    const targetPatient = patients.find(p => p.id === patientId);

    const newAssignment: AssignedExercise = {
      id: `asg-${Date.now()}`,
      template_id: template.id,
      psychologist_id: currentPsychologist.id,
      patient_id: patientId,
      patient_name: targetPatient?.full_name,
      title: template.title,
      instructions: customInstructions || template.instructions,
      schema_fields: template.schema_fields,
      due_date: dueDate,
      status: 'pending',
      assigned_at: new Date().toISOString(),
    };
    setAssignedExercises(prev => [newAssignment, ...prev]);

    // Notificar paciente
    addNotification({
      recipient_role: 'patient',
      recipient_patient_id: patientId,
      title: 'Nova Atividade Terapêutica',
      message: `Dra. Ana Martins atribuiu o exercício "${template.title}" para você realizar entre as sessões.`,
      type: 'content_assigned',
      read: false,
      target_tab: 'entre_sessoes',
    });
  }, [exerciseTemplates, patients, currentPsychologist, addNotification]);

  const addExerciseFeedback = useCallback((assignmentId: string, feedbackText: string, clinicalObservations?: string) => {
    let patientId = '';
    let exerciseTitle = '';

    setAssignedExercises(prev => prev.map(a => {
      if (a.id !== assignmentId) return a;
      patientId = a.patient_id;
      exerciseTitle = a.title;
      return {
        ...a,
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
        feedback: {
          id: `fdb-${Date.now()}`,
          assigned_exercise_id: assignmentId,
          psychologist_id: currentPsychologist.id,
          feedback_text: feedbackText,
          clinical_observations: clinicalObservations,
          created_at: new Date().toISOString(),
        }
      };
    }));

    if (patientId) {
      addNotification({
        recipient_role: 'patient',
        recipient_patient_id: patientId,
        title: 'Feedback Terapêutico Recebido',
        message: `Dra. Ana Martins avaliou o exercício "${exerciseTitle}" e deixou um comentário acolhedor.`,
        type: 'feedback_received',
        read: false,
        target_tab: 'entre_sessoes',
      });
    }
  }, [currentPsychologist, addNotification]);

  const assignContentToPatient = useCallback((patientId: string, contentId: string, personalizedNote?: string) => {
    const content = contentItems.find(c => c.id === contentId);
    if (!content) return;
    const newAssignment: PatientContent = {
      id: `p-cnt-${Date.now()}`,
      content_id: contentId,
      patient_id: patientId,
      psychologist_id: currentPsychologist.id,
      content,
      personalized_note: personalizedNote,
      status: 'unread',
      assigned_at: new Date().toISOString(),
    };
    setPatientContents(prev => [newAssignment, ...prev]);

    addNotification({
      recipient_role: 'patient',
      recipient_patient_id: patientId,
      title: 'Novo Conteúdo Recomendado',
      message: `Dra. Ana Martins recomendou o material "${content.title}".`,
      type: 'content_assigned',
      read: false,
      target_tab: 'entre_sessoes',
    });
  }, [contentItems, currentPsychologist, addNotification]);

  // Novas Ferramentas Clínicas
  const addPsychometricResult = useCallback((resultData: Omit<PsychometricResult, 'id' | 'taken_at'>) => {
    const newResult: PsychometricResult = {
      ...resultData,
      id: `res-${Date.now()}`,
      taken_at: new Date().toISOString(),
    };
    setPsychometricResults(prev => [newResult, ...prev]);

    // Notificar psicóloga se gravidade alta ou risco
    if (newResult.risk_flag || newResult.severity_level === 'Grave' || newResult.severity_level === 'Extremamente Severa') {
      addNotification({
        recipient_role: 'psychologist',
        title: `⚠️ Alerta Clínico: ${newResult.scale_id.toUpperCase()} Elevado`,
        message: `Resultado de ${newResult.scale_name} indicou gravidade ${newResult.severity_level} (Score: ${newResult.total_score}).`,
        type: 'scale_completed',
        read: false,
        target_tab: 'pacientes',
      });
    }
  }, [addNotification]);

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
      id: `voice-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setVoiceAnchors(prev => [newAnchor, ...prev]);

    addNotification({
      recipient_role: 'patient',
      recipient_patient_id: anchorData.patient_id,
      title: 'Nova Âncora de Voz Gravada',
      message: `Dra. Ana gravou um áudio terapêutico para você ouvir entre as sessões: "${anchorData.title}".`,
      type: 'content_assigned',
      read: false,
      target_tab: 'entre_sessoes',
    });
  }, [addNotification]);

  const createPatientInvite = useCallback((name: string, email: string, phone: string): PatientInvite => {
    const token = `inv-${Math.random().toString(36).substr(2, 8)}-${Date.now().toString(36)}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const newInvite: PatientInvite = {
      id: `invite-${Date.now()}`,
      psychologist_id: currentPsychologist.id,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,
      token,
      status: 'pending',
      expires_at: expires.toISOString(),
      created_at: new Date().toISOString(),
    };

    setPatientInvites(prev => [newInvite, ...prev]);
    return newInvite;
  }, [currentPsychologist]);

  const acceptPatientInvite = useCallback((token: string, password?: string): boolean => {
    const invite = patientInvites.find(i => i.token === token && i.status === 'pending');
    if (!invite) return false;

    // Criar o paciente a partir do convite
    const newPatient = addPatient({
      full_name: invite.patient_name,
      email: invite.patient_email,
      phone: invite.patient_phone,
      birth_date: '1995-01-01',
      status: 'active',
      clinical_notes_overview: 'Paciente cadastrado via convite seguro online.',
      anamnesis_completed: false,
    });

    // Atualizar status do convite
    setPatientInvites(prev => prev.map(i => i.id === invite.id ? { ...i, status: 'accepted', patient_id: newPatient.id } : i));

    // Notificar psicóloga
    addNotification({
      recipient_role: 'psychologist',
      title: 'Novo Paciente Registrado!',
      message: `${invite.patient_name} aceitou o convite e ativou seu prontuário no PsiApp.`,
      type: 'invite_accepted',
      read: false,
      target_tab: 'pacientes',
    });

    // Mudar para a visão do paciente recém-criado
    switchRole('patient', newPatient.id);
    return true;
  }, [patientInvites, addPatient, addNotification, switchRole]);

  // Ações do Paciente
  const submitExerciseResponse = useCallback((assignedExerciseId: string, responses: Record<string, any>, notes?: string) => {
    let exerciseTitle = '';

    setAssignedExercises(prev => prev.map(a => {
      if (a.id !== assignedExerciseId) return a;
      exerciseTitle = a.title;
      return {
        ...a,
        status: 'completed',
        completed_at: new Date().toISOString(),
        answer: {
          id: `ans-${Date.now()}`,
          assigned_exercise_id: assignedExerciseId,
          patient_id: a.patient_id,
          responses,
          patient_notes: notes,
          submitted_at: new Date().toISOString(),
        }
      };
    }));

    // Notificar psicóloga
    addNotification({
      recipient_role: 'psychologist',
      title: 'Exercício Concluído',
      message: `${currentPatient.full_name} respondeu e enviou a atividade "${exerciseTitle}".`,
      type: 'exercise_completed',
      read: false,
      target_tab: 'pacientes',
    });
  }, [currentPatient, addNotification]);

  const addDiaryEntry = useCallback((entryData: Omit<DiaryEntry, 'id' | 'patient_id' | 'created_at' | 'updated_at'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: `diary-${Date.now()}`,
      patient_id: currentPatient.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDiaryEntries(prev => [newEntry, ...prev]);

    // Se compartilhado com o terapeuta, gera notificação
    if (entryData.is_shared_with_psychologist) {
      addNotification({
        recipient_role: 'psychologist',
        title: 'Novo Diário Compartilhado',
        message: `${currentPatient.full_name} compartilhou uma reflexão no diário (${entryData.predominant_emotion} - ${entryData.intensity}/10).`,
        type: 'diary_shared',
        read: false,
        target_tab: 'pacientes',
      });
    }
  }, [currentPatient, addNotification]);

  const updateDiaryEntry = useCallback((id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e));
  }, []);

  const deleteDiaryEntry = useCallback((id: string) => {
    setDiaryEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const addMoodLog = useCallback((moodData: Omit<MoodLog, 'id' | 'patient_id' | 'logged_at'>) => {
    const newMood: MoodLog = {
      ...moodData,
      id: `mood-${Date.now()}`,
      patient_id: currentPatient.id,
      logged_at: new Date().toISOString(),
    };
    setMoodLogs(prev => [newMood, ...prev]);

    // Notificar psicóloga se humor for Muito mal (1) para atenção clínica acolhedora
    if (moodData.mood_score === 1) {
      addNotification({
        recipient_role: 'psychologist',
        title: 'Alerta Clínico: Check-in de Humor Baixo',
        message: `${currentPatient.full_name} registrou humor "Muito mal" com intensidade ${moodData.intensity}/10 (${moodData.emotions.join(', ')}).`,
        type: 'mood_checkin',
        read: false,
        target_tab: 'pacientes',
      });
    }
  }, [currentPatient, addNotification]);

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

  // Regras de Segurança e Resolução
  const getVisibleDiaryEntriesForPsychologist = useCallback((patientId: string) => {
    return diaryEntries.filter(e => e.patient_id === patientId && e.is_shared_with_psychologist);
  }, [diaryEntries]);

  const getPatientDiaryEntries = useCallback(() => {
    return diaryEntries.filter(e => e.patient_id === currentPatient.id);
  }, [diaryEntries, currentPatient]);

  const getPatientAssignedExercises = useCallback(() => {
    return assignedExercises.filter(e => e.patient_id === currentPatient.id);
  }, [assignedExercises, currentPatient]);

  const getPatientGoals = useCallback(() => {
    return goals.filter(g => g.patient_id === currentPatient.id && g.visible_to_patient);
  }, [goals, currentPatient]);

  const getPatientMoodLogs = useCallback(() => {
    return moodLogs.filter(m => m.patient_id === currentPatient.id);
  }, [moodLogs, currentPatient]);

  const getPatientAppointments = useCallback(() => {
    return appointments.filter(a => a.patient_id === currentPatient.id);
  }, [appointments, currentPatient]);

  const getPatientContents = useCallback(() => {
    return patientContents.filter(pc => pc.patient_id === currentPatient.id);
  }, [patientContents, currentPatient]);

  const getPatientPsychometricResults = useCallback((patientId?: string) => {
    const targetId = patientId || currentPatient.id;
    return psychometricResults.filter(r => r.patient_id === targetId);
  }, [psychometricResults, currentPatient]);

  const getPatientCognitiveDiagrams = useCallback((patientId?: string) => {
    const targetId = patientId || currentPatient.id;
    return cognitiveDiagrams.filter(d => d.patient_id === targetId);
  }, [cognitiveDiagrams, currentPatient]);

  const getPatientVoiceAnchors = useCallback((patientId?: string) => {
    const targetId = patientId || currentPatient.id;
    return voiceAnchors.filter(v => v.patient_id === targetId);
  }, [voiceAnchors, currentPatient]);

  const resetToDemoData = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    setCurrentPatientId(INITIAL_PATIENTS[0].id);
    setCurrentRole('psychologist');
  }, []);

  return (
    <PsiContext.Provider
      value={{
        currentRole,
        currentPsychologist,
        currentPatient,
        switchRole,
        selectPatientForView,
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
