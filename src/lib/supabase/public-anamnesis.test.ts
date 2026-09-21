import assert from 'node:assert';
import { supabase } from './client';
import { getAnamnesisByToken, submitAnamnesisByToken } from './public-anamnesis';

const calls: { fn: string; args: any }[] = [];
let response: { data?: any; error?: { message: string } | null } = { data: null, error: null };

(supabase as any).rpc = async (fn: string, args: any) => {
  calls.push({ fn, args });
  return response;
};

async function run() {
  const token = 'a'.repeat(64);

  response = { data: { patient_first_name: 'Lara', psychologist_name: 'Ana', template_name: 'Adulto', template_snapshot: [] }, error: null };
  const form = await getAnamnesisByToken(token);
  assert.ok(form && form !== 'error' && form.patient_first_name === 'Lara');
  assert.deepStrictEqual(calls[calls.length - 1], { fn: 'get_anamnesis_by_token', args: { p_token: token } });

  response = { data: null, error: null };
  assert.strictEqual(await getAnamnesisByToken(token), null);
  response = { data: null, error: { message: 'boom' } };
  assert.strictEqual(await getAnamnesisByToken(token), 'error');
  console.log('✅ PASS: link inválido e falha de rede são distinguidos');

  response = { data: true, error: null };
  assert.strictEqual(await submitAnamnesisByToken(token, { a: 'x' }), 'ok');
  assert.deepStrictEqual(calls[calls.length - 1], { fn: 'submit_anamnesis_by_token', args: { p_token: token, p_answers: { a: 'x' } } });
  response = { data: false, error: null };
  assert.strictEqual(await submitAnamnesisByToken(token, {}), 'invalid_link');
  response = { data: null, error: { message: 'boom' } };
  assert.strictEqual(await submitAnamnesisByToken(token, {}), 'network');
  (supabase as any).rpc = async () => { throw new Error('offline'); };
  assert.strictEqual(await submitAnamnesisByToken(token, {}), 'network');
  assert.strictEqual(await getAnamnesisByToken(token), 'error');
  console.log('✅ PASS: envio distingue sucesso, link usado/vencido e falha de rede');

  console.log('🎉 Todos os testes da anamnese pública passaram!');
}

run().catch(err => {
  console.error('❌ FALHA:', err);
  process.exit(1);
});
