import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { GET } from './route';
import { escapeIcsText, generateFullIcalFeed } from '@/lib/calendar/calendar-utils';

const VALID_TOKEN = 'a'.repeat(64);
let rpcCalls: Array<{ fn: string; args: any }> = [];
let rpcResult: { data: any; error: any } = { data: [], error: null };

(supabase as any).rpc = async (fn: string, args: any) => {
  rpcCalls.push({ fn, args });
  return rpcResult;
};

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/calendar/feed${qs}`));

async function run() {
  console.log('🧪 Iniciando testes do feed iCal protegido...');

  // Sem token: não consulta o banco e não devolve agenda alguma (antes devolvia a de todos)
  rpcCalls = [];
  let res = await call('');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(rpcCalls.length, 0);
  console.log('✅ PASS: sem token → 404, sem consulta ao banco');

  // O parâmetro antigo psychologistId não dá mais acesso a nada
  res = await call('?psychologistId=11111111-1111-1111-1111-111111111111');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(rpcCalls.length, 0);
  console.log('✅ PASS: psychologistId legado não funciona mais');

  // Token malformado é barrado antes do banco
  res = await call('?token=curto');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(rpcCalls.length, 0);
  console.log('✅ PASS: token malformado → 404');

  // Token válido: consulta a função do banco só com o token e devolve o .ics sem cache
  rpcResult = {
    data: [{
      id: 'appt-1', starts_at: '2026-09-21T13:00:00Z', ends_at: '2026-09-21T13:50:00Z',
      modality: 'online', location_or_link: 'https://meet.example/abc', status: 'scheduled',
      patient_name: 'Lara', psychologist_name: 'Dra. Ana',
    }],
    error: null,
  };
  res = await call(`?token=${VALID_TOKEN}`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(rpcCalls[0], { fn: 'get_calendar_feed', args: { p_token: VALID_TOKEN } });
  assert.match(res.headers.get('content-type') || '', /text\/calendar/);
  assert.match(res.headers.get('cache-control') || '', /no-store/);
  assert.strictEqual(res.headers.get('referrer-policy'), 'no-referrer');
  const body = await res.text();
  assert.ok(body.includes('SUMMARY:Sessão: Lara'));
  assert.ok(body.includes('Dra. Ana'));
  console.log('✅ PASS: token válido → agenda do dono, sem cache');

  // Erro do banco vira 500 genérico, sem vazar detalhes
  rpcResult = { data: null, error: { message: 'detalhe interno sensível' } };
  res = await call(`?token=${VALID_TOKEN}`);
  assert.strictEqual(res.status, 500);
  assert.ok(!(await res.text()).includes('sensível'));
  console.log('✅ PASS: erro interno não vaza detalhes');

  // Escape RFC 5545: quebra de linha no nome não pode injetar propriedades no evento
  assert.strictEqual(escapeIcsText('a,b;c\\d\nE'), 'a\\,b\\;c\\\\d\\nE');
  const ics = generateFullIcalFeed([{
    id: 'x', psychologist_id: '', patient_id: '', patient_name: 'Eva\r\nATTENDEE:mailto:evil@x.com',
    starts_at: '2026-09-21T13:00:00Z', ends_at: '2026-09-21T13:50:00Z', modality: 'online', status: 'scheduled',
  } as any]);
  assert.ok(!/^ATTENDEE:/m.test(ics), 'quebra de linha no nome não pode criar uma nova propriedade');
  console.log('✅ PASS: campos de texto do .ics são escapados');

  console.log('🎉 Todos os testes do feed iCal passaram!');
}

run().catch(err => {
  console.error('❌ FALHA:', err);
  process.exit(1);
});
