import assert from 'node:assert';
import { processPaymentWebhook, WebhookDb, WebhookAppointment } from './webhook-handler';

const APPT = '11111111-1111-4111-8111-111111111111';

function makeDb(appt: WebhookAppointment | null) {
  const log: string[] = [];
  const state = appt ? { ...appt } : null;
  const db: WebhookDb = {
    async getAppointment() { return state; },
    async markPaid(id, status) {
      log.push(`paid:${id}:${status}`);
      if (state && state.payment_status === 'pending') { state.payment_status = status; return true; }
      return false;
    },
    async markRefunded(id) {
      log.push(`refund:${id}`);
      if (state && state.payment_status?.startsWith('paid')) { state.payment_status = 'pending'; return true; }
      return false;
    },
  };
  return { db, log, state };
}

const paid = (over: any = {}) => ({
  event: 'PAYMENT_RECEIVED',
  payment: { id: 'pay_1', value: 200, billingType: 'PIX', externalReference: APPT, ...over },
});

async function run() {
  console.log('🧪 Iniciando testes do webhook de pagamentos...');

  // pagamento válido
  let { db, log } = makeDb({ id: APPT, price: 200, payment_status: 'pending' });
  let r = await processPaymentWebhook(paid(), db);
  assert.strictEqual(r.httpStatus, 200);
  assert.strictEqual(r.body.status, 'processed');
  assert.deepStrictEqual(log, [`paid:${APPT}:paid_pix`]);
  console.log('✅ PASS: Pix confirmado marca o agendamento como pago');

  // idempotência: o gateway reenvia o mesmo evento
  r = await processPaymentWebhook(paid(), db);
  assert.strictEqual(r.body.status, 'already_processed');
  assert.strictEqual(log.length, 1, 'não grava de novo');
  console.log('✅ PASS: evento repetido é idempotente');

  // cartão
  ({ db, log } = makeDb({ id: APPT, price: 200, payment_status: 'pending' }));
  r = await processPaymentWebhook(paid({ billingType: 'CREDIT_CARD' }), db);
  assert.deepStrictEqual(log, [`paid:${APPT}:paid_card`]);
  console.log('✅ PASS: cartão vira paid_card');

  // valor menor que o combinado NÃO quita
  ({ db, log } = makeDb({ id: APPT, price: 200, payment_status: 'pending' }));
  r = await processPaymentWebhook(paid({ value: 1 }), db);
  assert.strictEqual(r.body.status, 'amount_mismatch');
  assert.strictEqual(log.length, 0);
  console.log('✅ PASS: pagamento de valor menor não quita a sessão');

  // valor maior (juros/multa) quita
  ({ db, log } = makeDb({ id: APPT, price: 200, payment_status: 'pending' }));
  r = await processPaymentWebhook(paid({ value: 205.4 }), db);
  assert.strictEqual(r.body.status, 'processed');
  console.log('✅ PASS: valor igual ou maior quita');

  // referência que não é nossa / inexistente: 200 (sem retry do gateway) e nada gravado
  ({ db, log } = makeDb(null));
  r = await processPaymentWebhook(paid({ externalReference: 'nao-e-uuid' }), db);
  assert.strictEqual(r.body.status, 'ignored_no_reference');
  r = await processPaymentWebhook(paid(), db);
  assert.strictEqual(r.body.status, 'ignored_unknown_reference');
  assert.strictEqual(log.length, 0);
  console.log('✅ PASS: referência inválida ou desconhecida é ignorada');

  // estorno só de quem estava pago
  ({ db, log } = makeDb({ id: APPT, price: 200, payment_status: 'paid_pix' }));
  r = await processPaymentWebhook({ event: 'PAYMENT_REFUNDED', payment: { externalReference: APPT } }, db);
  assert.strictEqual(r.body.status, 'refund_recorded');
  r = await processPaymentWebhook({ event: 'PAYMENT_REFUNDED', payment: { externalReference: APPT } }, db);
  assert.strictEqual(r.body.status, 'already_processed');
  console.log('✅ PASS: estorno reverte pagamento uma única vez');

  // assinatura: não afirma ter ativado nada
  r = await processPaymentWebhook({ event: 'SUBSCRIPTION_CREATED', subscription: { externalReference: 'org' } }, db);
  assert.strictEqual(r.body.status, 'ignored_not_implemented');
  console.log('✅ PASS: assinatura SaaS não é dada como ativa sem implementação');

  // evento ausente e evento desconhecido
  assert.strictEqual((await processPaymentWebhook({}, db)).httpStatus, 400);
  assert.strictEqual((await processPaymentWebhook({ event: 'X' }, db)).body.status, 'ignored_unhandled_event');
  console.log('✅ PASS: evento ausente → 400; desconhecido → ignorado');

  // falha do banco → 500 (gateway tenta de novo) sem vazar detalhes
  const broken: WebhookDb = {
    async getAppointment() { throw new Error('conexão com host interno db.xyz recusada'); },
    async markPaid() { return false; }, async markRefunded() { return false; },
  };
  r = await processPaymentWebhook(paid(), broken);
  assert.strictEqual(r.httpStatus, 500);
  assert.ok(!JSON.stringify(r.body).includes('db.xyz'));
  console.log('✅ PASS: erro de banco → 500 sem vazar detalhes');

  console.log('🎉 Todos os testes do webhook de pagamentos passaram!');
}

run().catch(e => { console.error('❌ FALHA:', e); process.exit(1); });
