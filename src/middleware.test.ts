import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { supabaseUrl } from './lib/supabase/config';

const ref = new URL(supabaseUrl).hostname.split('.')[0];
const COOKIE = `sb-${ref}-auth-token`;

// Sessão válida (não expirada) no formato que o @supabase/ssr grava no cookie
const sessionCookie = JSON.stringify({
  access_token: 'aaa.bbb.ccc',
  refresh_token: 'refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'user-1', aud: 'authenticated' },
});

let authUserResponse: { status: number; body: any } = { status: 200, body: { id: 'user-1', aud: 'authenticated' } };
let profileRole: string | null = 'psychologist';
const fetchLog: string[] = [];

// Simula o Supabase (Auth + PostgREST): nenhuma chamada de rede real
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any) => {
  const url = typeof input === 'string' ? input : input.url;
  fetchLog.push(url);
  const json = (status: number, body: any) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  if (url.includes('/auth/v1/user')) return json(authUserResponse.status, authUserResponse.body);
  if (url.includes('/rest/v1/profiles')) return json(200, profileRole ? [{ role: profileRole }] : []);
  return json(404, {});
}) as typeof fetch;

const req = (path: string, withCookie = false) =>
  new NextRequest(`http://localhost${path}`, withCookie ? { headers: { cookie: `${COOKIE}=${encodeURIComponent(sessionCookie)}` } } : undefined);
const location = (res: Response) => res.headers.get('location') ? new URL(res.headers.get('location')!).pathname + new URL(res.headers.get('location')!).search : null;

async function run() {
  console.log('🧪 Iniciando testes do middleware de rotas...');

  // rota pública: passa, com headers de segurança e SEM consultar o Supabase
  fetchLog.length = 0;
  let res = await middleware(req('/termos'));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
  assert.strictEqual(fetchLog.length, 0);
  console.log('✅ PASS: rota pública passa com headers de segurança e sem consulta ao Supabase');

  // área protegida sem cookie: nega sem tocar na rede
  fetchLog.length = 0;
  res = await middleware(req('/psicologo/dashboard'));
  assert.strictEqual(res.status, 307);
  assert.strictEqual(location(res), '/?auth=required');
  assert.strictEqual(fetchLog.length, 0);
  assert.strictEqual(res.headers.get('x-frame-options'), 'DENY', 'redirecionamento também leva os headers');
  console.log('✅ PASS: sem cookie de sessão → login, sem chamar o Supabase');

  // cookie presente, mas o Supabase rejeita o token (expirado/forjado)
  authUserResponse = { status: 401, body: { message: 'invalid JWT' } };
  res = await middleware(req('/psicologo/dashboard', true));
  assert.strictEqual(res.status, 307);
  assert.strictEqual(location(res), '/?auth=required');
  console.log('✅ PASS: token rejeitado pelo Supabase → login (cookie forjado não basta)');

  // sessão válida + papel correto
  authUserResponse = { status: 200, body: { id: 'user-1', aud: 'authenticated', email: 'a@x.com' } };
  profileRole = 'psychologist';
  res = await middleware(req('/psicologo/pacientes', true));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('location'), null);
  assert.match(res.headers.get('cache-control') || '', /no-store/);
  console.log('✅ PASS: sessão válida com papel correto → entra');

  // sessão válida, papel errado
  res = await middleware(req('/superadmin/auditoria', true));
  assert.strictEqual(res.status, 307);
  assert.strictEqual(location(res), '/psicologo/dashboard');
  profileRole = 'patient';
  res = await middleware(req('/psicologo/dashboard', true));
  assert.strictEqual(location(res), '/paciente/inicio');
  console.log('✅ PASS: papel errado → redireciona para a própria área');

  // perfil inexistente (ou consulta bloqueada): nega
  profileRole = null;
  res = await middleware(req('/psicologo/dashboard', true));
  assert.strictEqual(location(res), '/?auth=required');
  console.log('✅ PASS: sem perfil/papel confirmado → nega');

  // superadmin só com o papel no banco
  profileRole = 'superadmin';
  res = await middleware(req('/superadmin/auditoria', true));
  assert.strictEqual(res.status, 200);
  console.log('✅ PASS: /superadmin abre somente para profiles.role = superadmin');

  // falha inesperada ao verificar → nega por precaução
  globalThis.fetch = (async () => { throw new Error('rede caiu'); }) as typeof fetch;
  res = await middleware(req('/psicologo/dashboard', true));
  assert.strictEqual(location(res), '/?auth=required');
  console.log('✅ PASS: falha de rede na verificação → nega por precaução');

  globalThis.fetch = realFetch;
  console.log('🎉 Todos os testes do middleware passaram!');
}

run().catch(e => { console.error('❌ FALHA:', e); process.exit(1); });
