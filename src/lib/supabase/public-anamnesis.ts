import { supabase, isSupabaseConfigured } from './client';
import type { AnamnesisAnswers, AnamnesisField } from '@/types/database';

/** O que a página pública do paciente recebe: nada além do necessário para preencher. */
export interface PublicAnamnesisForm {
  patient_first_name: string;
  psychologist_name: string;
  template_name: string;
  template_snapshot: AnamnesisField[];
}

/** null = link inexistente, vencido ou já usado; 'error' = falha de conexão. */
export async function getAnamnesisByToken(token: string): Promise<PublicAnamnesisForm | null | 'error'> {
  if (!isSupabaseConfigured || !supabase) return 'error';
  try {
    const { data, error } = await supabase.rpc('get_anamnesis_by_token', { p_token: token });
    if (error) return 'error';
    return (data as PublicAnamnesisForm | null) || null;
  } catch {
    return 'error';
  }
}

export type SubmitAnamnesisResult = 'ok' | 'invalid_link' | 'network';

export async function submitAnamnesisByToken(token: string, answers: AnamnesisAnswers): Promise<SubmitAnamnesisResult> {
  if (!isSupabaseConfigured || !supabase) return 'network';
  try {
    const { data, error } = await supabase.rpc('submit_anamnesis_by_token', { p_token: token, p_answers: answers });
    if (error) return 'network';
    return data === true ? 'ok' : 'invalid_link';
  } catch {
    return 'network';
  }
}
