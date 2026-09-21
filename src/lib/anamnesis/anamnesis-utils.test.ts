import { SYSTEM_ANAMNESIS_TEMPLATES, isSystemTemplateId } from './default-templates';
import {
  allTemplates, answersToRows, buildFillLink, cloneTemplate, findTemplate, generateFillToken, isAnswered, isLinkActive,
  missingRequired, newFieldId, progress, questionFields, sanitizeAnswers, suggestTemplateId, validateTemplate,
} from './anamnesis-utils';
import { buildEvolutionEntries, buildEvolutionHtml, escapeHtml } from '../evolution/evolution-utils';
import type { AnamnesisField, TherapySession } from '@/types/database';

const failures: string[] = [];
const check = (condition: boolean, name: string) => {
  console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${name}`);
  if (!condition) failures.push(name);
};

// --- modelos padrão ---
const ids = SYSTEM_ANAMNESIS_TEMPLATES.map(t => t.id);
check(ids.join() === 'system:adulto,system:infantil,system:adolescente,system:idoso,system:casal', 'cinco modelos padrão com ids estáveis');
check(SYSTEM_ANAMNESIS_TEMPLATES.every(t => validateTemplate(t) === null), 'todos os modelos padrão são válidos');
check(SYSTEM_ANAMNESIS_TEMPLATES.every(t => new Set(t.schema.map(f => f.id)).size === t.schema.length), 'ids de perguntas únicos dentro de cada modelo');
check(SYSTEM_ANAMNESIS_TEMPLATES.every(t => questionFields(t.schema).length >= 15), 'cada modelo tem ao menos 15 perguntas');
check(SYSTEM_ANAMNESIS_TEMPLATES.every(t => t.schema[0].type === 'section'), 'cada modelo começa por um título de seção');
check(isSystemTemplateId('system:adulto') && !isSystemTemplateId('0b9f'), 'distingue modelo do sistema de personalizado');
check(allTemplates([]).length === 5 && findTemplate('system:idoso', [])?.category === 'Idoso' && findTemplate('x', []) === undefined, 'busca de modelos');

// --- respostas ---
const schema: AnamnesisField[] = [
  { id: 's1', type: 'section', label: 'Geral' },
  { id: 'a', type: 'text', label: 'Nome', required: true },
  { id: 'b', type: 'boolean', label: 'Já fez terapia?', required: true },
  { id: 'c', type: 'radio', label: 'Sono', options: ['Bom', 'Ruim'] },
  { id: 'd', type: 'checkbox', label: 'Sintomas', options: ['X', 'Y', 'Z'] },
  { id: 'e', type: 'scale_10', label: 'Nota' },
  { id: 'f', type: 'date', label: 'Quando' },
  { id: 'g', type: 'textarea', label: 'Conte' },
];
check(isAnswered(false) && isAnswered(0) && !isAnswered('  ') && !isAnswered([]) && !isAnswered(null) && !isAnswered(undefined) && isAnswered('x'), '"Não" e 0 contam como resposta; vazio não');
check(missingRequired(schema, { a: 'Lara' }).join() === 'Já fez terapia?', 'obrigatória respondida com "Não" não é falta');
check(missingRequired(schema, {}).length === 2, 'obrigatórias vazias são listadas');
const prog = progress(schema, { a: 'x', b: false, e: 0 });
check(prog.total === 7 && prog.answered === 3, 'progresso ignora títulos e conta respostas');

const dirty = sanitizeAnswers(schema, { a: 'x'.repeat(900), b: 'sim', c: 'Inventada', d: ['X', 'Q', 5], e: 42, f: '2026-01-02', g: 'ok', zzz: 'lixo', s1: 'título' });
check((dirty.a as string).length === 500, 'texto curto é limitado');
check(!('b' in dirty) && !('c' in dirty), 'tipo errado e opção inexistente são descartados');
check(JSON.stringify(dirty.d) === '["X"]', 'checkbox mantém só opções válidas');
check(dirty.e === 10 && dirty.f === '2026-01-02' && dirty.g === 'ok', 'escala é limitada a 0–10 e demais valores passam');
check(!('zzz' in dirty) && !('s1' in dirty), 'campos fora do formulário e títulos não são aceitos');
check(sanitizeAnswers(schema, { e: -5 }).e === 0 && sanitizeAnswers(schema, { b: false }).b === false, 'limite inferior e false preservado');

const rows = answersToRows(schema, { a: 'Lara', b: false, d: ['X', 'Y'], e: 7, f: '2026-03-09' });
check(rows[0].kind === 'section' && rows[1].text === 'Lara' && rows[2].text === 'Não', 'leitura: título, texto e "Não"');
check(rows[4].text === 'X, Y' && rows[5].text === '7 / 10' && rows[6].text === '09/03/2026', 'leitura: lista, escala e data em pt-BR');
check(rows[3].text === '—' && !rows[3].answered, 'leitura: pergunta sem resposta mostra —');

// --- editor de modelos ---
check(validateTemplate({ name: '', schema }) !== null, 'modelo sem nome é inválido');
check(validateTemplate({ name: 'x', schema: [{ id: 's', type: 'section', label: 'Só título' }] }) !== null, 'modelo só com títulos é inválido');
check(validateTemplate({ name: 'x', schema: [{ id: 'q', type: 'radio', label: 'Escolha', options: ['A'] }] }) !== null, 'pergunta de opção precisa de 2 opções');
check(validateTemplate({ name: 'x', schema: [{ id: 'q', type: 'text', label: 'A' }, { id: 'q', type: 'text', label: 'B' }] }) !== null, 'ids repetidos são inválidos');
check(validateTemplate({ name: 'x', schema: [{ id: 'q', type: 'text', label: ' ' }] }) !== null, 'pergunta sem texto é inválida');
check(validateTemplate({ name: 'ok', schema }) === null, 'modelo bem formado é válido');
check(newFieldId([{ id: 'q_2', type: 'text', label: 'a' }]) === 'q_3' && newFieldId([{ id: 'q_2', type: 'text', label: 'a' }, { id: 'q_3', type: 'text', label: 'b' }]) === 'q_4', 'novo id nunca colide');
const copy = cloneTemplate(SYSTEM_ANAMNESIS_TEMPLATES[0], 'Minha versão', 'novo-id');
copy.schema[1].label = 'ALTERADA';
check(copy.id === 'novo-id' && !copy.is_system && SYSTEM_ANAMNESIS_TEMPLATES[0].schema[1].label !== 'ALTERADA', 'duplicar não altera o modelo padrão');

check(suggestTemplateId(8) === 'system:infantil' && suggestTemplateId(15) === 'system:adolescente' && suggestTemplateId(35) === 'system:adulto' && suggestTemplateId(72) === 'system:idoso' && suggestTemplateId(null) === 'system:adulto', 'modelo sugerido pela idade');

// --- link de preenchimento ---
const token = generateFillToken();
check(/^[0-9a-f]{64}$/.test(token) && token !== generateFillToken(), 'token tem 64 caracteres hexadecimais e é único');
check(buildFillLink('https://app.exemplo.com/', token) === `https://app.exemplo.com/anamnese/${token}`, 'monta o link sem barra duplicada');
const now = new Date('2026-09-20T12:00:00Z');
check(isLinkActive({ fill_token: token, token_expires_at: '2026-10-01T00:00:00Z', status: 'sent' }, now), 'link dentro do prazo está ativo');
check(!isLinkActive({ fill_token: token, token_expires_at: '2026-09-01T00:00:00Z', status: 'sent' }, now), 'link vencido não está ativo');
check(!isLinkActive({ fill_token: null, token_expires_at: null, status: 'sent' }, now) && !isLinkActive({ fill_token: token, token_expires_at: null, status: 'completed' }, now), 'sem token ou já concluída não está ativo');

// --- ficha de evolução ---
function session(id: string, date: string, n: number, extra: Partial<TherapySession> = {}): TherapySession {
  return { id, psychologist_id: 'p', patient_id: 'pt', session_number: n, session_date: date, duration_minutes: 50, modality: 'online', main_topics: [], summary: '', status: 'finalized', created_at: date, ...extra };
}
const sessions = [
  session('s1', '2026-09-01T13:00:00Z', 1, { summary: 'Primeira conversa', evolution_observed: 'Mais aberta', private_notes: { private_clinical_hypothesis: 'HIPOTESE SECRETA' } as any }),
  session('s2', '2026-09-08T13:00:00Z', 2, { summary: 'Ansiedade no trabalho', main_topics: ['Trabalho'], soap_plan: 'Registro de pensamentos' }),
  session('s3', '2026-09-15T13:00:00Z', 3, { summary: '', status: 'draft' }),
];
check(buildEvolutionEntries(sessions).map(e => e.number).join() === '3,2,1', 'evolução da mais recente para a mais antiga');
check(buildEvolutionEntries(sessions, { order: 'asc' }).map(e => e.number).join() === '1,2,3', 'ordem cronológica quando pedida');
check(buildEvolutionEntries(sessions, { query: 'ANSIEDADE' }).length === 1 && buildEvolutionEntries(sessions, { query: 'registro' }).length === 1, 'busca ignora caixa e acento e olha os blocos');
check(buildEvolutionEntries(sessions, { from: '2026-09-05', to: '2026-09-10' }).map(e => e.number).join() === '2', 'filtro de período');
check(buildEvolutionEntries(sessions).find(e => e.number === 3)!.blocks.length === 0, 'blocos vazios não aparecem');
check(!JSON.stringify(buildEvolutionEntries(sessions)).includes('HIPOTESE SECRETA'), 'anotações privadas nunca entram na ficha');

process.env.TZ = 'America/Sao_Paulo';
const html = buildEvolutionHtml({
  birthDate: '1990-03-10',
  patientName: '<img src=x onerror=alert(1)>', psychologistName: 'Dra. Ana', crp: '06/1234', generatedAt: new Date('2026-09-20T12:00:00Z'),
  entries: buildEvolutionEntries([session('s', '2026-09-01T13:00:00Z', 1, { summary: 'Linha 1\nLinha 2 <script>x</script>' })]),
  scales: [{ taken_at: '2026-09-02T00:00:00Z', scale_name: 'PHQ-9', total_score: 12, severity_level: 'Moderada' }],
  anamnesis: { title: 'Adulto', completedAt: '2026-08-30T00:00:00Z', rows: answersToRows(schema, { a: '<b>x</b>' }) },
});
check(!html.includes('<img src=x') && !html.includes('<script>') && !html.includes('<b>x</b>'), 'HTML impresso escapa texto digitado');
check(html.includes('Linha 1<br>Linha 2') && html.includes('PHQ-9') && html.includes('Anamnese — Adulto') && html.includes('Resolução CFP'), 'documento traz quebra de linha, escalas, anamnese e rodapé');
check(html.includes('nascimento 10/03/1990'), 'data de nascimento não recua um dia');
check(escapeHtml(`&<>"'`) === '&amp;&lt;&gt;&quot;&#39;', 'escapeHtml cobre os cinco caracteres');

if (failures.length > 0) {
  console.error(`\n${failures.length} teste(s) falharam.`);
  process.exit(1);
}
console.log('\nTodos os testes de anamnese e evolução passaram.');
