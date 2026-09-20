import assert from 'node:assert';
import { supabase } from './client';
import { createBookingRequest, describeBookingError, getPublicBookingInfo, getPublicBusySlots, parseBookingError } from './public-booking';

const calls: { fn: string; args: any }[] = [];
let response: { data?: any; error?: { message: string } | null } = { data: null, error: null };

(supabase as any).rpc = async (fn: string, args: any) => {
  calls.push({ fn, args });
  return response;
};

async function run() {
  // mapeamento de erros do banco
  assert.strictEqual(parseBookingError({ message: 'slot_taken' }), 'slot_taken');
  assert.strictEqual(parseBookingError({ message: 'P0001: too_many_requests' }), 'too_many_requests');
  assert.strictEqual(parseBookingError({ message: 'algo inesperado' }), 'unknown');
  assert.strictEqual(parseBookingError(null), 'unknown');
  assert.match(describeBookingError('slot_taken'), /reservado por outra pessoa/);
  console.log('✅ PASS: erros do banco viram mensagens para o paciente');

  // informações da página
  response = { data: { psychologist_name: 'Ana', crp: '06/1234', slot_minutes: 50 }, error: null };
  const info = await getPublicBookingInfo('ana');
  assert.ok(info && info !== 'error' && info.psychologist_name === 'Ana');
  assert.deepStrictEqual(calls[calls.length - 1], { fn: 'get_public_booking_info', args: { p_slug: 'ana' } });
  response = { data: null, error: null };
  assert.strictEqual(await getPublicBookingInfo('nao-existe'), null);
  response = { data: null, error: { message: 'boom' } };
  assert.strictEqual(await getPublicBookingInfo('ana'), 'error');
  console.log('✅ PASS: link inexistente e falha de rede são distinguidos');

  // horários ocupados
  response = { data: [{ busy_start: '2026-09-21T12:00:00Z', busy_end: '2026-09-21T12:50:00Z' }], error: null };
  assert.deepStrictEqual(await getPublicBusySlots('ana', 'a', 'b'), [{ start: '2026-09-21T12:00:00Z', end: '2026-09-21T12:50:00Z' }]);
  response = { data: null, error: { message: 'boom' } };
  assert.strictEqual(await getPublicBusySlots('ana', 'a', 'b'), null);
  console.log('✅ PASS: horários ocupados mapeados; falha devolve null');

  // criação da solicitação
  const input = { slug: 'ana', name: 'Bia', email: 'b@x.com', phone: '(11) 98765-4321', startsAt: '2026-09-21T12:00:00Z', modality: 'online' as const, message: 'oi' };
  response = { data: 'uuid', error: null };
  assert.deepStrictEqual(await createBookingRequest(input), { ok: true });
  assert.deepStrictEqual(calls[calls.length - 1].args, {
    p_slug: 'ana', p_name: 'Bia', p_email: 'b@x.com', p_phone: '(11) 98765-4321', p_start: '2026-09-21T12:00:00Z', p_modality: 'online', p_message: 'oi',
  });
  response = { data: null, error: { message: 'slot_taken' } };
  assert.deepStrictEqual(await createBookingRequest(input), { ok: false, code: 'slot_taken' });
  (supabase as any).rpc = async () => { throw new Error('offline'); };
  assert.deepStrictEqual(await createBookingRequest(input), { ok: false, code: 'network' });
  console.log('✅ PASS: solicitação envia os parâmetros certos e trata erros');

  console.log('🎉 Todos os testes do agendamento público passaram!');
}

run().catch(err => {
  console.error('❌ FALHA:', err);
  process.exit(1);
});
