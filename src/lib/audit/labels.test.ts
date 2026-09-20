import assert from 'node:assert';
import { supabase } from '../supabase/client';
import { SupabaseService } from '../supabase/service';
import { auditActionLabel, auditActionVariant, auditTableLabel, shortId } from './labels';

let captured: { table: string; calls: Array<[string, any[]]> } | null = null;
let response: { data: any; error: any } = { data: [], error: null };

// Cliente Supabase simulado: registra a cadeia de chamadas e devolve `response` ao ser aguardada
(supabase as any).from = (table: string) => {
  const calls: Array<[string, any[]]> = [];
  captured = { table, calls };
  const chain: any = new Proxy({}, {
    get(_t, prop: string) {
      if (prop === 'then') return (resolve: any) => resolve(response);
      return (...args: any[]) => { calls.push([prop, args]); return chain; };
    },
  });
  return chain;
};

async function run() {
  console.log('🧪 Iniciando testes da trilha de auditoria (superadmin)...');

  assert.strictEqual(auditTableLabel('therapy_sessions'), 'Sessão clínica');
  assert.strictEqual(auditTableLabel('tabela_nova'), 'tabela_nova');
  assert.strictEqual(auditActionLabel('DELETE'), 'Exclusão');
  assert.strictEqual(auditActionVariant('DELETE'), 'danger');
  assert.strictEqual(auditActionVariant('QUALQUER'), 'neutral');
  assert.strictEqual(shortId('12345678-aaaa-bbbb-cccc-123456789012'), '12345678…');
  assert.strictEqual(shortId(null), '—');
  console.log('✅ PASS: rótulos e identificadores');

  // consulta a visão SEM conteúdo (nunca a tabela base), paginada e ordenada
  response = { data: [{ id: '1', table_name: 'therapy_sessions', record_id: 'r', action: 'UPDATE', performed_by: 'u', actor_role: 'psychologist', created_at: '2026-09-20T10:00:00Z', changed_columns: ['summary'] }], error: null };
  let r = await SupabaseService.getAdminAuditLog({ from: 50, pageSize: 50, table: 'therapy_sessions' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(captured!.table, 'clinical_audit_log_admin', 'lê a visão restrita, não a tabela com conteúdo');
  const names = captured!.calls.map(c => c[0]);
  assert.ok(names.includes('range') && names.includes('order') && names.includes('eq'));
  assert.deepStrictEqual(captured!.calls.find(c => c[0] === 'range')![1], [50, 99]);
  assert.deepStrictEqual(r.data![0].changed_columns, ['summary']);
  console.log('✅ PASS: lê a visão sem conteúdo, com paginação e filtro');

  // migração 05 ausente → mensagem acionável
  response = { data: null, error: { code: 'PGRST205', message: "Could not find the table 'public.clinical_audit_log_admin' in the schema cache" } };
  r = await SupabaseService.getAdminAuditLog();
  assert.strictEqual(r.ok, false);
  assert.match(r.error || '', /migração 05/);
  console.log('✅ PASS: visão ausente orienta a aplicar a migração 05');

  console.log('🎉 Todos os testes da trilha de auditoria passaram!');
}

run().catch(e => { console.error('❌ FALHA:', e); process.exit(1); });
