import type { AnamnesisField, AnamnesisFieldType, AnamnesisTemplate } from '@/types/database';

/**
 * Modelos padrão de anamnese. São um ponto de partida: a revisão do conteúdo clínico é responsabilidade do
 * profissional, que pode duplicar qualquer modelo e adaptá-lo. Os ids das perguntas são estáveis (não mudam entre
 * versões) e as respostas guardam uma cópia das perguntas, então ajustar um modelo não altera anamneses já feitas.
 */

const SYSTEM_PREFIX = 'system:';

export const isSystemTemplateId = (id: string | null | undefined): boolean => Boolean(id && id.startsWith(SYSTEM_PREFIX));

type Options = { options?: string[]; required?: boolean; description?: string; placeholder?: string };

function builder(prefix: string) {
  let n = 0;
  const id = () => `${prefix}_${String(++n).padStart(2, '0')}`;
  const field = (type: AnamnesisFieldType, label: string, opts: Options = {}): AnamnesisField => ({ id: id(), type, label, ...opts });
  return {
    section: (label: string, description?: string) => field('section', label, { description }),
    text: (label: string, opts?: Options) => field('text', label, opts),
    long: (label: string, opts?: Options) => field('textarea', label, opts),
    yesNo: (label: string, opts?: Options) => field('boolean', label, opts),
    one: (label: string, options: string[], opts?: Options) => field('radio', label, { ...opts, options }),
    many: (label: string, options: string[], opts?: Options) => field('checkbox', label, { ...opts, options }),
    scale: (label: string, opts?: Options) => field('scale_10', label, opts),
    date: (label: string, opts?: Options) => field('date', label, opts),
  };
}

const FREQUENCY = ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
const SLEEP_QUALITY = ['Muito boa', 'Boa', 'Regular', 'Ruim', 'Muito ruim'];

function adult(): AnamnesisField[] {
  const q = builder('adu');
  return [
    q.section('Motivo da busca por atendimento'),
    q.long('Qual é a sua principal queixa ou o motivo de procurar atendimento agora?', { required: true }),
    q.long('Desde quando isso acontece e o que costuma piorar ou aliviar?'),
    q.long('O que você espera do processo terapêutico?'),
    q.section('Saúde física'),
    q.yesNo('Você tem alguma condição de saúde física ou doença crônica?'),
    q.long('Se sim, qual(is) e em tratamento com quem?'),
    q.yesNo('Usa algum medicamento de forma contínua?'),
    q.long('Quais medicamentos e para quê?'),
    q.long('Cirurgias, internações ou acidentes relevantes'),
    q.section('Saúde mental e histórico'),
    q.yesNo('Já fez psicoterapia ou acompanhamento psiquiátrico antes?'),
    q.long('Como foi essa experiência e por que terminou?'),
    q.yesNo('Já recebeu algum diagnóstico de saúde mental?'),
    q.long('Qual diagnóstico e quando?'),
    q.yesNo('Há histórico de transtornos mentais na família?'),
    q.section('Hábitos e rotina'),
    q.one('Como você avalia a qualidade do seu sono?', SLEEP_QUALITY),
    q.text('Quantas horas dorme por noite, em média?'),
    q.one('Como está o seu apetite e a sua alimentação?', ['Muito bem', 'Bem', 'Irregular', 'Alterada (muito ou pouco)']),
    q.one('Pratica atividade física?', ['Regularmente', 'Às vezes', 'Não pratica']),
    q.one('Consumo de álcool', FREQUENCY),
    q.yesNo('Faz uso de tabaco ou outras substâncias?'),
    q.section('Vida social, família e trabalho'),
    q.long('Com quem você mora e como é a relação com essas pessoas?'),
    q.long('Como estão seus relacionamentos afetivos e de amizade?'),
    q.text('Ocupação atual'),
    q.scale('Satisfação com o trabalho ou os estudos (0 a 10)'),
    q.long('Quem são as pessoas em quem você pode confiar quando precisa de apoio?'),
    q.section('Como você tem se sentido'),
    q.many('Nas últimas semanas, com que frequência sentiu algo disto?', ['Tristeza ou desânimo', 'Ansiedade ou preocupação excessiva', 'Irritabilidade', 'Dificuldade de concentração', 'Cansaço constante', 'Pensamentos que não consegue controlar', 'Nenhum destes']),
    q.yesNo('Já teve pensamentos de se machucar ou de não querer mais viver?', { description: 'Sua resposta é confidencial e ajuda a cuidar melhor de você.' }),
    q.long('Algo mais que você considera importante que eu saiba?'),
  ];
}

function child(): AnamnesisField[] {
  const q = builder('inf');
  return [
    q.section('Sobre o preenchimento', 'Este formulário é respondido pelo responsável pela criança.'),
    q.text('Quem está respondendo e qual a relação com a criança?', { required: true }),
    q.section('Motivo da consulta'),
    q.long('O que motivou a busca por atendimento?', { required: true }),
    q.long('Quando notou pela primeira vez e o que já foi tentado?'),
    q.section('Gestação, parto e desenvolvimento'),
    q.long('Como foi a gestação e o parto? Houve intercorrências?'),
    q.text('Com que idade começou a andar e a falar?'),
    q.yesNo('Houve atraso ou preocupação com o desenvolvimento?'),
    q.long('Se sim, descreva'),
    q.section('Saúde'),
    q.long('Condições de saúde, alergias ou internações'),
    q.yesNo('Usa algum medicamento?'),
    q.yesNo('Já fez acompanhamento com psicólogo, fonoaudiólogo, neuropediatra ou outro profissional?'),
    q.one('Como é o sono da criança?', SLEEP_QUALITY),
    q.one('Como é a alimentação?', ['Come bem', 'Seletiva', 'Come pouco', 'Come demais']),
    q.section('Escola e aprendizagem'),
    q.text('Escola e série'),
    q.long('Como é o desempenho e a adaptação na escola?'),
    q.yesNo('A escola já relatou dificuldades de comportamento ou aprendizagem?'),
    q.long('Como é a relação com colegas e professores?'),
    q.section('Comportamento e emoções'),
    q.many('Quais destes comportamentos você observa?', ['Choro frequente', 'Birras intensas', 'Agressividade', 'Medos', 'Isolamento', 'Agitação', 'Dificuldade de atenção', 'Enurese ou encoprese', 'Nenhum destes']),
    q.long('Como a criança reage a frustrações e mudanças?'),
    q.text('Quanto tempo por dia em telas (TV, celular, jogos)?'),
    q.section('Família'),
    q.long('Quem mora com a criança e como é a rotina em casa?'),
    q.long('Houve mudanças importantes recentes (separação, mudança, perda, nascimento de irmão)?'),
    q.long('Como a família costuma lidar com limites e regras?'),
    q.long('Algo mais que considere importante?'),
  ];
}

function teen(): AnamnesisField[] {
  const q = builder('ado');
  return [
    q.section('Sobre o preenchimento', 'Pode ser respondido pelo adolescente, com apoio do responsável quando necessário.'),
    q.text('Quem está respondendo?', { required: true }),
    q.section('Motivo do atendimento'),
    q.long('O que trouxe você (ou o adolescente) para a terapia?', { required: true }),
    q.long('O que você gostaria que mudasse?'),
    q.section('Saúde e hábitos'),
    q.long('Condições de saúde, medicamentos ou acompanhamentos atuais'),
    q.one('Como está o sono?', SLEEP_QUALITY),
    q.one('Como está a alimentação?', ['Muito bem', 'Bem', 'Irregular', 'Alterada (muito ou pouco)']),
    q.text('Tempo médio por dia em telas e redes sociais'),
    q.one('Uso de álcool ou outras substâncias', ['Nunca', 'Já experimentou', 'Usa ocasionalmente', 'Usa com frequência']),
    q.section('Escola e futuro'),
    q.text('Escola e série'),
    q.scale('Como você se sente na escola? (0 a 10)'),
    q.long('Planos e sonhos para o futuro'),
    q.section('Relacionamentos'),
    q.long('Como é a convivência em casa?'),
    q.long('Como são as amizades e os relacionamentos afetivos?'),
    q.yesNo('Já sofreu ou presenciou bullying, violência ou situações que o(a) machucaram?'),
    q.section('Emoções'),
    q.many('Nas últimas semanas, sentiu com frequência:', ['Tristeza', 'Ansiedade', 'Raiva ou irritação', 'Solidão', 'Falta de motivação', 'Dificuldade para dormir', 'Nenhum destes']),
    q.yesNo('Já pensou em se machucar ou em não querer mais viver?', { description: 'Sua resposta é confidencial e ajuda a cuidar melhor de você.' }),
    q.long('Algo mais que queira contar?'),
  ];
}

function elderly(): AnamnesisField[] {
  const q = builder('ido');
  return [
    q.section('Motivo do atendimento'),
    q.long('O que motivou a procura por atendimento?', { required: true }),
    q.text('Quem está respondendo (a própria pessoa ou familiar/cuidador)?'),
    q.section('Saúde'),
    q.long('Doenças e condições de saúde atuais'),
    q.long('Medicamentos em uso'),
    q.yesNo('Tem dificuldade de audição ou visão?'),
    q.yesNo('Já teve quedas ou internações recentes?'),
    q.one('Como está o sono?', SLEEP_QUALITY),
    q.one('Como está o apetite?', ['Muito bem', 'Bem', 'Reduzido', 'Aumentado']),
    q.section('Memória e autonomia'),
    q.yesNo('Percebeu esquecimentos que atrapalham o dia a dia?'),
    q.long('Se sim, descreva exemplos'),
    q.many('Precisa de ajuda para:', ['Banho e higiene', 'Alimentação', 'Medicamentos', 'Finanças', 'Deslocamento', 'Compras', 'Nenhuma destas']),
    q.section('Vida social e emocional'),
    q.long('Com quem mora e como é a convivência?'),
    q.one('Frequência de contato com família e amigos', ['Diário', 'Semanal', 'Mensal', 'Raramente']),
    q.yesNo('Sente-se sozinho(a) com frequência?'),
    q.yesNo('Passou por perdas importantes recentemente (luto, aposentadoria, mudança)?'),
    q.long('Atividades que dão prazer e sentido no dia a dia'),
    q.many('Nas últimas semanas, sentiu:', ['Tristeza', 'Ansiedade', 'Irritabilidade', 'Desinteresse', 'Medo', 'Nenhum destes']),
    q.yesNo('Já pensou em não querer mais viver?', { description: 'Sua resposta é confidencial e ajuda a cuidar melhor de você.' }),
    q.long('Algo mais que considere importante?'),
  ];
}

function couple(): AnamnesisField[] {
  const q = builder('cas');
  return [
    q.section('Sobre o casal'),
    q.text('Nome de quem está preenchendo', { required: true }),
    q.text('Há quanto tempo estão juntos e como é a relação (namoro, união, casamento)?'),
    q.yesNo('Moram juntos?'),
    q.yesNo('Têm filhos?'),
    q.section('Motivo da busca'),
    q.long('Qual a principal dificuldade que os trouxe à terapia de casal?', { required: true }),
    q.long('Quando começou e o que já foi tentado para resolver?'),
    q.long('O que você espera da terapia?'),
    q.section('Relação'),
    q.scale('Satisfação atual com a relação (0 a 10)'),
    q.many('Quais áreas geram mais conflito?', ['Comunicação', 'Confiança', 'Finanças', 'Sexualidade', 'Filhos', 'Família de origem', 'Divisão de tarefas', 'Tempo juntos', 'Outro']),
    q.long('Como costumam lidar com discussões?'),
    q.long('O que funciona bem na relação?'),
    q.yesNo('Houve episódios de violência física, verbal ou ameaças?', { description: 'Responda com sinceridade. As informações são confidenciais e orientam o cuidado.' }),
    q.yesNo('Já fizeram terapia de casal antes?'),
    q.section('Saúde e rotina de quem responde'),
    q.long('Condições de saúde ou medicamentos que considere relevantes'),
    q.one('Como está o seu sono?', SLEEP_QUALITY),
    q.long('Algo mais que considere importante?'),
  ];
}

export const SYSTEM_ANAMNESIS_TEMPLATES: AnamnesisTemplate[] = [
  { id: `${SYSTEM_PREFIX}adulto`, name: 'Anamnese adulto', category: 'Adulto', description: 'Histórico geral, saúde, hábitos, relações e humor.', schema: adult(), is_system: true },
  { id: `${SYSTEM_PREFIX}infantil`, name: 'Anamnese infantil', category: 'Infantil', description: 'Respondida pelo responsável: desenvolvimento, escola, comportamento e família.', schema: child(), is_system: true },
  { id: `${SYSTEM_PREFIX}adolescente`, name: 'Anamnese adolescente', category: 'Adolescente', description: 'Rotina, escola, relações e emoções.', schema: teen(), is_system: true },
  { id: `${SYSTEM_PREFIX}idoso`, name: 'Anamnese idoso', category: 'Idoso', description: 'Saúde, autonomia, memória, vida social e emocional.', schema: elderly(), is_system: true },
  { id: `${SYSTEM_PREFIX}casal`, name: 'Anamnese casal', category: 'Casal', description: 'Motivo da busca, conflitos e pontos fortes da relação.', schema: couple(), is_system: true },
];
