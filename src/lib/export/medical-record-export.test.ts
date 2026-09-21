import assert from 'node:assert';
import { buildMedicalRecordDossier } from './medical-record-export';
import { Patient, TherapySession, DiaryEntry } from '@/types/database';

function runMedicalRecordExportTests() {
  console.log('🧪 Iniciando testes de portabilidade e dossiê de prontuário (LGPD Art. 18)...');

  const mockPatient: Patient = {
    id: 'pat_1',
    psychologist_id: 'psy_1',
    full_name: 'Mariana Costa',
    email: 'mariana@example.com',
    phone: '+5511999998888',
    birth_date: '1994-06-15',
    status: 'active',
    started_at: '2026-01-10',
  };

  const mockSessions: TherapySession[] = [
    {
      id: 'sess_1',
      patient_id: 'pat_1',
      psychologist_id: 'psy_1',
      session_number: 1,
      session_date: '2026-01-15T14:00:00Z',
      duration_minutes: 50,
      modality: 'online',
      main_topics: ['Apresentação', 'Queixa principal'],
      summary: 'Primeira sessão realizada.',
      status: 'finalized',
      evolution_observed: 'Primeira sessão de anamnese realizada com sucesso.',
      created_at: '2026-01-15T14:00:00Z',
    },
  ];

  const mockDiaries: DiaryEntry[] = [
    {
      id: 'd_1',
      patient_id: 'pat_1',
      title: 'Crise de ansiedade no trabalho',
      content: 'Sentimento de sufoco após reunião com a diretoria.',
      predominant_emotion: 'Ansiedade',
      intensity: 8,
      is_shared_with_psychologist: true, // Compartilhado
      entry_date: '2026-01-18',
      created_at: '2026-01-18T18:00:00Z',
      updated_at: '2026-01-18T18:00:00Z',
    },
    {
      id: 'd_2',
      patient_id: 'pat_1',
      title: 'Segredo estritamente pessoal',
      content: 'Texto que o paciente NÃO autorizou compartilhar.',
      predominant_emotion: 'Tristeza',
      intensity: 5,
      is_shared_with_psychologist: false, // NÃO compartilhado
      entry_date: '2026-01-19',
      created_at: '2026-01-19T20:00:00Z',
      updated_at: '2026-01-19T20:00:00Z',
    },
  ];

  const dossier = buildMedicalRecordDossier(mockPatient, mockSessions, [], mockDiaries, []);

  // Teste 1: Metadados LGPD presentes
  assert.strictEqual(dossier.exportMetadata.system.includes('PsiApp'), true);
  assert.strictEqual(dossier.exportMetadata.legalBasis.length >= 2, true);
  console.log('✅ PASS: Metadados jurídicos LGPD e CFP incorporados');

  // Teste 2: Isolamento de diários não autorizados
  assert.strictEqual(dossier.authorizedDiaries.length, 1, 'Deve exportar apenas diários com shared_with_psychologist === true');
  assert.strictEqual(dossier.authorizedDiaries[0].title, 'Crise de ansiedade no trabalho');
  console.log('✅ PASS: Respeito absoluto à privacidade do diário pessoal');

  // Teste 3: Sessões e contagem
  assert.strictEqual(dossier.sessions.length, 1);
  assert.strictEqual(dossier.totalSessionsCompleted, 1);
  console.log('✅ PASS: Consolidação de histórico de sessões');

  // Teste 4: anamnese legível, só do paciente, sem o token do link
  const secretToken = 't'.repeat(64);
  const anamnesis = (patientId: string, id: string) => ({
    id, psychologist_id: 'psy', patient_id: patientId, template_id: 'system:adulto', template_name: 'Anamnese adulto',
    template_snapshot: [{ id: 's', type: 'section' as const, label: 'Geral' }, { id: 'q1', type: 'boolean' as const, label: 'Já fez terapia?' }, { id: 'q2', type: 'textarea' as const, label: 'Queixa' }],
    answers: { q1: false, q2: 'Ansiedade' }, status: 'sent' as const, filled_by: 'patient' as const, fill_token: secretToken,
    token_expires_at: '2026-12-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z',
  });
  const withAnamnesis = buildMedicalRecordDossier(mockPatient, mockSessions, [], mockDiaries, [], [anamnesis(mockPatient.id, 'a1'), anamnesis('outro-paciente', 'a2')]);
  assert.strictEqual(withAnamnesis.anamneses.length, 1, 'anamnese de outro paciente não pode entrar no dossiê');
  assert.deepStrictEqual(withAnamnesis.anamneses[0].questions, [{ question: 'Já fez terapia?', answer: 'Não' }, { question: 'Queixa', answer: 'Ansiedade' }]);
  assert.ok(!JSON.stringify(withAnamnesis).includes(secretToken), 'o token do link de preenchimento nunca é exportado');
  assert.strictEqual(dossier.anamneses.length, 0);
  console.log('✅ PASS: Anamnese exportada em formato legível, sem token e sem dados de terceiros');

  console.log('🎉 Todos os testes de exportação de prontuário passaram com sucesso!');
}

runMedicalRecordExportTests();
