import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase/client';
import { processPaymentWebhook, WebhookDb } from '@/lib/billing/webhook-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Comparação em tempo constante (o hash iguala o tamanho e evita vazar o segredo por timing). */
function secretsMatch(expected: string, received: string | null): boolean {
  if (!received) return false;
  const a = createHash('sha256').update(expected).digest();
  const b = createHash('sha256').update(received).digest();
  return timingSafeEqual(a, b);
}

function buildDb(): WebhookDb | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  // service_role: usada apenas aqui, no servidor, porque o webhook não tem sessão de usuário.
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  return {
    async getAppointment(id) {
      const { data, error } = await admin.from('appointments').select('id, price, payment_status').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { id: data.id, price: data.price, payment_status: data.payment_status } : null;
    },
    async markPaid(id, status, paidAt) {
      const { data, error } = await admin
        .from('appointments')
        .update({ payment_status: status, paid_at: paidAt })
        .eq('id', id)
        .eq('payment_status', 'pending')
        .select('id');
      if (error) throw new Error(error.message);
      return (data?.length ?? 0) > 0;
    },
    async markRefunded(id) {
      const { data, error } = await admin
        .from('appointments')
        .update({ payment_status: 'pending', paid_at: null })
        .eq('id', id)
        .in('payment_status', ['paid_pix', 'paid_card'])
        .select('id');
      if (error) throw new Error(error.message);
      return (data?.length ?? 0) > 0;
    },
  };
}

/**
 * Webhook de pagamentos (Asaas). POST /api/billing/webhook
 * Falha fechada: sem segredo configurado no servidor, ou com segredo errado, nada é processado.
 * (Antes, se a variável de ambiente não existisse, qualquer pessoa podia marcar sessões como pagas.)
 */
export async function POST(req: NextRequest) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN || process.env.PAYMENT_WEBHOOK_SECRET;
  if (!expectedToken) {
    console.error('[BILLING-WEBHOOK] ASAAS_WEBHOOK_TOKEN não configurado: webhook desativado.');
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 });
  }

  const receivedToken = req.headers.get('asaas-access-token') || req.headers.get('x-webhook-secret');
  if (!secretsMatch(expectedToken, receivedToken)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const db = buildDb();
  if (!db) {
    console.error('[BILLING-WEBHOOK] SUPABASE_SERVICE_ROLE_KEY não configurada: não é possível gravar pagamentos.');
    return NextResponse.json({ error: 'Servidor não configurado para gravar pagamentos.' }, { status: 503 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const outcome = await processPaymentWebhook(payload, db);
  return NextResponse.json(outcome.body, { status: outcome.httpStatus });
}

export async function GET() {
  return NextResponse.json({ status: 'online' });
}
