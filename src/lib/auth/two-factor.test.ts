import {
  generateTwoFactorSecret,
  generateOtpAuthUri,
  generateBackupCodes,
  generateDeterministicTotp,
  verifyTotpToken
} from './two-factor';

export function runTwoFactorTests(): { passed: boolean; log: string[] } {
  const log: string[] = [];
  let passed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      log.push(`✅ PASS: ${testName}`);
    } else {
      log.push(`❌ FAIL: ${testName}`);
      passed = false;
    }
  }

  // 1. Geração de Segredo Base32
  const secret = generateTwoFactorSecret();
  assert(secret.length === 16 && /^[A-Z2-7]+$/.test(secret), 'Segredo Base32 gerado com 16 caracteres válidos');

  // 2. Geração de URI otpauth://
  const uri = generateOtpAuthUri('psicologa@clinica.com.br', secret);
  assert(uri.startsWith('otpauth://totp/PsiApp:') && uri.includes(secret), 'URI otpauth:// formatada corretamente para apps autenticadores');

  // 3. Geração de Códigos de Recuperação
  const backupCodes = generateBackupCodes(8);
  assert(backupCodes.length === 8 && backupCodes[0].includes('-'), 'Geração de 8 códigos de backup descartáveis');

  // 4. Verificação de Token Válido
  const currentToken = generateDeterministicTotp(secret);
  assert(verifyTotpToken(currentToken, secret), 'Token TOTP atual de 6 dígitos validado com sucesso');

  // 5. Verificação com Janela de Tolerância (+30s)
  const futureToken = generateDeterministicTotp(secret, Date.now() + 30000);
  assert(verifyTotpToken(futureToken, secret), 'Token TOTP aceito dentro da janela de tolerância de tempo (+30s)');

  // 6. Rejeição de Token Inválido
  assert(!verifyTotpToken('000000', secret), 'Token inválido rejeitado com segurança');

  // 7. Rejeição de formato fora do padrão
  assert(!verifyTotpToken('abc', secret), 'Formato não numérico ou incompleto rejeitado');

  return { passed, log };
}

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const result = runTwoFactorTests();
  result.log.forEach(l => console.log(l));
  if (!result.passed) process.exit(1);
}
