/**
 * Módulo de Validação e Autenticidade de Documentos Clínicos (CFP 006/2019)
 * Gera hashes criptográficos SHA-256 para laudos, declarações e relatórios.
 */

export interface ClinicalDocumentMetadata {
  documentType: 'attendance_declaration' | 'evolution_report' | 'psychological_evaluation';
  patientName: string;
  psychologistName: string;
  crpNumber: string;
  crpState: string;
  issuedAt: string; // ISO format or YYYY-MM-DD
  clinicName?: string;
}

/**
 * Gera um hash SHA-256 determinístico de 64 caracteres hexadecimais
 */
export async function generateDocumentHash(meta: ClinicalDocumentMetadata): Promise<string> {
  const payload = [
    meta.documentType,
    meta.patientName.trim().toLowerCase(),
    meta.psychologistName.trim().toLowerCase(),
    meta.crpNumber.trim(),
    meta.crpState.trim().toUpperCase(),
    meta.issuedAt.trim(),
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retorna uma versão curta formatada do hash para impressão (ex: "A4F2-89B1-C03D-981F")
 */
export function formatShortHash(fullHash: string): string {
  if (!fullHash || fullHash.length < 16) return fullHash;
  const chunk1 = fullHash.slice(0, 4).toUpperCase();
  const chunk2 = fullHash.slice(4, 8).toUpperCase();
  const chunk3 = fullHash.slice(8, 12).toUpperCase();
  const chunk4 = fullHash.slice(12, 16).toUpperCase();
  return `${chunk1}-${chunk2}-${chunk3}-${chunk4}`;
}
