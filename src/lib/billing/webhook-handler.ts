import { isUuid } from '../utils';

/**
 * Regras do webhook de pagamentos (Asaas), isoladas do transporte HTTP para serem testáveis.
 * O acesso ao banco entra por `WebhookDb`; em produção é implementado com a service_role (só no servidor).
 */
export interface AsaasWebhookPayload {
  event?: string;
  payment?: {
    id?: string;
    value?: number;
    billingType?: string;
    status?: string;
    externalReference?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
  };
  subscription?: { id?: string; externalReference?: string };
}

export interface WebhookAppointment {
  id: string;
  price: number | null;
  payment_status: string | null;
}

export interface WebhookDb {
  getAppointment(id: string): Promise<WebhookAppointment | null>;
  /** Só atualiza se o agendamento ainda estiver 'pending'. Devolve true se alterou uma linha. */
  markPaid(id: string, status: 'paid_pix' | 'paid_card', paidAt: string): Promise<boolean>;
  /** Só atualiza se o agendamento estiver pago (paid_*). Devolve true se alterou uma linha. */
  markRefunded(id: string): Promise<boolean>;
}

export interface WebhookOutcome {
  httpStatus: number;
  body: Record<string, unknown>;
}

const PAID_EVENTS = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']);
const SUBSCRIPTION_EVENTS = new Set(['SUBSCRIPTION_CREATED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_UPDATED']);

// Respostas 2xx para eventos que não são nossos (evita o gateway repetir e pausar a fila);
// 5xx somente para falhas nossas, que merecem nova tentativa.
export async function processPaymentWebhook(payload: AsaasWebhookPayload, db: WebhookDb): Promise<WebhookOutcome> {
  const event = payload?.event;
  if (!event || typeof event !== 'string') {
    return { httpStatus: 400, body: { error: 'Payload inválido: evento ausente.' } };
  }

  if (SUBSCRIPTION_EVENTS.has(event)) {
    // Assinaturas SaaS ainda não são tratadas: não afirmar "ativa" sem ter feito nada.
    return { httpStatus: 200, body: { received: true, status: 'ignored_not_implemented', event } };
  }

  const isPaid = PAID_EVENTS.has(event);
  const isRefund = event === 'PAYMENT_REFUNDED';
  if (!isPaid && !isRefund) {
    return { httpStatus: 200, body: { received: true, status: 'ignored_unhandled_event', event } };
  }

  const ref = payload.payment?.externalReference;
  if (!ref || !isUuid(ref)) {
    return { httpStatus: 200, body: { received: true, status: 'ignored_no_reference', event } };
  }

  try {
    const appointment = await db.getAppointment(ref);
    if (!appointment) {
      return { httpStatus: 200, body: { received: true, status: 'ignored_unknown_reference', event } };
    }

    if (isRefund) {
      const changed = await db.markRefunded(ref);
      return { httpStatus: 200, body: { received: true, status: changed ? 'refund_recorded' : 'already_processed', event, reference: ref } };
    }

    if ((appointment.payment_status || '').startsWith('paid')) {
      return { httpStatus: 200, body: { received: true, status: 'already_processed', event, reference: ref } };
    }

    // Não marca como pago se o valor recebido for menor que o combinado (pagamento parcial ou forjado).
    const value = Number(payload.payment?.value);
    const price = Number(appointment.price ?? 0);
    if (!Number.isFinite(value) || (price > 0 && value < price - 0.01)) {
      console.warn(`[BILLING-WEBHOOK] Valor divergente para o agendamento ${ref}: recebido=${payload.payment?.value} esperado=${price}`);
      return { httpStatus: 200, body: { received: true, status: 'amount_mismatch', event, reference: ref } };
    }

    const billingType = (payload.payment?.billingType || '').toUpperCase();
    const status = billingType === 'CREDIT_CARD' || billingType === 'DEBIT_CARD' ? 'paid_card' : 'paid_pix';
    const paidAt = payload.payment?.clientPaymentDate || payload.payment?.paymentDate || new Date().toISOString();
    const parsedPaidAt = new Date(paidAt);
    const changed = await db.markPaid(ref, status, isNaN(parsedPaidAt.getTime()) ? new Date().toISOString() : parsedPaidAt.toISOString());

    return { httpStatus: 200, body: { received: true, status: changed ? 'processed' : 'already_processed', event, reference: ref } };
  } catch (err) {
    console.error('[BILLING-WEBHOOK] Falha ao processar evento:', err);
    return { httpStatus: 500, body: { error: 'Erro interno no processamento do webhook.' } };
  }
}
