import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { POST as notifyPost } from './notifications/send/route';
import { POST as webhookPost } from './billing/webhook/route';

const APPT = '11111111-1111-4111-8111-111111111111';
const body = JSON.stringify({ event: 'PAYMENT_RECEIVED', payment: { value: 1, externalReference: APPT } });
const hook = (headers: Record<string, string> = {}) =>
  webhookPost(new NextRequest('http://localhost/api/billing/webhook', { method: 'POST', headers, body }));

async function run() {
  console.log('🧪 Iniciando testes de autenticação das rotas de API...');

  // --- notifications/send: sem token nem chega a validar o corpo ---
  let res: Response = await notifyPost(new NextRequest('http://localhost/api/notifications/send', { method: 'POST', body: '{}' }));
  assert.strictEqual(res.status, 401);
  res = await notifyPost(new NextRequest('http://localhost/api/notifications/send', {
    method: 'POST', headers: { authorization: 'Basic abc' }, body: '{}',
  }));
  assert.strictEqual(res.status, 401);
  console.log('✅ PASS: /api/notifications/send exige Bearer token');

  // --- webhook: falha fechada quando o segredo não está configurado ---
  delete process.env.ASAAS_WEBHOOK_TOKEN;
  delete process.env.PAYMENT_WEBHOOK_SECRET;
  res = await hook();
  assert.strictEqual(res.status, 503, 'sem segredo configurado NÃO pode aceitar chamadas');
  res = await hook({ 'asaas-access-token': 'qualquer' });
  assert.strictEqual(res.status, 503);
  console.log('✅ PASS: webhook sem segredo configurado → 503 (antes aceitava qualquer chamada)');

  // --- webhook: segredo errado / ausente ---
  process.env.ASAAS_WEBHOOK_TOKEN = 'segredo-correto-123';
  res = await hook();
  assert.strictEqual(res.status, 401);
  res = await hook({ 'asaas-access-token': 'segredo-errado' });
  assert.strictEqual(res.status, 401);
  console.log('✅ PASS: webhook com segredo ausente/errado → 401');

  // --- webhook: segredo certo, mas servidor sem service_role → 503 explícito (não finge processar) ---
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  res = await hook({ 'asaas-access-token': 'segredo-correto-123' });
  assert.strictEqual(res.status, 503);
  console.log('✅ PASS: segredo certo sem service_role → 503');

  console.log('🎉 Todos os testes de autenticação das rotas passaram!');
}

run().catch(e => { console.error('❌ FALHA:', e); process.exit(1); });
