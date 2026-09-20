import type { Patient } from '@/types/database';

export interface BillingResponsible {
  name: string;
  cpf?: string;
}

/**
 * Quem consta em cobranças, recibos e notas: o responsável, quando o cadastro o autoriza
 * (guardian_allow_billing_contact) e ele tem nome; caso contrário, o próprio paciente (nome civil e CPF).
 */
export function getBillingResponsible(
  patient: Pick<Patient, 'full_name' | 'cpf' | 'guardian_name' | 'guardian_cpf' | 'guardian_allow_billing_contact'> | null | undefined,
  fallbackName = 'Paciente'
): BillingResponsible {
  if (!patient) return { name: fallbackName };
  if (patient.guardian_allow_billing_contact && patient.guardian_name?.trim()) {
    return { name: patient.guardian_name.trim(), cpf: patient.guardian_cpf || undefined };
  }
  return { name: patient.full_name || fallbackName, cpf: patient.cpf || undefined };
}
