import assert from 'node:assert';
import { sanitizeLogData, logger } from './logger';

function runLoggerTests() {
  console.log('🧪 Iniciando testes de sanitização ética e LGPD do Logger...');

  // Teste 1: Redação de senhas e tokens
  const payloadWithSecrets = {
    user: 'dra.ana',
    password: 'secretPassword123',
    authToken: 'Bearer eyJhbGciOi...',
    action: 'LOGIN_ATTEMPT',
  };

  const sanitized1 = sanitizeLogData(payloadWithSecrets);
  assert.strictEqual(sanitized1.password, '[REDACTED_CLINICAL_LGPD]');
  assert.strictEqual(sanitized1.authToken, '[REDACTED_CLINICAL_LGPD]');
  assert.strictEqual(sanitized1.action, 'LOGIN_ATTEMPT');
  console.log('✅ PASS: Redação de credenciais e tokens');

  // Teste 2: Redação de dados de prontuário e hipótese clínica
  const payloadClinical = {
    patientId: 'pat_123',
    private_clinical_hypothesis: 'Risco de surto psicótico e transtorno bipolar',
    sessionNumber: 4,
  };

  const sanitized2 = sanitizeLogData(payloadClinical);
  assert.strictEqual(sanitized2.private_clinical_hypothesis, '[REDACTED_CLINICAL_LGPD]');
  assert.strictEqual(sanitized2.sessionNumber, 4);
  console.log('✅ PASS: Mascaramento estrito de hipótese clínica diagnóstica');

  // Teste 3: Mascaramento de CPF em strings
  const stringCPF = 'Erro ao processar paciente com CPF 123.456.789-00 no faturamento';
  const sanitized3 = sanitizeLogData(stringCPF);
  assert.strictEqual(sanitized3, 'Erro ao processar paciente com CPF ***.***.***-** no faturamento');
  console.log('✅ PASS: Anonimização de CPF em strings livres');

  // Teste 4: Emissão estruturada de log
  const logEntry = logger.info('Sessão iniciada', { patientId: 'p1', notes: 'relato confidencial' });
  assert.strictEqual(logEntry.level, 'info');
  assert.strictEqual(logEntry.context?.notes, '[REDACTED_CLINICAL_LGPD]');
  console.log('✅ PASS: Emissão de log estruturado seguro');

  console.log('🎉 Todos os testes do Logger LGPD passaram com sucesso!');
}

runLoggerTests();
