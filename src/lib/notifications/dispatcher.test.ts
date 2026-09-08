import assert from 'node:assert';
import { renderNotificationMessage, dispatchNotification, NotificationPayload } from './dispatcher';

async function runDispatcherTests() {
  console.log('🧪 Iniciando testes do despachante multicanal de notificações...');

  // Teste 1: Renderização do template 24h
  const payload24h: NotificationPayload = {
    channel: 'whatsapp',
    recipientName: 'Mariana Costa',
    recipientPhone: '11999998888',
    template: 'session_reminder_24h',
    data: {
      psychologistName: 'Dra. Beatriz Santos',
      sessionDate: '08/09/2026',
      sessionTime: '15:00',
      clinicName: 'Espaço Integrar',
    },
  };

  const text24h = renderNotificationMessage(payload24h);
  assert.strictEqual(text24h.includes('Mariana Costa'), true, 'Mensagem deve incluir o nome do paciente');
  assert.strictEqual(text24h.includes('Dra. Beatriz Santos'), true, 'Mensagem deve incluir o nome da psicóloga');
  assert.strictEqual(text24h.includes('15:00'), true, 'Mensagem deve incluir o horário da sessão');
  console.log('✅ PASS: Renderização precisa do template de 24h');

  // Teste 2: Renderização do template 2h com link de telepsicologia
  const payload2h: NotificationPayload = {
    channel: 'both',
    recipientName: 'Mariana Costa',
    recipientPhone: '11999998888',
    recipientEmail: 'mariana@exemplo.com.br',
    template: 'session_reminder_2h',
    data: {
      psychologistName: 'Dra. Beatriz Santos',
      sessionDate: '08/09/2026',
      sessionTime: '15:00',
      telehealthLink: 'https://psiapp.com.br/tele/sala-123',
    },
  };

  const text2h = renderNotificationMessage(payload2h);
  assert.strictEqual(text2h.includes('https://psiapp.com.br/tele/sala-123'), true, 'Mensagem 2h deve conter o link da sala');
  assert.strictEqual(text2h.includes('fones de ouvido'), true, 'Mensagem 2h deve conter recomendação de privacidade');
  console.log('✅ PASS: Template 2h com sala segura e orientações de sigilo');

  // Teste 3: Disparo em modo sandbox/fallback gracioso
  const result = await dispatchNotification(payload2h);
  assert.strictEqual(result.success, true, 'O despacho deve ser bem-sucedido mesmo em modo sandbox');
  assert.strictEqual(result.renderedText.length > 0, true, 'O resultado deve conter o texto formatado');
  console.log('✅ PASS: Despacho seguro com fallback transparente');

  console.log('🎉 Todos os testes do despachante de notificações passaram!');
}

runDispatcherTests().catch(err => {
  console.error('❌ Falha nos testes do despachante:', err);
  process.exit(1);
});
