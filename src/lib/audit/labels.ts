export const AUDIT_TABLE_LABELS: Record<string, string> = {
  therapy_sessions: 'Sessão clínica',
  session_private_notes: 'Anotação privada',
  consents: 'Consentimento',
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  INSERT: 'Criação',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
  ACCESS: 'Acesso',
  EXPORT: 'Exportação',
};

export type AuditBadgeVariant = 'success' | 'info' | 'danger' | 'warning' | 'neutral';

export function auditTableLabel(table: string): string {
  return AUDIT_TABLE_LABELS[table] || table;
}

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] || action;
}

export function auditActionVariant(action: string): AuditBadgeVariant {
  switch (action) {
    case 'INSERT': return 'success';
    case 'UPDATE': return 'info';
    case 'DELETE': return 'danger';
    case 'EXPORT': return 'warning';
    default: return 'neutral';
  }
}

/** Identificador curto para a tabela; o completo fica no tooltip. */
export function shortId(id?: string | null): string {
  if (!id) return '—';
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}
