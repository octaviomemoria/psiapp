import { supabase, isSupabaseConfigured } from './client';
import type { SessionModality, WeeklyHours } from '@/types/database';

/** Dados exibidos na página pública (devolvidos por get_public_booking_info). */
export interface PublicBookingInfo {
  psychologist_name: string;
  crp: string;
  slot_minutes: number;
  min_notice_hours: number;
  max_days_ahead: number;
  weekly_hours: WeeklyHours;
  modalities: SessionModality[];
  welcome_message: string | null;
  timezone: string;
}

export interface BookingRequestInput {
  slug: string;
  name: string;
  email: string;
  phone: string;
  startsAt: string;
  modality: SessionModality;
  message: string;
}

export type BookingErrorCode =
  | 'booking_unavailable'
  | 'invalid_input'
  | 'outside_hours'
  | 'slot_taken'
  | 'too_many_requests'
  | 'network'
  | 'unknown';

const BOOKING_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  booking_unavailable: 'Este link de agendamento não está disponível no momento.',
  invalid_input: 'Confira os dados informados (nome, e-mail e telefone) e tente novamente.',
  outside_hours: 'Este horário não está mais disponível. Escolha outro.',
  slot_taken: 'Este horário acabou de ser reservado por outra pessoa. Escolha outro.',
  too_many_requests: 'Você já tem solicitações pendentes com este profissional. Aguarde a resposta antes de pedir outro horário.',
  network: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
  unknown: 'Não foi possível enviar a solicitação. Tente novamente em instantes.',
};

export function describeBookingError(code: BookingErrorCode): string {
  return BOOKING_ERROR_MESSAGES[code];
}

/** As funções do banco levantam erros cuja mensagem é o próprio código. */
export function parseBookingError(error: { message?: string } | null | undefined): BookingErrorCode {
  const message = error?.message || '';
  const known: BookingErrorCode[] = ['booking_unavailable', 'invalid_input', 'outside_hours', 'slot_taken', 'too_many_requests'];
  return known.find(code => message.includes(code)) || 'unknown';
}

/** null = link inexistente ou desativado; 'error' = falha de conexão. */
export async function getPublicBookingInfo(slug: string): Promise<PublicBookingInfo | null | 'error'> {
  if (!isSupabaseConfigured || !supabase) return 'error';
  try {
    const { data, error } = await supabase.rpc('get_public_booking_info', { p_slug: slug });
    if (error) return 'error';
    return (data as PublicBookingInfo | null) || null;
  } catch {
    return 'error';
  }
}

/** Intervalos ocupados (sem dados de ninguém) entre fromIso e toIso; null se a consulta falhar. */
export async function getPublicBusySlots(slug: string, fromIso: string, toIso: string): Promise<{ start: string; end: string }[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_public_busy_slots', { p_slug: slug, p_from: fromIso, p_to: toIso });
    if (error) return null;
    return ((data as { busy_start: string; busy_end: string }[]) || []).map(r => ({ start: r.busy_start, end: r.busy_end }));
  } catch {
    return null;
  }
}

export async function createBookingRequest(input: BookingRequestInput): Promise<{ ok: true } | { ok: false; code: BookingErrorCode }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, code: 'network' };
  try {
    const { error } = await supabase.rpc('create_booking_request', {
      p_slug: input.slug,
      p_name: input.name,
      p_email: input.email,
      p_phone: input.phone,
      p_start: input.startsAt,
      p_modality: input.modality,
      p_message: input.message,
    });
    if (error) return { ok: false, code: parseBookingError(error) };
    return { ok: true };
  } catch {
    return { ok: false, code: 'network' };
  }
}
