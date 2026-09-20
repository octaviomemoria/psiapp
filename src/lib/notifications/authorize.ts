import type { NotificationPayload } from './dispatcher';

const CHANNELS = ['email', 'whatsapp', 'both'] as const;
const TEMPLATES = ['session_reminder_24h', 'session_reminder_2h', 'booking_confirmed', 'pix_receipt'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ValidationResult =
  | { ok: true; payload: NotificationPayload }
  | { ok: false; error: string };

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  // Remove quebras de linha/controle: o texto entra numa mensagem enviada em nome da clínica.
  const clean = value.replace(/[\x00-\x1f\x7f]+/g, ' ').trim();
  return clean.length > 0 && clean.length <= max ? clean : undefined;
}

/** Deixa só dígitos e descarta o DDI 55, para comparar telefones gravados em formatos diferentes. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
}

export function validateNotificationPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Corpo inválido.' };
  const r = raw as Record<string, any>;

  if (!CHANNELS.includes(r.channel)) return { ok: false, error: 'Canal inválido.' };
  if (!TEMPLATES.includes(r.template)) return { ok: false, error: 'Template inválido.' };

  const recipientName = str(r.recipientName, 100);
  if (!recipientName) return { ok: false, error: 'recipientName obrigatório (até 100 caracteres).' };

  const email = typeof r.recipientEmail === 'string' ? r.recipientEmail.trim() : undefined;
  if (email !== undefined && (email.length > 254 || !EMAIL_RE.test(email))) return { ok: false, error: 'E-mail inválido.' };

  const phoneRaw = typeof r.recipientPhone === 'string' ? r.recipientPhone : undefined;
  const phone = phoneRaw !== undefined ? normalizePhone(phoneRaw) : undefined;
  if (phone !== undefined && (phone.length < 10 || phone.length > 11)) return { ok: false, error: 'Telefone inválido.' };

  const needsEmail = r.channel === 'email' || r.channel === 'both';
  const needsPhone = r.channel === 'whatsapp' || r.channel === 'both';
  if ((needsEmail && !needsPhone && !email) || (needsPhone && !needsEmail && !phone) || (r.channel === 'both' && !email && !phone)) {
    return { ok: false, error: 'Destinatário ausente para o canal escolhido.' };
  }

  const d = (r.data && typeof r.data === 'object' ? r.data : {}) as Record<string, any>;
  const psychologistName = str(d.psychologistName, 100);
  const sessionDate = str(d.sessionDate, 40);
  const sessionTime = str(d.sessionTime, 20);
  if (!psychologistName || !sessionDate || !sessionTime) {
    return { ok: false, error: 'data.psychologistName, data.sessionDate e data.sessionTime são obrigatórios.' };
  }

  let telehealthLink: string | undefined;
  if (d.telehealthLink !== undefined) {
    telehealthLink = str(d.telehealthLink, 300);
    if (!telehealthLink || !/^https:\/\//i.test(telehealthLink)) return { ok: false, error: 'telehealthLink deve ser uma URL https.' };
  }

  let amount: number | undefined;
  if (d.amount !== undefined) {
    amount = Number(d.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 100000) return { ok: false, error: 'Valor inválido.' };
  }

  return {
    ok: true,
    payload: {
      channel: r.channel,
      template: r.template,
      recipientName,
      recipientEmail: email,
      recipientPhone: phone,
      data: {
        psychologistName,
        sessionDate,
        sessionTime,
        crp: str(d.crp, 20),
        telehealthLink,
        amount,
        receiptHash: str(d.receiptHash, 64),
        clinicName: str(d.clinicName, 100),
      },
    },
  };
}

/**
 * O destinatário precisa ser paciente do psicólogo autenticado. Sem isso, qualquer psicólogo
 * cadastrado poderia usar o serviço para mandar mensagens da plataforma a números arbitrários.
 * `patients` deve vir de uma consulta feita COM a sessão do usuário (RLS já limita aos dele).
 */
export function recipientBelongsToPatients(
  payload: Pick<NotificationPayload, 'channel' | 'recipientEmail' | 'recipientPhone'>,
  patients: Array<{ email?: string | null; phone?: string | null }>
): boolean {
  const emails = new Set(patients.map(p => (p.email || '').trim().toLowerCase()).filter(Boolean));
  const phones = new Set(patients.map(p => normalizePhone(p.phone || '')).filter(p => p.length >= 10));

  const sendsEmail = (payload.channel === 'email' || payload.channel === 'both') && !!payload.recipientEmail;
  const sendsPhone = (payload.channel === 'whatsapp' || payload.channel === 'both') && !!payload.recipientPhone;
  if (!sendsEmail && !sendsPhone) return false;

  if (sendsEmail && !emails.has(payload.recipientEmail!.trim().toLowerCase())) return false;
  if (sendsPhone && !phones.has(normalizePhone(payload.recipientPhone!))) return false;
  return true;
}

/** Limite de envios por usuário (em memória: protege contra laço/abuso dentro de uma instância). */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(private max: number, private windowMs: number) {}

  allow(key: string, now = Date.now()): boolean {
    const recent = (this.hits.get(key) || []).filter(t => now - t < this.windowMs);
    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
