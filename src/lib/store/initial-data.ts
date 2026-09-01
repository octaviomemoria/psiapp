import {
  UserProfile,
  Psychologist,
  Patient,
  Appointment,
  TherapySession,
  Goal,
  ExerciseTemplate,
  AssignedExercise,
  DiaryEntry,
  MoodLog,
  ContentItem,
  PatientContent,
  InAppNotification,
  PsychometricResult,
  CognitiveDiagram,
  VoiceAnchor,
  PatientInvite,
  UserRole,
  Clinic,
  ClinicPsychologist,
  ClinicRoom,
  SaaSTenant,
  SaaSPlan,
  PlatformAuditLog
} from '@/types/database';

export const INITIAL_PSYCHOLOGIST_PROFILE: UserProfile = {
  id: 'profile-ana-martins',
  full_name: 'Dra. Ana Martins',
  display_name: 'Dra. Ana',
  email: 'ana.martins@psisaas.com.br',
  phone: '(11) 98765-4321',
  avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
  role: 'psychologist',
  created_at: '2026-01-10T09:00:00Z',
  updated_at: '2026-08-20T10:00:00Z',
};

export const INITIAL_PSYCHOLOGIST: Psychologist = {
  id: 'psychologist-ana-martins',
  profile_id: INITIAL_PSYCHOLOGIST_PROFILE.id,
  crp_number: '06/123456',
  crp_state: 'SP',
  approach: 'Terapia Cognitivo-Comportamental (TCC) & Mindfulness',
  specialties: ['Ansiedade e Pânico', 'Burnout e Estresse', 'Autoestima', 'Regulação Emocional'],
  bio: 'Psicóloga Clínica graduada pela USP, especialista em Terapia Cognitivo-Comportamental e Práticas Baseadas em Evidências.',
  profile: INITIAL_PSYCHOLOGIST_PROFILE,
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-mariana-costa',
    linked_profile_id: 'prof-mariana',
    full_name: 'Mariana Costa',
    social_name: 'Mari',
    birth_date: '1994-05-12',
    gender: 'Feminino',
    email: 'mariana.costa@email.com',
    phone: '(11) 99111-2233',
    emergency_contact_name: 'Lucas Costa (Irmão)',
    emergency_contact_phone: '(11) 98888-1111',
    status: 'active',
    started_at: '2026-02-10T14:00:00Z',
    clinical_notes_overview: 'Demanda: TAG com pensamentos catastróficos no ambiente corporativo e hipervigilância.',
    profile: {
      id: 'prof-mariana',
      full_name: 'Mariana Costa',
      display_name: 'Mariana',
      email: 'mariana.costa@email.com',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      role: 'patient',
      created_at: '2026-02-10T14:00:00Z',
      updated_at: '2026-08-22T10:00:00Z',
    }
  },
  {
    id: 'pat-pedro-almeida',
    linked_profile_id: 'prof-pedro',
    full_name: 'Pedro Almeida',
    birth_date: '1988-11-24',
    gender: 'Masculino',
    email: 'pedro.almeida@email.com',
    phone: '(11) 99222-3344',
    emergency_contact_name: 'Clara Almeida (Esposa)',
    emergency_contact_phone: '(11) 98888-2222',
    status: 'active',
    started_at: '2026-03-01T10:00:00Z',
    clinical_notes_overview: 'Demanda: Transição profissional, sobrecarga mental e dificuldades em estabelecer limites.',
    profile: {
      id: 'prof-pedro',
      full_name: 'Pedro Almeida',
      display_name: 'Pedro',
      email: 'pedro.almeida@email.com',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      role: 'patient',
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-08-20T10:00:00Z',
    }
  },
  {
    id: 'pat-fernanda-lima',
    linked_profile_id: 'prof-fernanda',
    full_name: 'Fernanda Lima',
    birth_date: '1997-08-30',
    gender: 'Feminino',
    email: 'fernanda.lima@email.com',
    phone: '(11) 99333-4455',
    status: 'active',
    started_at: '2026-01-15T15:00:00Z',
    clinical_notes_overview: 'Demanda: Autoestima fragilizada e dependência emocional em relações afetivas.',
    profile: {
      id: 'prof-fernanda',
      full_name: 'Fernanda Lima',
      display_name: 'Fernanda',
      email: 'fernanda.lima@email.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      role: 'patient',
      created_at: '2026-01-15T15:00:00Z',
      updated_at: '2026-08-18T10:00:00Z',
    }
  },
  {
    id: 'pat-carlos-oliveira',
    linked_profile_id: 'prof-carlos',
    full_name: 'Carlos Oliveira',
    birth_date: '1982-03-18',
    gender: 'Masculino',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 99444-5566',
    status: 'active',
    started_at: '2026-04-05T16:00:00Z',
    clinical_notes_overview: 'Demanda: Estresse crônico, distúrbios leves do sono e desregulação de humor no trabalho.',
    profile: {
      id: 'prof-carlos',
      full_name: 'Carlos Oliveira',
      display_name: 'Carlos',
      email: 'carlos.oliveira@email.com',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      role: 'patient',
      created_at: '2026-04-05T16:00:00Z',
      updated_at: '2026-08-15T10:00:00Z',
    }
  },
  {
    id: 'pat-juliana-rocha',
    linked_profile_id: 'prof-juliana',
    full_name: 'Juliana Rocha',
    birth_date: '1991-09-05',
    gender: 'Feminino',
    email: 'juliana.rocha@email.com',
    phone: '(11) 99555-6677',
    status: 'active',
    started_at: '2026-05-20T11:00:00Z',
    clinical_notes_overview: 'Demanda: Comunicação assertiva, perfeccionismo e autocobrança em projetos pessoais.',
    profile: {
      id: 'prof-juliana',
      full_name: 'Juliana Rocha',
      display_name: 'Juliana',
      email: 'juliana.rocha@email.com',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      role: 'patient',
      created_at: '2026-05-20T11:00:00Z',
      updated_at: '2026-08-19T10:00:00Z',
    }
  }
];

export const INITIAL_EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  {
    id: 'tpl-rpd-tcc',
    title: 'Registro de Pensamentos Disfuncionais (RPD)',
    description: 'Identificação e reestruturação cognitiva de pensamentos automáticos negativos.',
    instructions: 'Quando perceber uma alteração brusca de humor ou ansiedade, preencha os passos abaixo com sinceridade.',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-01-10T10:00:00Z',
    schema_fields: [
      {
        id: 'situacao',
        type: 'textarea',
        label: '1. O que estava acontecendo quando a emoção surgiu?',
        placeholder: 'Descreva a situação, onde estava, com quem e o horário...',
        required: true,
      },
      {
        id: 'pensamento_automatico',
        type: 'textarea',
        label: '2. Qual pensamento automático passou pela sua cabeça?',
        placeholder: 'Ex: "Não vou dar conta", "Eles estão me julgando"...',
        required: true,
      },
      {
        id: 'emocao_sentida',
        type: 'radio',
        label: '3. Qual foi a emoção predominante?',
        options: ['Ansiedade / Medo', 'Tristeza / Desânimo', 'Raiva / Irritação', 'Culpa / Vergonha', 'Frustração'],
        required: true,
      },
      {
        id: 'intensidade',
        type: 'scale_10',
        label: '4. De 0 a 10, qual foi a intensidade dessa emoção?',
        min: 0,
        max: 10,
        step: 1,
        required: true,
      },
      {
        id: 'comportamento',
        type: 'textarea',
        label: '5. Como você reagiu ou o que fez em seguida?',
        placeholder: 'Evitou a tarefa, respirou fundo, discutiu, paralisou...',
        required: false,
      },
      {
        id: 'pensamento_alternativo',
        type: 'textarea',
        label: '6. Olhando agora com distanciamento, existe uma forma mais realista ou gentil de interpretar?',
        placeholder: 'Evidências contra e a favor do pensamento, perspectiva realista...',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-descatastrofizacao',
    title: 'Exame de Evidências & Descatastrofização',
    description: 'Avaliação lógica do pior, melhor e mais provável cenário contra pensamentos de catástrofe.',
    instructions: 'Use este roteiro para confrontar medos catastróficos e traçar planos de ação realistas.',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-02-10T10:00:00Z',
    schema_fields: [
      {
        id: 'medo_catastrofico',
        type: 'textarea',
        label: '1. Qual é o seu maior medo sobre essa situação ("E se...")?',
        placeholder: 'Ex: "E se eu travar na reunião e todos rirem de mim?"',
        required: true,
      },
      {
        id: 'pior_cenario',
        type: 'textarea',
        label: '2. Qual é o PIOR cenário possível (mesmo que improvávei)?',
        required: true,
      },
      {
        id: 'enfrentamento_pior',
        type: 'textarea',
        label: '3. Se o pior cenário acontecesse, o que você faria concretamente para sobreviver e resolver?',
        placeholder: 'Quais recursos, pessoas e passos práticos você usaria?',
        required: true,
      },
      {
        id: 'melhor_cenario',
        type: 'textarea',
        label: '4. Qual seria o MELHOR cenário possível?',
        required: true,
      },
      {
        id: 'cenario_provavel',
        type: 'textarea',
        label: '5. Qual é o cenário MAIS PROVÁVEL e realista de acontecer?',
        placeholder: 'Baseado no que costuma acontecer de verdade...',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-ativacao-comportamental',
    title: 'Ativação Comportamental: Prazer & Domínio',
    description: 'Monitoramento de atividades com avaliação do senso de prazer e senso de realização.',
    instructions: 'Agende pequenas atividades diárias e pontue de 0 a 10 o Prazer (P) e o Domínio/Realização (D).',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-02-12T10:00:00Z',
    schema_fields: [
      {
        id: 'atividade_realizada',
        type: 'text',
        label: '1. Qual atividade você realizou hoje?',
        placeholder: 'Ex: Caminhada de 20 min, arrumar o armário, lavar a louça...',
        required: true,
      },
      {
        id: 'nivel_prazer',
        type: 'scale_10',
        label: '2. Nível de Prazer sentido durante/após a atividade (0 a 10)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'nivel_dominio',
        type: 'scale_10',
        label: '3. Nível de Domínio / Senso de Dever Cumprido (0 a 10)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'aprendizado',
        type: 'textarea',
        label: '4. O que essa ação te ensinou sobre o mito de esperar a motivação para agir?',
        required: false,
      }
    ]
  },
  {
    id: 'tpl-exposicao-gradual',
    title: 'Hierarquia de Exposição Gradual (SUDS)',
    description: 'Termômetro de ansiedade para enfrentamento sistemático de medos e situações evitadas.',
    instructions: 'Registre o nível de desconforto de 0 a 100 antes, durante e após a exposição gradual combinada com sua psicóloga.',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-02-15T10:00:00Z',
    schema_fields: [
      {
        id: 'situacao_exposta',
        type: 'text',
        label: '1. Qual situação temida você enfrentou?',
        placeholder: 'Ex: Ir ao supermercado no horário de pico sozinho...',
        required: true,
      },
      {
        id: 'suds_antes',
        type: 'scale_10',
        label: '2. Ansiedade esperada ANTES (0 = calmo, 10 = pânico extremo)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'suds_pico',
        type: 'scale_10',
        label: '3. Maior nível de ansiedade durante a exposição (Pico)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'suds_final',
        type: 'scale_10',
        label: '4. Ansiedade no final da exposição (após permanecer na situação)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'conclusao_habituacao',
        type: 'textarea',
        label: '5. A curva da ansiedade baixou enquanto você permaneceu? O que você observou?',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-bussola-valores-act',
    title: 'Bússola de Valores Pessoais (ACT)',
    description: 'Mapeamento de valores centrais e planejamento de ações comprometidas com o que importa.',
    instructions: 'Avalie a área escolhida da sua vida e defina uma microação de aproximação alinhada aos seus valores.',
    category: 'ACT',
    is_public_library: true,
    created_at: '2026-02-18T10:00:00Z',
    schema_fields: [
      {
        id: 'area_vida',
        type: 'radio',
        label: '1. Qual domínio de valor você deseja trabalhar hoje?',
        options: ['Relacionamentos Afetivos', 'Amizades & Social', 'Carreira & Vocação', 'Saúde & Autocuidado', 'Família', 'Lazer & Criatividade', 'Crescimento Pessoal'],
        required: true,
      },
      {
        id: 'valor_essencia',
        type: 'textarea',
        label: '2. Como você quer se comportar nessa área? Que tipo de pessoa quer ser?',
        placeholder: 'Ex: "Quero ser presente, afetuoso e ouvir com atenção sem pressa..."',
        required: true,
      },
      {
        id: 'nota_importancia',
        type: 'scale_10',
        label: '3. De 0 a 10, qual o grau de IMPORTÂNCIA desse valor para você?',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'nota_consistencia_atual',
        type: 'scale_10',
        label: '4. De 0 a 10, quão CONSISTENTES foram suas ações com esse valor na última semana?',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'acao_comprometida',
        type: 'textarea',
        label: '5. Qual MICROAÇÃO prática e específica você se compromete a fazer nas próximas 48h?',
        placeholder: 'Ex: "Ligar para o meu irmão e bater papo por 15 minutos..."',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-desfusao-cognitiva',
    title: 'Exercício de Desfusão Cognitiva: "Notando a Mente"',
    description: 'Técnica da ACT para se desvencilhar do controle rígido de pensamentos autocríticos.',
    instructions: 'Aprenda a ver pensamentos apenas como palavras ou eventos mentais passageiros, não como verdades absolutas.',
    category: 'ACT',
    is_public_library: true,
    created_at: '2026-02-20T10:00:00Z',
    schema_fields: [
      {
        id: 'pensamento_grudento',
        type: 'textarea',
        label: '1. Qual é o pensamento difícil ou autocrítico que está "grudado" em você?',
        placeholder: 'Ex: "Eu sou um fracasso", "Ninguém gosta de mim"...',
        required: true,
      },
      {
        id: 'reformulacao_notando',
        type: 'textarea',
        label: '2. Agora reescreva adicionando o prefixo: "Estou tendo o pensamento de que..."',
        placeholder: 'Ex: "Estou tendo o pensamento de que eu sou um fracasso."',
        required: true,
      },
      {
        id: 'reformulacao_observador',
        type: 'textarea',
        label: '3. Agora dê mais um passo atrás: "Estou NOTANDO que minha mente está me contando a história de que..."',
        placeholder: 'Ex: "Estou notando que minha mente está me contando a história de que eu sou um fracasso."',
        required: true,
      },
      {
        id: 'sensacao_distancia',
        type: 'scale_10',
        label: '4. Quão mais leve ou distante o pensamento parece agora? (0 = sem alívio, 10 = total distanciamento)',
        min: 0,
        max: 10,
        required: true,
      }
    ]
  },
  {
    id: 'tpl-tipp-crise',
    title: 'Protocolo TIPP de Emergência & Regulação Fisiológica',
    description: 'Habilidades de crise da DBT para reduzir rapidamente a ativação do sistema nervoso.',
    instructions: 'Execute um dos 4 passos fisiológicos quando a intensidade emocional ultrapassar seu limite de tolerância.',
    category: 'DBT',
    is_public_library: true,
    created_at: '2026-02-22T10:00:00Z',
    schema_fields: [
      {
        id: 'habilidade_escolhida',
        type: 'radio',
        label: '1. Qual técnica TIPP você utilizou no momento de crise?',
        options: [
          'T - Temperatura (Compressa fria / água gelada no rosto)',
          'I - Intense Exercise (Polichinelos, caminhada rápida ou corrida curta)',
          'P - Paced Breathing (Respiração ritmada com expiração longa)',
          'P - Paired Relaxation (Tencionar e relaxar grupos musculares)'
        ],
        required: true,
      },
      {
        id: 'intensidade_crise_antes',
        type: 'scale_10',
        label: '2. Intensidade da crise ANTES da técnica (0 a 10)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'intensidade_crise_depois',
        type: 'scale_10',
        label: '3. Intensidade da crise DEPOIS da técnica (0 a 10)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'relato_corpo',
        type: 'textarea',
        label: '4. Como seu corpo respondeu? (Batimentos desaceleraram, respiração normalizou?)',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-chain-analysis',
    title: 'Análise em Cadeia do Comportamento (Chain Analysis)',
    description: 'Desconstrução minuciosa de comportamentos impulsivos ou desregulados da DBT.',
    instructions: 'Investigue toda a cadeia de elos que levou a um comportamento indesejado para planejar saídas futuras.',
    category: 'DBT',
    is_public_library: true,
    created_at: '2026-02-23T10:00:00Z',
    schema_fields: [
      {
        id: 'comportamento_problema',
        type: 'textarea',
        label: '1. Qual foi o comportamento-problema executado?',
        placeholder: 'Ex: Ataque de fúria, consumo impulsivo, compulsão alimentar...',
        required: true,
      },
      {
        id: 'vulnerabilidade_previa',
        type: 'textarea',
        label: '2. Fatores de vulnerabilidade anteriores (Pouco sono, fome, dor física, estresse acumulado)?',
        required: true,
      },
      {
        id: 'evento_gatilho',
        type: 'textarea',
        label: '3. Qual foi o evento gatilho imediato?',
        placeholder: 'Uma mensagem, um comentário, uma frustração...',
        required: true,
      },
      {
        id: 'elos_internos',
        type: 'textarea',
        label: '4. Elos da cadeia: O que você pensou e sentiu no corpo nos segundos anteriores?',
        required: true,
      },
      {
        id: 'habilidade_prevencao_futura',
        type: 'textarea',
        label: '5. Em qual elo da corrente você poderia ter colocado uma habilidade alternativa (ex: STOP, TIPP)?',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-habilidade-stop',
    title: 'Habilidade STOP: Freio de Emergência contra Impulsividade',
    description: 'Pausa estruturada em 4 passos para evitar reações imediatas guiadas pela emoção.',
    instructions: 'Pratique a sequência STOP antes de responder a mensagens difíceis ou tomar decisões impulsivas.',
    category: 'DBT',
    is_public_library: true,
    created_at: '2026-02-24T10:00:00Z',
    schema_fields: [
      {
        id: 'gatilho_impulso',
        type: 'textarea',
        label: '1. Qual situação disparou a vontade de agir no impulso?',
        required: true,
      },
      {
        id: 'passo_stop',
        type: 'checkbox',
        label: '2. Confirme os 4 passos executados:',
        options: [
          'S - Stop (Pare! Congelei os movimentos e não reagi imediatamente)',
          'T - Take a step back (Dei um passo atrás e respirei fundo)',
          'O - Observe (Observei os fatos da situação sem misturar com julgamentos)',
          'P - Proceed mindfully (Perguntei: qual ação é mais sábia e eficaz agora?)'
        ],
        required: true,
      },
      {
        id: 'acao_sabia_escolhida',
        type: 'textarea',
        label: '3. Qual foi a ação sábia que você escolheu executar?',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-carta-autocompaixao',
    title: 'Carta de Autocompaixão (CFT)',
    description: 'Exercício de escrita terapêutica sob a ótica de um amigo incondicionalmente compreensivo.',
    instructions: 'Escreva para você mesmo com a mesma bondade e paciência que teria com uma pessoa querida em sofrimento.',
    category: 'CFT / Esquema',
    is_public_library: true,
    created_at: '2026-02-24T10:00:00Z',
    schema_fields: [
      {
        id: 'situacao_dor',
        type: 'textarea',
        label: '1. Sobre qual erro, imperfeição ou momento difícil você está se culpando?',
        required: true,
      },
      {
        id: 'humanidade_compartilhada',
        type: 'textarea',
        label: '2. Humanidade compartilhada: Lembre-se que falhar e sofrer faz parte da condição de todo ser humano.',
        placeholder: 'Você não é o único a passar por isso...',
        required: true,
      },
      {
        id: 'carta_amigo_sabio',
        type: 'textarea',
        label: '3. Escreva sua carta de apoio: O que um mentor afetuoso e compreensivo diria para você agora?',
        placeholder: 'Escreva em tom de acolhimento genuíno...',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-critico-adulto',
    title: 'Auditoria: Voz do Crítico Interno x Modo Adulto Saudável',
    description: 'Desarmamento de autoacusações severas através da voz protetora do Adulto Saudável.',
    instructions: 'Identifique os ataques da autocrítica e responda com limites e compaixão.',
    category: 'CFT / Esquema',
    is_public_library: true,
    created_at: '2026-02-24T10:00:00Z',
    schema_fields: [
      {
        id: 'ataque_critico',
        type: 'textarea',
        label: '1. O que o seu Crítico Punitivo/Exigente está dizendo na sua mente?',
        placeholder: 'Ex: "Você nunca faz nada direito, devia ter se esforçado mais..."',
        required: true,
      },
      {
        id: 'esquema_ativado',
        type: 'radio',
        label: '2. Qual esquema parece estar operando?',
        options: ['Padrões Inflexíveis / Perfeccionismo', 'Defectividade / Vergonha', 'Fracasso', 'Busca de Aprovação'],
        required: true,
      },
      {
        id: 'resposta_adulto_saudavel',
        type: 'textarea',
        label: '3. Resposta do Modo Adulto Saudável (Colocando limites no crítico e acolhendo seu esforço):',
        placeholder: 'Ex: "Basta! Eu fiz o melhor que podia com os recursos daquele momento..."',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-grounding-54321',
    title: 'Técnica de Ancoragem Sensorial 5-4-3-2-1',
    description: 'Técnica de atenção plena nos 5 sentidos para quebrar crises de pânico e despersonalização.',
    instructions: 'Observe o ambiente físico ao seu redor e registre os elementos sensoriais.',
    category: 'Neuropsicologia & Sensorial',
    is_public_library: true,
    created_at: '2026-02-24T10:00:00Z',
    schema_fields: [
      {
        id: 'cinco_visoes',
        type: 'textarea',
        label: '5 Coisas que você pode VER agora no ambiente',
        placeholder: 'Ex: O relógio na parede, a planta na mesa, a cor da caneta, o reflexo na janela, o quadro...',
        required: true,
      },
      {
        id: 'quatro_toques',
        type: 'textarea',
        label: '4 Coisas que você pode TOCAR ou sentir no corpo',
        placeholder: 'Ex: A textura do tecido da calça, os pés no chão firme, a temperatura do copo, a respiração...',
        required: true,
      },
      {
        id: 'tres_sons',
        type: 'textarea',
        label: '3 Coisas que você pode OUVIR ao longe ou perto',
        placeholder: 'Ex: O barulho do vento, o trânsito lá fora, o zumbido do computador...',
        required: true,
      },
      {
        id: 'dois_cheiros',
        type: 'textarea',
        label: '2 Coisas que você pode CHEIRAR',
        placeholder: 'Ex: Cheiro de café, sabonete nas mãos...',
        required: true,
      },
      {
        id: 'um_sabor',
        type: 'textarea',
        label: '1 Coisa que você pode SABOREAR',
        placeholder: 'Ex: Gosto da pasta de dente, um gole de água...',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-diario-sono',
    title: 'Diário do Sono e Ritmo Circadiano',
    description: 'Mapeamento de hábitos de higiene do sono e qualidade do descanso noturno.',
    instructions: 'Preencha pela manhã logo após acordar para identificar interferências no seu ciclo biológico.',
    category: 'Neuropsicologia & Sensorial',
    is_public_library: true,
    created_at: '2026-02-24T10:00:00Z',
    schema_fields: [
      {
        id: 'horario_deitou',
        type: 'text',
        label: '1. Que horas você foi para a cama ontem?',
        placeholder: 'Ex: 23:30',
        required: true,
      },
      {
        id: 'latencia_sono',
        type: 'text',
        label: '2. Quanto tempo levou para adormecer aproximadamente?',
        placeholder: 'Ex: 20 minutos, 1 hora...',
        required: true,
      },
      {
        id: 'despertares_noite',
        type: 'text',
        label: '3. Quantas vezes acordou durante a noite?',
        placeholder: 'Ex: Nenhuma, 2 vezes...',
        required: true,
      },
      {
        id: 'qualidade_sono',
        type: 'scale_10',
        label: '4. Qualidade percebida do descanso (0 = péssimo/exausto, 10 = reparador/disposto)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'fatores_interferentes',
        type: 'checkbox',
        label: '5. Fatores presentes antes de dormir:',
        options: ['Uso de telas na cama', 'Cafeína após as 16h', 'Preocupações na cabeça', 'Ambiente com luz/ruído', 'Refeição pesada tardia'],
      }
    ]
  },
  {
    id: 'tpl-diario-gratidao',
    title: 'Diário de Gratidão e Foco no Positivo',
    description: 'Exercício diário para treino de atenção a acontecimentos positivos e forças pessoais.',
    instructions: 'Ao final do seu dia, reserve 5 minutos em um ambiente calmo para registrar 3 coisas boas.',
    category: 'Psicologia Positiva',
    is_public_library: true,
    created_at: '2026-01-15T10:00:00Z',
    schema_fields: [
      {
        id: 'fato_1',
        type: 'text',
        label: '1º Acontecimento positivo ou motivo de gratidão de hoje',
        placeholder: 'Uma conversa agradável, uma refeição saborosa, uma conquista...',
        required: true,
      },
      {
        id: 'fato_2',
        type: 'text',
        label: '2º Acontecimento positivo ou motivo de gratidão de hoje',
        required: true,
      },
      {
        id: 'fato_3',
        type: 'text',
        label: '3º Acontecimento positivo ou motivo de gratidão de hoje',
        required: true,
      },
      {
        id: 'sentimento',
        type: 'mood_scale',
        label: 'Como você se sente após recordar esses momentos?',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-mindfulness-respiracao',
    title: 'Check-in de Atenção Plena e Respiração 4-7-8',
    description: 'Pausa consciente para desacelerar o sistema nervoso simpático.',
    instructions: 'Pratique 4 ciclos da respiração (inspirar por 4s, reter por 7s, expirar por 8s) e registre sua percepção corporal.',
    category: 'Mindfulness',
    is_public_library: true,
    created_at: '2026-02-01T10:00:00Z',
    schema_fields: [
      {
        id: 'nivel_tensao_antes',
        type: 'scale_10',
        label: 'Nível de tensão física ANTES da prática (0 = relaxado, 10 = muito tenso)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'sensacoes_corpo',
        type: 'checkbox',
        label: 'Onde você mais sentia a tensão?',
        options: ['Ombros e pescoço', 'Mandíbula apertada', 'Peito apertado', 'Estômago', 'Dor de cabeça'],
      },
      {
        id: 'nivel_tensao_depois',
        type: 'scale_10',
        label: 'Nível de tensão física DEPOIS da respiração (0 a 10)',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'observacoes',
        type: 'textarea',
        label: 'Algum pensamento ou sensação que chamou sua atenção durante o exercício?',
        required: false,
      }
    ]
  },
  {
    id: 'tpl-comunicacao-assertiva',
    title: 'Planejador de Conversas Difíceis (DEAR MAN)',
    description: 'Estruturação de pedidos e limites com assertividade e respeito mútuo.',
    instructions: 'Use este roteiro para preparar uma conversa importante sem agressividade ou submissão.',
    category: 'DBT',
    is_public_library: true,
    created_at: '2026-02-15T10:00:00Z',
    schema_fields: [
      {
        id: 'com_quem',
        type: 'text',
        label: 'Com quem você precisa conversar?',
        required: true,
      },
      {
        id: 'descrever_fatos',
        type: 'textarea',
        label: 'Descreva os fatos objetivos (sem julgamentos de valor ou acusações)',
        placeholder: 'Ex: "Nas últimas duas reuniões, você me interrompeu antes de eu concluir..."',
        required: true,
      },
      {
        id: 'expressar_sentimentos',
        type: 'textarea',
        label: 'Expresse como você se sente usando frases em primeira pessoa ("Eu sinto...")',
        required: true,
      },
      {
        id: 'afirmar_pedido',
        type: 'textarea',
        label: 'O que você está pedindo de forma clara e específica?',
        placeholder: 'Ex: "Gostaria de poder apresentar meus pontos até o final..."',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-seta-descendente',
    title: 'Técnica da Seta Descendente (Investigação de Crenças)',
    description: 'Desça das camadas superficiais do pensamento automático até as crenças nucleares sobre si mesmo.',
    instructions: 'A cada resposta, pergunte a si mesmo: "Se isso for verdade, o que isso significa sobre mim ou sobre o meu futuro?".',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-02-28T10:00:00Z',
    schema_fields: [
      {
        id: 'pensamento_superficial',
        type: 'textarea',
        label: '1. Qual foi o pensamento automático inicial?',
        placeholder: 'Ex: "Não consegui terminar a tarefa no prazo combinado."',
        required: true,
      },
      {
        id: 'camada_1',
        type: 'textarea',
        label: '2. Se isso for verdade, o que significa para você?',
        placeholder: 'Ex: "Significa que vão achar que sou desorganizado e incompetente."',
        required: true,
      },
      {
        id: 'camada_2',
        type: 'textarea',
        label: '3. E se acharem isso de você, qual é a pior consequência?',
        placeholder: 'Ex: "Vou perder a confiança das pessoas e serei rejeitado."',
        required: true,
      },
      {
        id: 'crenca_nuclear',
        type: 'radio',
        label: '4. Qual crença nuclear central parece estar por trás desse medo?',
        options: [
          'Desamor / Rejeição ("Eu não sou digno de afeto/respeito")',
          'Desamparo / Vulnerabilidade ("Eu sou fraco/incapaz de lidar")',
          'Desvalor / Defectividade ("Eu não tenho valor/sou um fracasso")'
        ],
        required: true,
      },
      {
        id: 'crenca_alternativa_saudavel',
        type: 'textarea',
        label: '5. Construa uma crença alternativa realista e compassiva:',
        placeholder: 'Ex: "Cometer um erro ou atrasar um prazo mostra que sou humano, não define meu valor."',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-tribunal-pensamentos',
    title: 'Tribunal dos Pensamentos: Acusação x Defesa',
    description: 'Confronte pensamentos autocríticos severos através do método dos dois advogados.',
    instructions: 'Coloque o pensamento automático no banco dos réus e avalie com imparcialidade.',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-02-28T10:00:00Z',
    schema_fields: [
      {
        id: 'acusacao_pensamento',
        type: 'textarea',
        label: '1. O Pensamento Réu (A Acusação do Crítico Interno):',
        placeholder: 'Ex: "Você estragou tudo e ninguém mais confia em você."',
        required: true,
      },
      {
        id: 'provas_acusacao',
        type: 'textarea',
        label: '2. Provas da Acusação (Fatos concretos que sustentam isso):',
        placeholder: 'Apenas fatos verificáveis, sem suposições...',
        required: true,
      },
      {
        id: 'provas_defesa',
        type: 'textarea',
        label: '3. Provas da Defesa (Fatos reais que contestam ou atenuam a acusação):',
        placeholder: 'Sucessos passados, contexto atenuante, intenção positiva, outras opiniões...',
        required: true,
      },
      {
        id: 'veredito_juiz',
        type: 'textarea',
        label: '4. Veredito do Juiz Neutro e Justo (A conclusão equilibrada):',
        placeholder: 'Ex: "Houve sim uma falha pontual, mas não houve dolo e já corrigi o que era possível."',
        required: true,
      },
      {
        id: 'alivio_emocional',
        type: 'scale_10',
        label: '5. Grau de alívio e clareza mental após o veredito (0 a 10):',
        min: 0,
        max: 10,
        required: true,
      }
    ]
  },
  {
    id: 'tpl-solucao-problemas-dzurilla',
    title: 'Resolução Prática de Problemas em 5 Etapas',
    description: 'Protocolo de tomada de decisão estruturada para desarmar sobrecarga e paralisia mental.',
    instructions: 'Siga as 5 etapas de D\'Zurilla para transformar uma preocupação difusa em passos executáveis.',
    category: 'TCC',
    is_public_library: true,
    created_at: '2026-02-28T10:00:00Z',
    schema_fields: [
      {
        id: 'definicao_problema',
        type: 'textarea',
        label: '1. Definição Objetiva do Problema (O que exatamente precisa ser resolvido?):',
        placeholder: 'Seja específico e focado no que está sob o seu controle...',
        required: true,
      },
      {
        id: 'brainstorming_opcoes',
        type: 'textarea',
        label: '2. Chuva de Ideias / Alternativas (Liste pelo menos 4 opções possíveis, sem censura prévia):',
        placeholder: 'Opção A, Opção B, Opção C, Opção D...',
        required: true,
      },
      {
        id: 'pros_contras_escolha',
        type: 'textarea',
        label: '3. Análise da Melhor Opção (Qual opção oferece o melhor equilíbrio de prós e contras viáveis?):',
        required: true,
      },
      {
        id: 'primeiro_passo_imediato',
        type: 'text',
        label: '4. Qual é o primeiro passo concreto que você dará hoje/amanhã?',
        placeholder: 'Ex: Agendar a conversa, redigir o e-mail, ligar para o técnico...',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-matriz-act',
    title: 'Matriz ACT: Mapa de Aproximação e Esquiva',
    description: 'Visualização dos 4 quadrantes para direcionar a vida rumo aos valores centrais.',
    instructions: 'Mapeie o que sua mente sente por dentro versus o que você faz por fora.',
    category: 'ACT',
    is_public_library: true,
    created_at: '2026-02-28T10:00:00Z',
    schema_fields: [
      {
        id: 'quem_importa_valores',
        type: 'textarea',
        label: '1. Quadrante Inferior Direito: Quem ou o que é realmente importante para você nesta área da vida?',
        placeholder: 'Pessoas queridas, valores de presença, integridade, cuidado...',
        required: true,
      },
      {
        id: 'dor_interna_obstaculos',
        type: 'textarea',
        label: '2. Quadrante Inferior Esquerdo: Quais pensamentos difíceis, medos ou sensações surgem para te travar?',
        placeholder: 'Medo de errar, ansiedade no peito, pensamentos de "não sou bom o bastante"...',
        required: true,
      },
      {
        id: 'comportamentos_afastamento',
        type: 'textarea',
        label: '3. Quadrante Superior Esquerdo: O que você faz por fora para tentar fugir ou anestesiar essa dor (Esquiva)?',
        placeholder: 'Procrastinar nas redes sociais, isolar-se, adiar decisões, comer no impulso...',
        required: true,
      },
      {
        id: 'comportamentos_aproximacao',
        type: 'textarea',
        label: '4. Quadrante Superior Direito: Que ação comprometida você pode fazer hoje para se aproximar dos seus valores?',
        placeholder: 'Ação concreta mesmo com a presença do desconforto...',
        required: true,
      }
    ]
  },
  {
    id: 'tpl-tres-bencaos-seligman',
    title: 'Diário das 3 Bênçãos & Gratidão Ativa (Seligman)',
    description: 'Protocolo de Psicologia Positiva com atribuição causal para ampliar emoções positivas sustentáveis.',
    instructions: 'Ao final do dia, registre 3 acontecimentos positivos e reflita sobre o porquê de terem acontecido.',
    category: 'Psicologia Positiva',
    is_public_library: true,
    created_at: '2026-02-28T10:00:00Z',
    schema_fields: [
      {
        id: 'bencao_1',
        type: 'textarea',
        label: '1ª Coisa Boa de Hoje & Por que isso aconteceu?',
        placeholder: 'Ex: Consegui caminhar 30 min no parque. Aconteceu porque organizei meu horário antes...',
        required: true,
      },
      {
        id: 'bencao_2',
        type: 'textarea',
        label: '2ª Coisa Boa de Hoje & Por que isso aconteceu?',
        placeholder: 'Ex: Uma conversa muito gostosa com um amigo...',
        required: true,
      },
      {
        id: 'bencao_3',
        type: 'textarea',
        label: '3ª Coisa Boa de Hoje & Por que isso aconteceu?',
        placeholder: 'Ex: Terminei uma tarefa que estava me preocupando...',
        required: true,
      },
      {
        id: 'impacto_humor',
        type: 'scale_10',
        label: 'De 0 a 10, como você avalia seu bem-estar agora após saborear esses momentos?',
        min: 0,
        max: 10,
        required: true,
      }
    ]
  }
];

export const INITIAL_ASSIGNED_EXERCISES: AssignedExercise[] = [
  {
    id: 'asg-mariana-1',
    template_id: 'tpl-rpd-tcc',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-mariana-costa',
    patient_name: 'Mariana Costa',
    title: 'Registro de Pensamentos Disfuncionais (RPD)',
    instructions: 'Mariana, preencha este exercício na próxima vez que notar o pico de ansiedade antes da reunião de sexta-feira.',
    schema_fields: INITIAL_EXERCISE_TEMPLATES[0].schema_fields,
    due_date: '2026-08-28',
    status: 'completed',
    assigned_at: '2026-08-20T11:00:00Z',
    completed_at: '2026-08-23T16:30:00Z',
    answer: {
      id: 'ans-mariana-1',
      assigned_exercise_id: 'asg-mariana-1',
      patient_id: 'pat-mariana-costa',
      submitted_at: '2026-08-23T16:30:00Z',
      patient_notes: 'Consegui identificar que estava antecipando o pior cenário possível.',
      responses: {
        situacao: 'Recebi um e-mail do diretor solicitando uma reunião de alinhamento individual.',
        pensamento_automatico: 'Ele vai me demitir ou apontar erros graves no relatório.',
        emocao_sentida: 'Ansiedade / Medo',
        intensidade: 8,
        comportamento: 'Fiquei relendo o relatório 4 vezes e sentindo taquicardia.',
        pensamento_alternativo: 'Reuniões de alinhamento são comuns na empresa. Entreguei todos os prazos no trimestre e recebi elogios recentes. Mesmo que haja ajustes, é um feedback profissional e não uma catástrofe.'
      }
    },
    feedback: {
      id: 'fdb-mariana-1',
      assigned_exercise_id: 'asg-mariana-1',
      psychologist_id: INITIAL_PSYCHOLOGIST.id,
      feedback_text: 'Excelente reestruturação, Mariana! Você conseguiu identificar a distorção de catastrofização e formulou um pensamento alternativo muito equilibrado e ancorado em fatos reais.',
      clinical_observations: 'Paciente demonstra bom domínio da técnica de RPD. Trazer para a próxima sessão para reforçar a autoeficácia.',
      created_at: '2026-08-24T09:00:00Z'
    }
  },
  {
    id: 'asg-mariana-2',
    template_id: 'tpl-mindfulness-respiracao',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-mariana-costa',
    patient_name: 'Mariana Costa',
    title: 'Check-in de Atenção Plena e Respiração 4-7-8',
    instructions: 'Faça a pausa da respiração 4-7-8 no meio da tarde, por pelo menos 3 dias nesta semana.',
    schema_fields: INITIAL_EXERCISE_TEMPLATES[2].schema_fields,
    due_date: '2026-08-29',
    status: 'pending',
    assigned_at: '2026-08-22T14:00:00Z',
  },
  {
    id: 'asg-pedro-1',
    template_id: 'tpl-diario-gratidao',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-pedro-almeida',
    patient_name: 'Pedro Almeida',
    title: 'Diário de Gratidão e Reconhecimento',
    instructions: 'Pedro, vamos focar em notar momentos de descanso e valorização pessoal fora do trabalho.',
    schema_fields: INITIAL_EXERCISE_TEMPLATES[1].schema_fields,
    due_date: '2026-08-27',
    status: 'pending',
    assigned_at: '2026-08-21T10:00:00Z',
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-mariana-1',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    title: 'Regulação de Ansiedade Corporativa',
    description: 'Reduzir episódios de taquicardia e pensamentos catastróficos utilizando técnicas de respiração e RPD.',
    category: 'Ansiedade',
    progress: 70,
    status: 'evolving',
    target_date: '2026-09-30',
    visible_to_patient: true,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-08-23T10:00:00Z',
  },
  {
    id: 'goal-mariana-2',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    title: 'Estabelecer Limites de Horário de Trabalho',
    description: 'Desconectar-se do e-mail corporativo após as 19h e nos finais de semana.',
    category: 'Hábitos',
    progress: 45,
    status: 'in_progress',
    target_date: '2026-10-15',
    visible_to_patient: true,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'goal-pedro-1',
    patient_id: 'pat-pedro-almeida',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    title: 'Mapeamento de Competências e Valores de Carreira',
    description: 'Identificar atividades com alto senso de propósito e alinhar objetivos de transição.',
    category: 'Autoconhecimento',
    progress: 60,
    status: 'evolving',
    target_date: '2026-09-15',
    visible_to_patient: true,
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'goal-fernanda-1',
    patient_id: 'pat-fernanda-lima',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    title: 'Comunicação de Necessidades Pessoais',
    description: 'Dizer "não" para pedidos abusivos sem sentimento desproporcional de culpa.',
    category: 'Autoestima',
    progress: 30,
    status: 'in_progress',
    target_date: '2026-10-30',
    visible_to_patient: true,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z',
  }
];

export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'diary-mariana-1',
    patient_id: 'pat-mariana-costa',
    title: 'Consegui apresentar sem travar',
    content: 'Hoje tive que apresentar o relatório na reunião geral. Minhas mãos suaram no início, mas usei a técnica da respiração que a Dra. Ana ensinou. Percebi que as pessoas estavam prestando atenção de verdade e ninguém estava procurando falhas. Saí da sala com uma sensação ótima de vitória!',
    predominant_emotion: 'Confiante',
    intensity: 8,
    is_shared_with_psychologist: true, // COMPARTILHADO COM A PSICÓLOGA
    entry_date: '2026-08-23T18:00:00Z',
    created_at: '2026-08-23T18:00:00Z',
    updated_at: '2026-08-23T18:00:00Z',
  },
  {
    id: 'diary-mariana-2',
    patient_id: 'pat-mariana-costa',
    title: 'Noite difícil com insônia',
    content: 'Fiquei pensando em pendências de casa e acordei no meio da noite. Não consegui voltar a dormir rápido, mas anotei tudo num caderno para tirar da cabeça.',
    predominant_emotion: 'Cansado',
    intensity: 6,
    is_shared_with_psychologist: false, // PRIVADO DA PACIENTE
    entry_date: '2026-08-21T07:30:00Z',
    created_at: '2026-08-21T07:30:00Z',
    updated_at: '2026-08-21T07:30:00Z',
  },
  {
    id: 'diary-mariana-3',
    patient_id: 'pat-mariana-costa',
    title: 'Passeio no parque com a família',
    content: 'Deixei o celular em modo avião por 3 horas no domingo. Foi incrível estar 100% presente com meu sobrinho.',
    predominant_emotion: 'Tranquilo',
    intensity: 9,
    is_shared_with_psychologist: true, // COMPARTILHADO COM A PSICÓLOGA
    entry_date: '2026-08-17T17:00:00Z',
    created_at: '2026-08-17T17:00:00Z',
    updated_at: '2026-08-17T17:00:00Z',
  }
];

export const INITIAL_MOOD_LOGS: MoodLog[] = [
  {
    id: 'mood-m-1',
    patient_id: 'pat-mariana-costa',
    mood_score: 4, // Bem
    emotions: ['Confiante', 'Motivado', 'Tranquilo'],
    intensity: 7,
    notes: 'Dia produtivo e consegui finalizar as demandas sem crise.',
    logged_at: '2026-08-24T19:00:00Z',
  },
  {
    id: 'mood-m-2',
    patient_id: 'pat-mariana-costa',
    mood_score: 4, // Bem
    emotions: ['Feliz', 'Tranquilo'],
    intensity: 8,
    notes: 'Apresentação correu super bem.',
    logged_at: '2026-08-23T19:00:00Z',
  },
  {
    id: 'mood-m-3',
    patient_id: 'pat-mariana-costa',
    mood_score: 2, // Mal
    emotions: ['Ansioso', 'Preocupado', 'Cansado'],
    intensity: 8,
    notes: 'Recebi e-mail da diretoria e bateu insegurança.',
    logged_at: '2026-08-22T15:00:00Z',
  },
  {
    id: 'mood-m-4',
    patient_id: 'pat-mariana-costa',
    mood_score: 3, // Neutro
    emotions: ['Cansado', 'Neutro'],
    intensity: 5,
    notes: 'Dia comum de trabalho.',
    logged_at: '2026-08-21T18:30:00Z',
  },
  {
    id: 'mood-m-5',
    patient_id: 'pat-mariana-costa',
    mood_score: 3, // Neutro
    emotions: ['Tranquilo'],
    intensity: 6,
    notes: 'Rotina estável.',
    logged_at: '2026-08-20T19:00:00Z',
  },
  {
    id: 'mood-m-6',
    patient_id: 'pat-mariana-costa',
    mood_score: 5, // Muito bem
    emotions: ['Feliz', 'Tranquilo', 'Motivado'],
    intensity: 9,
    notes: 'Fim de semana relaxante.',
    logged_at: '2026-08-17T20:00:00Z',
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-mariana-next',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-mariana-costa',
    patient_name: 'Mariana Costa',
    starts_at: '2026-08-26T14:00:00Z',
    ends_at: '2026-08-26T14:50:00Z',
    modality: 'online',
    location_or_link: 'https://meet.google.com/psi-ana-mariana',
    status: 'scheduled',
    price: 220,
    payment_status: 'paid_pix',
    receipt_number: 'REC-2026-084',
    notes: 'Sessão 14 - Revisão do RPD e consolidação da técnica de respiração.',
  },
  {
    id: 'apt-pedro-next',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-pedro-almeida',
    patient_name: 'Pedro Almeida',
    starts_at: '2026-08-26T16:00:00Z',
    ends_at: '2026-08-26T16:50:00Z',
    modality: 'online',
    location_or_link: 'https://meet.google.com/psi-ana-pedro',
    status: 'scheduled',
    price: 220,
    payment_status: 'pending',
    notes: 'Sessão 10 - Matriz de decisão de carreira.',
  },
  {
    id: 'apt-fernanda-next',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-fernanda-lima',
    patient_name: 'Fernanda Lima',
    starts_at: '2026-08-27T15:00:00Z',
    ends_at: '2026-08-27T15:50:00Z',
    modality: 'presencial',
    location_or_link: 'Consultório Sala 402 - Av. Paulista, 1000',
    status: 'confirmed',
    price: 250,
    payment_status: 'paid_card',
    receipt_number: 'REC-2026-085',
    notes: 'Sessão 16 - Treino de assertividade.',
  },
  {
    id: 'apt-mariana-past-1',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-mariana-costa',
    patient_name: 'Mariana Costa',
    starts_at: '2026-08-19T14:00:00Z',
    ends_at: '2026-08-19T14:50:00Z',
    modality: 'online',
    status: 'completed',
    price: 220,
    payment_status: 'paid_pix',
    receipt_number: 'REC-2026-081',
    notes: 'Sessão 13 realizada com sucesso.',
  }
];

export const INITIAL_SESSIONS: TherapySession[] = [
  {
    id: 'sess-mariana-13',
    appointment_id: 'apt-mariana-past-1',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-mariana-costa',
    session_number: 13,
    session_date: '2026-08-19T14:00:00Z',
    duration_minutes: 50,
    modality: 'online',
    main_topics: ['Ansiedade de desempenho', 'Gatilhos de e-mails corporativos', 'Mindfulness aplicado'],
    summary: 'A paciente relatou evolução satisfatória na percepção prévia dos sintomas de ansiedade. Exploramos a tendência à catastrofização quando surgem comunicações de superiores hierárquicos.',
    interventions_used: 'Psicoeducação sobre o ciclo do medo, treino de respiração 4-7-8 e prescrição de RPD como tarefa entre sessões.',
    evolution_observed: 'Maior capacidade de auto-observação e menor latência na recuperação do equilíbrio emocional.',
    homework_assigned: 'Praticar respiração 4-7-8 e preencher RPD caso ocorra gatilho de ansiedade.',
    next_session_plan: 'Avaliar os registros do RPD e trabalhar assertividade na comunicação profissional.',
    status: 'finalized',
    created_at: '2026-08-19T15:00:00Z',
    private_notes: {
      id: 'priv-mariana-13',
      session_id: 'sess-mariana-13',
      psychologist_id: INITIAL_PSYCHOLOGIST.id,
      patient_id: 'pat-mariana-costa',
      private_clinical_hypothesis: 'Padrão perfeccionista e esquema de desvalorização precoce ativado pela figura de autoridade masculina (relação paterna transferencial). Manter foco em TCC estruturada antes de aprofundar histórico familiar.',
      supervision_notes: 'Discutido em supervisão clínica: reforçar reforço positivo e autoeficácia.',
      transference_countertransference_notes: 'Paciente busca constante validação da terapeuta; incentivar autonomia.',
      risk_assessment_notes: 'Risco de crise aguda baixo; sem ideação suicida ou comportamento autolesivo.',
      created_at: '2026-08-19T15:00:00Z',
      updated_at: '2026-08-19T15:00:00Z',
    }
  },
  {
    id: 'sess-mariana-12',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    patient_id: 'pat-mariana-costa',
    session_number: 12,
    session_date: '2026-08-12T14:00:00Z',
    duration_minutes: 50,
    modality: 'online',
    main_topics: ['Rotina de sono', 'Hiperconectividade', 'Regulação de limites'],
    summary: 'Discussão sobre a interferência de notificações do celular à noite no ciclo de insônia. Definida meta de higiene do sono.',
    interventions_used: 'Higiene do sono e reestruturação de crenças sobre disponibilidade imediata.',
    evolution_observed: 'Paciente demonstrou prontidão para mudança de hábitos noturnos.',
    status: 'finalized',
    created_at: '2026-08-12T15:00:00Z',
  }
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'cnt-1',
    title: 'Guia Prático: Compreendendo o Ciclo da Ansiedade',
    description: 'Texto psicoeducativo detalhando como pensamentos, sintomas físicos e comportamentos se retroalimentam.',
    content_type: 'article',
    url_or_file_path: '/contents/guia-ansiedade.pdf',
    category: 'Ansiedade',
    tags: ['Psicoeducação', 'TCC', 'Autocuidado'],
    estimated_read_time_minutes: 6,
    is_public: true,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cnt-2',
    title: 'Áudio Guiado: Respiração Diafragmática e Ancoragem',
    description: 'Áudio de 8 minutos para guiar a desaceleração cardíaca e foco no momento presente.',
    content_type: 'audio',
    url_or_file_path: 'https://soundcloud.com/exemplo/respiracao-mindfulness',
    category: 'Mindfulness',
    tags: ['Relaxamento', 'Áudio', 'Respiração'],
    estimated_read_time_minutes: 8,
    is_public: true,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'cnt-3',
    title: 'Vídeo: Como estabelecer limites sem culpa',
    description: 'Palestra curta sobre comunicação não violenta e proteção do espaço emocional.',
    content_type: 'video',
    url_or_file_path: 'https://youtube.com/watch?v=exemplo-limites',
    category: 'Relacionamentos',
    tags: ['Assertividade', 'Autoestima'],
    estimated_read_time_minutes: 12,
    is_public: true,
    created_at: '2026-02-05T10:00:00Z',
  }
];

export const INITIAL_PATIENT_CONTENTS: PatientContent[] = [
  {
    id: 'p-cnt-1',
    content_id: 'cnt-1',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    content: INITIAL_CONTENT_ITEMS[0],
    personalized_note: 'Mariana, este texto reforça o que conversamos na sessão sobre não lutar contra a sensação física da ansiedade.',
    status: 'completed',
    assigned_at: '2026-08-15T10:00:00Z',
    opened_at: '2026-08-16T14:20:00Z',
    completed_at: '2026-08-16T14:40:00Z',
  },
  {
    id: 'p-cnt-2',
    content_id: 'cnt-2',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    content: INITIAL_CONTENT_ITEMS[1],
    personalized_note: 'Use este áudio de apoio antes de dormir quando a mente estiver agitada.',
    status: 'viewed',
    assigned_at: '2026-08-20T11:00:00Z',
    opened_at: '2026-08-22T21:10:00Z',
  }
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    recipient_role: 'patient',
    recipient_patient_id: 'pat-mariana-costa',
    title: 'Feedback Terapêutico Disponível',
    message: 'Dra. Ana Martins enviou um feedback sobre o seu exercício "Registro de Pensamentos Disfuncionais (RPD)".',
    type: 'feedback_received',
    read: false,
    target_tab: 'entre_sessoes',
    created_at: '2026-08-24T09:00:00Z',
  },
  {
    id: 'notif-2',
    recipient_role: 'patient',
    recipient_patient_id: 'pat-mariana-costa',
    title: 'Lembrete de Sessão',
    message: 'Sua próxima consulta online é amanhã às 14:00. O link da sala virtual já está disponível.',
    type: 'appointment_reminder',
    read: false,
    target_tab: 'inicio',
    created_at: '2026-08-25T08:00:00Z',
  },
  {
    id: 'notif-3',
    recipient_role: 'psychologist',
    title: 'Exercício Respondido',
    message: 'Mariana Costa respondeu e concluiu a atividade "Registro de Pensamentos Disfuncionais (RPD)".',
    type: 'exercise_completed',
    read: false,
    target_tab: 'pacientes',
    created_at: '2026-08-23T16:30:00Z',
  },
  {
    id: 'notif-4',
    recipient_role: 'psychologist',
    title: 'Diário Compartilhado',
    message: 'Mariana Costa compartilhou uma nova entrada de diário ("Consegui apresentar sem travar").',
    type: 'diary_shared',
    read: true,
    target_tab: 'pacientes',
    created_at: '2026-08-23T18:00:00Z',
  },
];

export const INITIAL_PSYCHOMETRIC_RESULTS: PsychometricResult[] = [
  {
    id: 'res-phq9-1',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    scale_id: 'phq9',
    scale_name: 'PHQ-9 (Questionário de Saúde do Paciente - Depressão)',
    total_score: 6,
    severity_level: 'Leve',
    risk_flag: false,
    answers: { 'q1': 1, 'q2': 1, 'q3': 1, 'q4': 1, 'q5': 0, 'q6': 1, 'q7': 1, 'q8': 0, 'q9': 0 },
    clinical_interpretation: 'Sintomatologia depressiva de intensidade leve, associada principalmente a alterações de sono e energia.',
    taken_at: '2026-08-20T10:30:00Z'
  },
  {
    id: 'res-gad7-1',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    scale_id: 'gad7',
    scale_name: 'GAD-7 (Escala de Ansiedade Generalizada)',
    total_score: 13,
    severity_level: 'Moderada',
    answers: { 'q1': 2, 'q2': 2, 'q3': 2, 'q4': 2, 'q5': 1, 'q6': 2, 'q7': 2 },
    clinical_interpretation: 'Ansiedade clinicamente significativa em nível moderado. Indicação de reforço em reestruturação cognitiva e desfusão.',
    taken_at: '2026-08-22T14:15:00Z'
  }
];

export const INITIAL_COGNITIVE_DIAGRAMS: CognitiveDiagram[] = [
  {
    id: 'diag-1',
    session_id: 'sess-1',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    situation: 'Reunião de diretoria onde tive que apresentar os resultados trimestrais',
    automatic_thought: 'Se eu cometer um erro, vão achar que sou incompetente e vão me demitir',
    meaning_of_thought: 'Não sou boa o suficiente (Crença de Desamor/Desvalor)',
    emotions: ['Ansiedade', 'Medo', 'Vergonha'],
    emotion_intensity: 85,
    physiological_reaction: 'Taquicardia, mãos suadas, nó na garganta e respiração curta',
    behavior: 'Falei rápido demais, evitei contato visual e pedi desculpas sem necessidade',
    alternative_thought: 'Já preparei essa apresentação, os dados estão sólidos e errar um detalhe não anula minha competência de anos.',
    outcome_emotion_intensity: 35,
    created_at: '2026-08-18T14:45:00Z'
  }
];

export const INITIAL_VOICE_ANCHORS: VoiceAnchor[] = [
  {
    id: 'voice-1',
    patient_id: 'pat-mariana-costa',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    title: 'Âncora de Respiração & Desfusão Gravada na Sessão',
    category: 'Regulação Emocional',
    duration_seconds: 120,
    transcript: 'Mariana, lembre-se do que combinamos: quando a mente disser "você não vai dar conta", respire fundo, sinta seus pés no chão e apenas observe o pensamento como uma nuvem passando.',
    created_at: '2026-08-18T14:50:00Z'
  }
];

export const INITIAL_INVITES: PatientInvite[] = [
  {
    id: 'inv-1',
    psychologist_id: INITIAL_PSYCHOLOGIST.id,
    token: 'convite-seguro-7f89a2bc',
    patient_name: 'Roberto Silveira',
    patient_email: 'roberto.silveira@email.com',
    patient_phone: '(11) 98712-3456',
    status: 'pending',
    expires_at: '2026-09-05T23:59:59Z',
    created_at: '2026-08-28T10:00:00Z'
  }
];

// =============================================================================
// CONTAS DE TESTE PRÉ-CONFIGURADAS (1-CLICK & PADRÃO)
// =============================================================================

export interface TestAccount {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  description: string;
  patientId?: string;
  iconType: 'patient' | 'psychologist' | 'manager' | 'superadmin';
}

export const INITIAL_TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'paciente@teste.com',
    password: 'paciente@teste.com',
    role: 'patient',
    name: 'Mariana Costa (Paciente Teste)',
    description: 'Acesso do paciente: diário íntimo, humor, 16 ferramentas de bolso e metas terapêuticas',
    patientId: 'pat-mariana-costa',
    iconType: 'patient'
  },
  {
    email: 'psicologo@teste.com',
    password: 'psicologo@teste.com',
    role: 'psychologist',
    name: 'Dra. Ana Martins (Psicóloga Clínica)',
    description: 'Acesso completo do terapeuta: prontuário 360° em 7 abas, notas de sigilo, agenda e relatórios CFP',
    iconType: 'psychologist'
  },
  {
    email: 'gerente@teste.com',
    password: 'gerente@teste.com',
    role: 'manager',
    name: 'Carlos Drummond (Gerente da Clínica)',
    description: 'Gestão da Clínica Mente Saudável: equipe, salas, financeiro e distribuição (Sem acesso a sigilo)',
    iconType: 'manager'
  },
  {
    email: 'superadmin@teste.com',
    password: 'superadmin@teste.com',
    role: 'superadmin',
    name: 'Octávio Memória (SuperAdmin do SaaS)',
    description: 'Administração global do SaaS: clínicas parceiras, planos MRR, logs de auditoria e segurança',
    iconType: 'superadmin'
  }
];

// =============================================================================
// DADOS DA CLÍNICA (MÓDULO DO GERENTE)
// =============================================================================

export const INITIAL_CLINIC: Clinic = {
  id: 'clinic-mente-saudavel',
  name: 'Clínica Mente Saudável',
  trade_name: 'Mente Saudável Psicologia Integrada',
  cnpj: '12.345.678/0001-90',
  address: 'Av. Paulista, 1578 - Conjunto 802, Bela Vista - São Paulo/SP',
  phone: '(11) 3254-8900',
  email: 'gerente@teste.com',
  owner_user_id: 'user-manager-carlos',
  active: true,
  created_at: '2025-06-15T08:00:00Z',
};

export const INITIAL_CLINIC_PSYCHOLOGISTS: ClinicPsychologist[] = [
  {
    id: 'cpsi-1',
    clinic_id: 'clinic-mente-saudavel',
    full_name: 'Dra. Ana Martins',
    email: 'psicologo@teste.com',
    phone: '(11) 98765-4321',
    crp: '06/123456',
    crp_state: 'SP',
    approach: 'TCC & Mindfulness',
    specialties: ['Ansiedade e Pânico', 'Burnout', 'Adultos'],
    commission_rate: 70,
    active_patients_count: 5,
    status: 'active',
    schedule_days: ['Seg', 'Ter', 'Qua', 'Qui'],
    joined_at: '2025-06-20T09:00:00Z'
  },
  {
    id: 'cpsi-2',
    clinic_id: 'clinic-mente-saudavel',
    full_name: 'Dr. Lucas Ferreira',
    email: 'lucas.ferreira@mentesaudavel.com.br',
    phone: '(11) 97722-3344',
    crp: '06/987123',
    crp_state: 'SP',
    approach: 'DBT & Terapia do Esquema',
    specialties: ['Regulação Emocional', 'Trauma', 'Adolescentes'],
    commission_rate: 65,
    active_patients_count: 8,
    status: 'active',
    schedule_days: ['Ter', 'Qua', 'Sex', 'Sáb'],
    joined_at: '2025-08-10T10:00:00Z'
  },
  {
    id: 'cpsi-3',
    clinic_id: 'clinic-mente-saudavel',
    full_name: 'Dra. Beatriz Menezes',
    email: 'beatriz.menezes@mentesaudavel.com.br',
    phone: '(11) 96655-4433',
    crp: '06/654321',
    crp_state: 'SP',
    approach: 'Psicanálise Contemporânea & ACT',
    specialties: ['Luto e Depressão', 'Relacionamentos', 'Adultos e Idosos'],
    commission_rate: 70,
    active_patients_count: 6,
    status: 'active',
    schedule_days: ['Seg', 'Qua', 'Sex'],
    joined_at: '2025-11-01T08:30:00Z'
  },
  {
    id: 'cpsi-4',
    clinic_id: 'clinic-mente-saudavel',
    full_name: 'Dr. Thiago Vasconcelos',
    email: 'thiago.v@mentesaudavel.com.br',
    phone: '(11) 95544-3322',
    crp: '06/445566',
    crp_state: 'SP',
    approach: 'Neuropsicologia & TCC',
    specialties: ['TDAH e Avaliação Neuropsicológica', 'Reabilitação Cognitiva'],
    commission_rate: 75,
    active_patients_count: 4,
    status: 'on_leave',
    schedule_days: ['Qui', 'Sex'],
    joined_at: '2026-01-15T14:00:00Z'
  }
];

export const INITIAL_CLINIC_ROOMS: ClinicRoom[] = [
  {
    id: 'room-1',
    clinic_id: 'clinic-mente-saudavel',
    name: 'Sala 01 - Acolhimento Adulto',
    room_number: '101',
    type: 'physical',
    capacity: 3,
    description: 'Poltronas ergonômicas, iluminação suave indireta e isolamento acústico duplo.',
    status: 'occupied',
    current_session_info: {
      psychologist_name: 'Dra. Ana Martins',
      patient_initials: 'M.C.',
      until: '15:00'
    }
  },
  {
    id: 'room-2',
    clinic_id: 'clinic-mente-saudavel',
    name: 'Sala 02 - Ludoterapia e Infantil',
    room_number: '102',
    type: 'physical',
    capacity: 4,
    description: 'Mesa de atividades, caixa de areia, brinquedos terapêuticos e piso emborrachado.',
    status: 'available'
  },
  {
    id: 'room-3',
    clinic_id: 'clinic-mente-saudavel',
    name: 'Sala 03 - Casal e Grupo',
    room_number: '103',
    type: 'physical',
    capacity: 8,
    description: 'Sofás amplos em ferradura para atendimento de casais, famílias e grupos psicoeducativos.',
    status: 'available'
  },
  {
    id: 'room-4',
    clinic_id: 'clinic-mente-saudavel',
    name: 'Sala Virtual VIP - Teleconsulta 01',
    type: 'virtual',
    capacity: 2,
    description: 'Sala de videoconferência HD com link criptografado corporativo integrado.',
    status: 'available'
  }
];

// =============================================================================
// DADOS DA PLATAFORMA SAAS (MÓDULO DO SUPERADMIN)
// =============================================================================

export const INITIAL_SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'plan-single',
    code: 'single',
    name: 'Psicólogo Autônomo',
    price_monthly: 89.90,
    max_psychologists: 1,
    features: [
      '1 Consultório do Psicólogo',
      'Pacientes Ilimitados',
      'Prontuário 360° com 7 Abas',
      '16 Ferramentas e Exercícios Clínicos',
      'Emissão de Relatórios CFP & Recibos',
      'Assistente de IA Ética Supervisionada'
    ]
  },
  {
    id: 'plan-pro',
    code: 'clinic_pro',
    name: 'Clínica Pro',
    price_monthly: 249.90,
    max_psychologists: 5,
    popular: true,
    features: [
      'Tudo do Plano Autônomo',
      'Até 5 Psicólogos na Equipe',
      'Gestão de Salas Físicas & Virtuais',
      'Financeiro Consolidado da Clínica & Repasses',
      'Distribuição Institucional de Pacientes',
      'Painel do Dono da Clínica com Sigilo Ético'
    ]
  },
  {
    id: 'plan-enterprise',
    code: 'clinic_enterprise',
    name: 'Clínica Enterprise',
    price_monthly: 590.00,
    max_psychologists: 30,
    features: [
      'Tudo do Plano Pro',
      'Psicólogos e Salas Ilimitados',
      'API Aberta & Integração com WhatsApp Próprio',
      'Domínio Personalizado (Whitelabel)',
      'Suporte Prioritário 24/7',
      'Auditoria Avançada de Conformidade LGPD'
    ]
  }
];

export const INITIAL_SAAS_TENANTS: SaaSTenant[] = [
  {
    id: 'tenant-1',
    clinic_name: 'Clínica Mente Saudável',
    owner_name: 'Carlos Drummond',
    owner_email: 'gerente@teste.com',
    plan_code: 'clinic_pro',
    status: 'active',
    psychologists_count: 4,
    max_psychologists: 5,
    monthly_mrr: 249.90,
    created_at: '2025-06-15T08:00:00Z',
    next_billing_date: '2026-09-15'
  },
  {
    id: 'tenant-2',
    clinic_name: 'Espaço Viver Bem Psicologia',
    owner_name: 'Dra. Roberta Dias',
    owner_email: 'roberta@espacoviverbem.com.br',
    plan_code: 'clinic_pro',
    status: 'active',
    psychologists_count: 3,
    max_psychologists: 5,
    monthly_mrr: 249.90,
    created_at: '2025-09-01T10:00:00Z',
    next_billing_date: '2026-09-01'
  },
  {
    id: 'tenant-3',
    clinic_name: 'Instituto Paulista de Neurociências',
    owner_name: 'Dr. Fernando Albuquerque',
    owner_email: 'contato@institutopaulistaneuro.com.br',
    plan_code: 'clinic_enterprise',
    status: 'active',
    psychologists_count: 14,
    max_psychologists: 30,
    monthly_mrr: 590.00,
    created_at: '2025-11-20T14:00:00Z',
    next_billing_date: '2026-09-20'
  },
  {
    id: 'tenant-4',
    clinic_name: 'Consultório Dra. Marina Albuquerque',
    owner_name: 'Dra. Marina Albuquerque',
    owner_email: 'marina.psico@gmail.com',
    plan_code: 'single',
    status: 'trial',
    psychologists_count: 1,
    max_psychologists: 1,
    monthly_mrr: 89.90,
    created_at: '2026-08-25T11:00:00Z',
    next_billing_date: '2026-09-08'
  },
  {
    id: 'tenant-5',
    clinic_name: 'Centro Integrado de Terapias Cognitivas',
    owner_name: 'Dr. Marcos Sampaio',
    owner_email: 'marcos@citcognitivas.com.br',
    plan_code: 'clinic_pro',
    status: 'past_due',
    psychologists_count: 5,
    max_psychologists: 5,
    monthly_mrr: 249.90,
    created_at: '2025-04-10T09:00:00Z',
    next_billing_date: '2026-08-20'
  }
];

export const INITIAL_PLATFORM_LOGS: PlatformAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-31T17:45:10Z',
    user_email: 'psicologo@teste.com',
    user_role: 'psychologist',
    action: 'Emissão de Relatório de Evolução CFP (Resolução 06/2019)',
    target: 'Paciente Mariana Costa',
    status: 'success',
    ip_address: '189.120.45.12'
  },
  {
    id: 'log-2',
    timestamp: '2026-08-31T16:30:22Z',
    user_email: 'gerente@teste.com',
    user_role: 'manager',
    action: 'Visualização de Repasses Financeiros da Clínica',
    target: 'Clínica Mente Saudável',
    status: 'success',
    ip_address: '177.18.90.34'
  },
  {
    id: 'log-3',
    timestamp: '2026-08-31T15:10:05Z',
    user_email: 'paciente@teste.com',
    user_role: 'patient',
    action: 'Check-in de Humor e Resposta de Ancoragem 5-4-3-2-1',
    target: 'Área Entre Sessões',
    status: 'success',
    ip_address: '186.230.12.88'
  },
  {
    id: 'log-4',
    timestamp: '2026-08-31T14:00:00Z',
    user_email: 'superadmin@teste.com',
    user_role: 'superadmin',
    action: 'Auditoria Global de Políticas RLS do Supabase',
    target: 'Multi-Tenant Security Gate',
    status: 'success',
    ip_address: '201.86.110.5'
  }
];


