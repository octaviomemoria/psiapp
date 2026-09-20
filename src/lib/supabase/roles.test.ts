import assert from 'node:assert';
import { supabase } from './client';
import { SupabaseService } from './service';

const inserts: Array<{ table: string; payload: any }> = [];

// Cliente simulado: nenhum perfil/psicólogo existe ainda; INSERT devolve o próprio payload
(supabase as any).from = (table: string) => {
  let lastInsert: any = null;
  const chain: any = new Proxy({}, {
    get(_t, prop: string) {
      if (prop === 'insert') return (payload: any) => { lastInsert = Array.isArray(payload) ? payload[0] : payload; inserts.push({ table, payload: lastInsert }); return chain; };
      if (prop === 'maybeSingle') return async () => ({ data: null, error: null });
      if (prop === 'single') return async () => ({ data: { id: `${table}-id`, ...lastInsert }, error: null });
      return () => chain;
    },
  });
  return chain;
};

async function run() {
  console.log('🧪 Iniciando testes de papéis no cadastro (anti-escalonamento)...');

  const cases: Array<[string, string | undefined, string]> = [
    ['superadmin', 'superadmin', 'psychologist'],
    ['manager', 'manager', 'psychologist'],
    ['admin', 'admin', 'psychologist'],
    ['papel inventado', 'root', 'psychologist'],
    ['sem papel', undefined, 'psychologist'],
    ['patient', 'patient', 'patient'],
    ['psychologist', 'psychologist', 'psychologist'],
  ];

  for (const [label, requested, expected] of cases) {
    inserts.length = 0;
    await SupabaseService.ensureProfileAndPsychologist({ id: 'user-1', email: 'a@x.com', user_metadata: { role: requested, full_name: 'A' } });
    const profileInsert = inserts.find(i => i.table === 'profiles');
    assert.ok(profileInsert, `${label}: deveria criar o perfil`);
    assert.strictEqual(profileInsert!.payload.role, expected, `${label}: papel gravado`);
  }
  console.log('✅ PASS: papel vindo de user_metadata nunca vira administrativo');

  // o mesmo vale para o argumento `metadata` (usado logo após o signUp)
  inserts.length = 0;
  await SupabaseService.ensureProfileAndPsychologist({ id: 'user-2', email: 'b@x.com', user_metadata: {} }, { role: 'superadmin', full_name: 'B' });
  assert.strictEqual(inserts.find(i => i.table === 'profiles')!.payload.role, 'psychologist');
  console.log('✅ PASS: argumento metadata também é ignorado para papéis administrativos');

  console.log('🎉 Todos os testes de papéis no cadastro passaram!');
}

run().catch(e => { console.error('❌ FALHA:', e); process.exit(1); });
