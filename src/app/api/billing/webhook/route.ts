import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id: string;
    customer?: string;
    value?: number;
    netValue?: number;
    billingType?: string;
    status?: string;
    externalReference?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
  };
  subscription?: {
    id: string;
    status?: string;
    value?: number;
    externalReference?: string;
  };
}

/**
 * Webhook de Pagamentos (Asaas / Stripe / Pix Dinâmico)
 * Rota: POST /api/billing/webhook
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verificação de Token Secreto do Webhook
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN || process.env.PAYMENT_WEBHOOK_SECRET;
    const receivedToken = req.headers.get('asaas-access-token') || req.headers.get('x-webhook-secret');

    if (expectedToken && receivedToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Não autorizado. Token de webhook inválido.' },
        { status: 401 }
      );
    }

    const payload = (await req.json()) as AsaasWebhookPayload;
    const event = payload.event;
    const payment = payload.payment;
    const subscription = payload.subscription;

    if (!event) {
      return NextResponse.json(
        { error: 'Payload inválido: evento ausente.' },
        { status: 400 }
      );
    }

    // 2. Processamento de Pagamento de Sessão de Psicoterapia
    if (
      event === 'PAYMENT_RECEIVED' ||
      event === 'PAYMENT_CONFIRMED' ||
      event === 'payment_intent.succeeded'
    ) {
      const sessionId = payment?.externalReference;

      if (sessionId && supabase) {
        // Atualiza a sessão clínica para paga via Pix
        await supabase
          .from('therapy_sessions')
          .update({
            payment_status: 'paid_pix',
          })
          .eq('id', sessionId);

        // Registra na trilha de auditoria clínica
        await supabase.from('clinical_audit_log').insert({
          action: 'PAYMENT_CONFIRMED_WEBHOOK',
          resource_type: 'therapy_sessions',
          resource_id: sessionId,
          user_role: 'system',
          changes_summary: `Pagamento de R$ ${payment?.value?.toFixed(2) || '0.00'} confirmado via Pix Gateway.`,
        });
      }

      return NextResponse.json({
        received: true,
        status: 'processed',
        event,
        reference: sessionId,
      });
    }

    // 3. Processamento de Estorno / Reembolso
    if (event === 'PAYMENT_REFUNDED') {
      const sessionId = payment?.externalReference;
      if (sessionId && supabase) {
        await supabase
          .from('therapy_sessions')
          .update({ payment_status: 'pending' })
          .eq('id', sessionId);
      }

      return NextResponse.json({
        received: true,
        status: 'refund_recorded',
        event,
      });
    }

    // 4. Processamento de Assinatura SaaS da Clínica / Terapeuta
    if (
      event === 'SUBSCRIPTION_CREATED' ||
      event === 'SUBSCRIPTION_RENEWED' ||
      event === 'customer.subscription.updated'
    ) {
      const orgId = subscription?.externalReference;

      return NextResponse.json({
        received: true,
        status: 'subscription_active',
        event,
        organizationId: orgId,
      });
    }

    return NextResponse.json({
      received: true,
      status: 'ignored_unhandled_event',
      event,
    });
  } catch (error: any) {
    console.error('Erro no processamento do webhook de billing:', error);
    return NextResponse.json(
      { error: 'Erro interno no processamento do webhook.', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'PsiApp Billing Webhook Service',
    protocol: 'CFP / BACEN Pix Dynamic',
    timestamp: new Date().toISOString(),
  });
}
