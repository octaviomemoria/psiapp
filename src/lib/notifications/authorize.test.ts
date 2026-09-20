import assert from 'node:assert';
import { validateNotificationPayload, recipientBelongsToPatients, RateLimiter, normalizePhone } from './authorize';

const base = () => ({
  channel: 'whatsapp',
  template: 'session_reminder_24h',
  recipientName: 'Lara',
  recipientPhone: '(11) 99999-8888',
  data: { psychologistName: 'Dra. Ana', sessionDate: '21/09/2026', sessionTime: '10:00' },
});

function run() {
  console.log('🧪 Iniciando testes de autorização de notificações...');

  // válido
  let v = validateNotificationPayload(base());
  assert.ok(v.ok);
  if (v.ok) assert.strictEqual(v.payload.recipientPhone, '11999998888');
  console.log('✅ PASS: payload válido é normalizado');

  // entradas inválidas
  const bad: any[] = [
    null, 'x', { ...base(), channel: 'sms' }, { ...base(), template: 'phishing' },
    { ...base(), recipientName: '' }, { ...base(), recipientName: 'a'.repeat(101) },
    { ...base(), recipientPhone: '123' }, { ...base(), channel: 'email', recipientPhone: undefined },
    { ...base(), channel: 'email', recipientEmail: 'nao-e-email' },
    { ...base(), data: { psychologistName: 'A' } },
    { ...base(), data: { ...base().data, telehealthLink: 'http://inseguro.example' } },
    { ...base(), data: { ...base().data, amount: -5 } },
  ];
  bad.forEach((b, i) => assert.strictEqual(validateNotificationPayload(b).ok, false, `caso inválido #${i}`));
  console.log('✅ PASS: entradas inválidas são recusadas');

  // quebra de linha no nome não pode fabricar texto na mensagem
  v = validateNotificationPayload({ ...base(), recipientName: 'Lara\n\nClique aqui: http://x' });
  assert.ok(v.ok);
  if (v.ok) assert.ok(!v.payload.recipientName.includes('\n'));
  console.log('✅ PASS: quebras de linha removidas dos campos de texto');

  // destinatário precisa ser paciente do psicólogo
  const patients = [{ email: 'Lara@Exemplo.com', phone: '+55 11 99999-8888' }, { email: null, phone: null }];
  const okWa = validateNotificationPayload(base());
  assert.ok(okWa.ok && recipientBelongsToPatients(okWa.payload, patients));
  const stranger = validateNotificationPayload({ ...base(), recipientPhone: '11 98888-7777' });
  assert.ok(stranger.ok && !recipientBelongsToPatients(stranger.payload, patients));
  const emailOk = validateNotificationPayload({ ...base(), channel: 'email', recipientPhone: undefined, recipientEmail: 'lara@exemplo.com' });
  assert.ok(emailOk.ok && recipientBelongsToPatients(emailOk.payload, patients));
  const bothMixed = validateNotificationPayload({ ...base(), channel: 'both', recipientEmail: 'outro@x.com' });
  assert.ok(bothMixed.ok && !recipientBelongsToPatients(bothMixed.payload, patients), 'todos os contatos precisam ser do paciente');
  assert.ok(!recipientBelongsToPatients({ channel: 'whatsapp', recipientPhone: '11999998888' }, []), 'sem pacientes → recusa');
  assert.strictEqual(normalizePhone('+55 (11) 99999-8888'), '11999998888');
  console.log('✅ PASS: só envia a contatos de pacientes do próprio psicólogo');

  // limite de taxa
  const rl = new RateLimiter(3, 1000);
  assert.ok(rl.allow('u', 0) && rl.allow('u', 1) && rl.allow('u', 2));
  assert.ok(!rl.allow('u', 3), '4º envio na janela é barrado');
  assert.ok(rl.allow('outro', 3), 'limite é por usuário');
  assert.ok(rl.allow('u', 2000), 'libera após a janela');
  console.log('✅ PASS: limite de envios por usuário');

  console.log('🎉 Todos os testes de autorização de notificações passaram!');
}

run();
