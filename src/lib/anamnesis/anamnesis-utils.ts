import type {
  AnamnesisAnswers,
  AnamnesisAnswerValue,
  AnamnesisField,
  AnamnesisFieldType,
  AnamnesisResponse,
  AnamnesisTemplate,
} from '@/types/database';
import { SYSTEM_ANAMNESIS_TEMPLATES } from './default-templates';

export const FIELD_TYPE_LABELS: Record<AnamnesisFieldType, string> = {
  section: 'Título de seção',
  text: 'Resposta curta',
  textarea: 'Resposta longa',
  radio: 'Uma opção',
  checkbox: 'Várias opções',
  boolean: 'Sim / Não',
  date: 'Data',
  scale_10: 'Escala de 0 a 10',
};

export const STATUS_LABELS = { sent: 'Aguardando o paciente', draft: 'Rascunho', completed: 'Concluída' } as const;

/** Modelos padrão + personalizados do psicólogo. */
export function allTemplates(custom: AnamnesisTemplate[]): AnamnesisTemplate[] {
  return [...SYSTEM_ANAMNESIS_TEMPLATES, ...custom];
}

export function findTemplate(id: string | null | undefined, custom: AnamnesisTemplate[]): AnamnesisTemplate | undefined {
  if (!id) return undefined;
  return allTemplates(custom).find(t => t.id === id);
}

/** Perguntas que recebem resposta (tudo, menos títulos de seção). */
export const questionFields = (schema: AnamnesisField[]): AnamnesisField[] => schema.filter(f => f.type !== 'section');

/** Uma resposta conta como preenchida se tiver conteúdo; "Não" (false) e 0 são respostas válidas. */
export function isAnswered(value: AnamnesisAnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Rótulos das perguntas obrigatórias ainda sem resposta. */
export function missingRequired(schema: AnamnesisField[], answers: AnamnesisAnswers): string[] {
  return questionFields(schema).filter(f => f.required && !isAnswered(answers[f.id])).map(f => f.label);
}

export function progress(schema: AnamnesisField[], answers: AnamnesisAnswers): { answered: number; total: number } {
  const questions = questionFields(schema);
  return { answered: questions.filter(f => isAnswered(answers[f.id])).length, total: questions.length };
}

/**
 * Deixa só respostas de perguntas que existem no formulário, com o tipo certo. Protege o banco de lixo e de
 * campos inesperados enviados pelo link público.
 */
export function sanitizeAnswers(schema: AnamnesisField[], raw: Record<string, unknown>): AnamnesisAnswers {
  const clean: AnamnesisAnswers = {};
  for (const field of questionFields(schema)) {
    const value = raw[field.id];
    if (value === undefined || value === null) continue;

    switch (field.type) {
      case 'text':
      case 'date':
        if (typeof value === 'string') clean[field.id] = value.slice(0, 500);
        break;
      case 'textarea':
        if (typeof value === 'string') clean[field.id] = value.slice(0, 5000);
        break;
      case 'radio':
        if (typeof value === 'string' && (field.options || []).includes(value)) clean[field.id] = value;
        break;
      case 'checkbox':
        if (Array.isArray(value)) {
          const allowed = new Set(field.options || []);
          clean[field.id] = value.filter((v): v is string => typeof v === 'string' && allowed.has(v));
        }
        break;
      case 'boolean':
        if (typeof value === 'boolean') clean[field.id] = value;
        break;
      case 'scale_10':
        if (typeof value === 'number' && Number.isFinite(value)) clean[field.id] = Math.min(10, Math.max(0, Math.round(value)));
        break;
    }
  }
  return clean;
}

export interface AnswerRow {
  kind: 'section' | 'answer';
  label: string;
  /** Texto pronto para exibir; "—" quando não respondida. */
  text: string;
  answered: boolean;
}

/** Perguntas e respostas em formato de leitura (tela, impressão e exportação). */
export function answersToRows(schema: AnamnesisField[], answers: AnamnesisAnswers): AnswerRow[] {
  return schema.map(field => {
    if (field.type === 'section') return { kind: 'section', label: field.label, text: '', answered: true };
    const value = answers[field.id];
    let text = '—';
    if (isAnswered(value)) {
      if (Array.isArray(value)) text = value.join(', ');
      else if (typeof value === 'boolean') text = value ? 'Sim' : 'Não';
      else if (field.type === 'scale_10') text = `${value} / 10`;
      else if (field.type === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) text = value.split('-').reverse().join('/');
      else text = String(value);
    }
    return { kind: 'answer', label: field.label, text, answered: isAnswered(value) };
  });
}

// ---------------------------------------------------------------------------
// Editor de modelos
// ---------------------------------------------------------------------------

export function newFieldId(existing: AnamnesisField[]): string {
  const used = new Set(existing.map(f => f.id));
  let n = existing.length + 1;
  while (used.has(`q_${n}`)) n++;
  return `q_${n}`;
}

/** Mensagem do primeiro problema do modelo, ou null se estiver pronto para salvar. */
export function validateTemplate(template: Pick<AnamnesisTemplate, 'name' | 'schema'>): string | null {
  if (!template.name.trim()) return 'Dê um nome ao modelo.';
  const questions = questionFields(template.schema);
  if (questions.length === 0) return 'Adicione ao menos uma pergunta.';
  const ids = new Set<string>();
  for (const f of template.schema) {
    if (!f.label.trim()) return 'Toda pergunta e título precisa de um texto.';
    if (ids.has(f.id)) return 'Há perguntas com identificador repetido.';
    ids.add(f.id);
    if ((f.type === 'radio' || f.type === 'checkbox') && (f.options || []).filter(o => o.trim()).length < 2) {
      return `A pergunta "${f.label}" precisa de pelo menos 2 opções.`;
    }
  }
  return null;
}

/** Copia um modelo (ex.: duplicar um modelo padrão para editar). */
export function cloneTemplate(template: AnamnesisTemplate, name: string, id: string): AnamnesisTemplate {
  return { ...template, id, name, is_system: false, psychologist_id: template.psychologist_id ?? null, schema: template.schema.map(f => ({ ...f, options: f.options ? [...f.options] : undefined })) };
}

// ---------------------------------------------------------------------------
// Link de preenchimento pelo paciente
// ---------------------------------------------------------------------------

export const FILL_LINK_VALID_DAYS = 30;

/** 64 caracteres hexadecimais (256 bits) de um gerador criptográfico. */
export function generateFillToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function buildFillLink(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/anamnese/${token}`;
}

export function isLinkActive(response: Pick<AnamnesisResponse, 'fill_token' | 'token_expires_at' | 'status'>, now: Date = new Date()): boolean {
  if (!response.fill_token || response.status === 'completed') return false;
  return !response.token_expires_at || new Date(response.token_expires_at).getTime() > now.getTime();
}

/** Modelo sugerido pela idade quando o paciente não tem grupo com modelo definido. */
export function suggestTemplateId(age: number | null): string {
  if (age === null) return 'system:adulto';
  if (age < 12) return 'system:infantil';
  if (age < 18) return 'system:adolescente';
  if (age >= 60) return 'system:idoso';
  return 'system:adulto';
}
