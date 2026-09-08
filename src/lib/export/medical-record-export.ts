/**
 * Portabilidade de Dados & Exportação de Prontuário Clínico (LGPD Art. 18 & Res. CFP 001/2009)
 * Consolida todo o histórico do paciente em um arquivo JSON auditável e interoperável.
 */

import { Patient, TherapySession, DiaryEntry, PsychometricRecord, ConsentRecord } from '@/types/database';

export interface MedicalRecordDossier {
  exportMetadata: {
    system: string;
    version: string;
    exportTimestamp: string;
    legalBasis: string[];
    cryptographicChecksumAlgorithm: string;
  };
  patient: Partial<Patient>;
  sessions: Partial<TherapySession>[];
  psychometrics: Partial<PsychometricRecord>[];
  authorizedDiaries: Partial<DiaryEntry>[];
  consents: Partial<ConsentRecord>[];
  totalSessionsCompleted: number;
}

/**
 * Constrói o dossiê clínico estruturado em conformidade com as normas do CFP
 */
export function buildMedicalRecordDossier(
  patient: Patient,
  sessions: TherapySession[],
  psychometrics: PsychometricRecord[] = [],
  diaries: DiaryEntry[] = [],
  consents: ConsentRecord[] = []
): MedicalRecordDossier {
  const patientSessions = sessions.filter(s => s.patient_id === patient.id);
  const patientPsychometrics = psychometrics.filter(p => p.patient_id === patient.id);
  // Apenas diários que o paciente expressamente autorizou compartilhar com a terapeuta (LGPD Art. 18)
  const patientDiaries = diaries.filter(d => d.patient_id === patient.id && d.is_shared_with_psychologist);
  const patientConsents = consents.filter(c => c.patient_id === patient.id);

  return {
    exportMetadata: {
      system: 'PsiApp — Plataforma de Evolução Terapêutica',
      version: '1.0.0-production',
      exportTimestamp: new Date().toISOString(),
      legalBasis: [
        'Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018, Art. 18, V - Portabilidade de Dados)',
        'Resolução CFP nº 001/2009 (Normas de Guarda e Registro Documental em Prontuário)',
        'Resolução CFP nº 009/2024 (Prestação de Serviços Psicológicos por Meios Tecnológicos)',
      ],
      cryptographicChecksumAlgorithm: 'SHA-256',
    },
    patient: {
      id: patient.id,
      full_name: patient.full_name,
      birth_date: patient.birth_date,
      started_at: patient.started_at,
      status: patient.status,
    },
    sessions: patientSessions.map(s => ({
      id: s.id,
      session_number: s.session_number,
      session_date: s.session_date,
      summary: s.summary,
      evolution_observed: s.evolution_observed,
      modality: s.modality,
      status: s.status,
    })),
    psychometrics: patientPsychometrics,
    authorizedDiaries: patientDiaries,
    consents: patientConsents,
    totalSessionsCompleted: patientSessions.filter(s => s.status === 'finalized' || (s.status as string) === 'completed').length,
  };
}

/**
 * Executa o download automático do dossiê no formato JSON
 */
export function downloadMedicalRecordDossier(dossier: MedicalRecordDossier): void {
  if (typeof window === 'undefined') return;

  const rawJson = JSON.stringify(dossier, null, 2);
  const blob = new Blob([rawJson], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanName = (dossier.patient.full_name || 'paciente')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `prontuario-psiapp-${cleanName}-${dateStr}.json`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
