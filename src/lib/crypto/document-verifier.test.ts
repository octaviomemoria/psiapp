import assert from 'node:assert';
import { generateDocumentHash, formatShortHash } from './document-verifier';

async function runDocumentVerifierTests() {
  console.log('🧪 Iniciando testes de validação de documentos clínicos...');

  // Teste 1: Geração de Hash Determinístico
  const meta = {
    documentType: 'evolution_report' as const,
    patientName: 'Mariana Silva',
    psychologistName: 'Dra. Beatriz Santos',
    crpNumber: '06/123456',
    crpState: 'SP',
    issuedAt: '2026-09-07',
  };

  const hash1 = await generateDocumentHash(meta);
  const hash2 = await generateDocumentHash(meta);

  assert.strictEqual(hash1.length, 64, 'O hash SHA-256 deve ter 64 caracteres hexadecimais');
  assert.strictEqual(hash1, hash2, 'Hashes para os mesmos metadados devem ser determinísticos');
  console.log('✅ PASS: Geração de Hash Determinístico de 64 caracteres');

  // Teste 2: Alteração de metadados deve alterar o hash (Resistência a colisão)
  const metaAltered = { ...meta, patientName: 'Mariana Silva Souza' };
  const hashAltered = await generateDocumentHash(metaAltered);
  assert.notStrictEqual(hash1, hashAltered, 'Mudança de nome de paciente deve alterar o hash');
  console.log('✅ PASS: Sensibilidade à alteração de conteúdo');

  // Teste 3: Formatação Curta
  const shortCode = formatShortHash(hash1);
  assert.strictEqual(shortCode.split('-').length, 4, 'Código curto deve conter 4 grupos separados por traço');
  console.log('✅ PASS: Formatação amigável para impressão');

  console.log('🎉 Todos os testes de verificação de documentos passaram!');
}

runDocumentVerifierTests().catch(err => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});
