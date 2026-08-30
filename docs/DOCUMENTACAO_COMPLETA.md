# DOCUMENTAÇÃO COMPLETA — PLATAFORMA DE ACOMPANHAMENTO PSICOLÓGICO
**Versão 1.0 — 24/08/2026**

> Nome comercial a definir. Documento de produto, arquitetura e requisitos para desenvolvimento do MVP.



---


# 01 — Visão do Produto

## 1. Problema

A maior parte do acompanhamento psicológico ocorre em encontros espaçados. Entre uma sessão e outra, informações relevantes ficam dispersas em:

- WhatsApp;
- papel;
- notas do celular;
- planilhas;
- aplicativos genéricos;
- memória do paciente;
- ferramentas de agenda;
- arquivos locais do psicólogo.

Isso cria perda de continuidade, baixa adesão a exercícios, dificuldade de visualização longitudinal e riscos de privacidade.

## 2. Proposta de valor

Criar um ambiente seguro e estruturado que conecte o que acontece **na sessão** ao que acontece **entre sessões**.

### Para o psicólogo

- organização;
- visão longitudinal;
- redução de trabalho administrativo;
- exercícios estruturados;
- acompanhamento de adesão;
- agenda;
- registro profissional;
- biblioteca de conteúdos;
- futura assistência de IA sob supervisão.

### Para o paciente

- clareza sobre atividades;
- espaço estruturado para reflexão;
- acompanhamento de objetivos;
- diário;
- registro emocional;
- histórico;
- sensação de continuidade entre sessões.

## 3. Posicionamento

**Categoria:** SaaS de acompanhamento psicológico e relacionamento terapêutico.

Não deve ser posicionado como:

- “psicólogo de IA”;
- chatbot terapêutico substitutivo;
- ferramenta de diagnóstico;
- serviço de emergência;
- prescrição;
- plataforma de avaliação psicológica automática.

## 4. North Star

**Percentual de pacientes ativos que registram ao menos uma interação terapêutica estruturada entre duas sessões.**

Exemplos de interação:

- exercício;
- diário compartilhado;
- atualização de objetivo;
- registro de humor;
- leitura de conteúdo;
- resposta a uma orientação.

## 5. Objetivos do MVP

1. Cadastrar psicólogo.
2. Cadastrar pacientes.
3. Gerenciar relacionamento psicólogo-paciente.
4. Criar agenda.
5. Registrar sessão.
6. Manter registros profissionais.
7. Criar e atribuir exercícios.
8. Receber respostas.
9. Permitir diário.
10. Permitir registro de humor.
11. Criar objetivos.
12. Exibir evolução não diagnóstica.
13. Possuir trilha de auditoria.
14. Implementar consentimentos e políticas.
15. Preparar infraestrutura para notificações.

## 6. Fora do escopo inicial

- pagamentos;
- marketplace de psicólogos;
- convênios;
- emissão fiscal;
- teleconsulta própria;
- transcrição automática de áudio;
- gravação de sessão;
- prescrição;
- integração com prontuário hospitalar;
- avaliação psicológica automatizada;
- testes psicológicos proprietários;
- chatbot que execute psicoterapia.

## 7. Futuro do produto

### Fase 2
- assinatura e cobrança;
- videoconferência;
- notificações push;
- WhatsApp;
- planos para clínicas;
- múltiplos profissionais;
- relatórios avançados.

### Fase 3
- IA para organização de registros;
- busca semântica;
- sumarização longitudinal;
- sugestão de exercícios;
- assistente administrativo;
- ditado/transcrição com consentimento e controles.

### Fase 4
- marketplace opcional;
- indicadores para clínicas;
- integrações;
- aplicativo nativo;
- API pública;
- ecossistema de parceiros.

## 8. Diferenciais competitivos desejados

- UX muito simples;
- foco em “entre sessões”;
- privacidade como diferencial;
- separação de contextos de informação;
- biblioteca flexível de exercícios;
- longitudinalidade;
- arquitetura preparada para clínicas;
- IA responsável e supervisionada;
- auditabilidade.


---


# 02 — PRD e Requisitos

## 1. Épico A — Autenticação e onboarding

### RF-A01
Permitir cadastro de psicólogo por e-mail e senha.

### RF-A02
Confirmar e-mail.

### RF-A03
Permitir recuperação de senha.

### RF-A04
Permitir MFA opcional no MVP e recomendável como obrigatório para perfis profissionais em produção.

### RF-A05
Coletar:
- nome;
- CRP;
- estado;
- contato;
- aceite de termos;
- aceite de política de privacidade.

### RF-A06
Criar organização individual no primeiro login.

## 2. Épico B — Pacientes

### RF-B01
Cadastrar paciente.

Campos mínimos:
- nome;
- nome social, quando aplicável;
- data de nascimento;
- contato;
- status;
- data de início;
- observações administrativas.

### RF-B02
Convidar paciente ao app por link seguro.

### RF-B03
Status:
- convidado;
- ativo;
- pausado;
- encerrado.

### RF-B04
Permitir encerramento do acompanhamento sem apagar automaticamente registros obrigatórios.

## 3. Épico C — Agenda

### RF-C01
Criar atendimento.

Campos:
- paciente;
- início;
- fim;
- modalidade;
- local/link;
- observação administrativa;
- status.

### RF-C02
Status:
- agendada;
- confirmada;
- realizada;
- cancelada;
- falta;
- reagendada.

### RF-C03
Visualização:
- dia;
- semana;
- mês.

### RF-C04
Enviar lembrete futuramente por push/e-mail/WhatsApp conforme consentimento e configuração.

## 4. Épico D — Sessões e registros

### RF-D01
Criar registro de sessão vinculado ao atendimento.

### RF-D02
Campos clínicos estruturados:
- demanda/tema;
- objetivos trabalhados;
- evolução;
- procedimentos;
- encaminhamentos;
- plano;
- observações adicionais.

### RF-D03
Separar tipos de registro:
1. conteúdo de prontuário;
2. registro documental/restrito;
3. anotação administrativa.

### RF-D04
Qualquer alteração em conteúdo clínico deve gerar audit trail.

### RF-D05
Permitir exportação conforme processo validado.

## 5. Épico E — Objetivos

### RF-E01
Criar objetivo terapêutico.

Campos:
- título;
- descrição;
- data inicial;
- status;
- progresso opcional;
- notas;
- visibilidade.

### RF-E02
Status:
- não iniciado;
- em andamento;
- evoluindo;
- concluído;
- pausado.

## 6. Épico F — Exercícios

### RF-F01
Criar exercício por templates.

Tipos de questão:
- texto curto;
- texto longo;
- seleção única;
- seleção múltipla;
- escala;
- checklist;
- data;
- frequência.

### RF-F02
Salvar como:
- privado;
- reutilizável;
- organização.

### RF-F03
Atribuir a paciente com:
- data;
- prazo;
- instrução;
- recorrência futura.

### RF-F04
Paciente responde e envia.

### RF-F05
Status:
- pendente;
- em andamento;
- enviado;
- revisado;
- expirado;
- cancelado.

### RF-F06
Psicólogo pode registrar feedback.

## 7. Épico G — Diário

### RF-G01
Paciente cria entrada.

Campos:
- data/hora;
- título opcional;
- texto;
- emoção;
- intensidade;
- tags.

### RF-G02
Visibilidade:
- somente paciente;
- compartilhado com psicólogo.

### RF-G03
Alterar compartilhamento deve gerar evento de auditoria.

### RF-G04
Não transformar diário automaticamente em prontuário.

## 8. Épico H — Humor

### RF-H01
Registrar estado emocional.

Campos:
- escala;
- emoções;
- intensidade;
- comentário opcional.

### RF-H02
Mostrar histórico.

### RF-H03
Gráficos devem utilizar linguagem descritiva e não diagnóstica.

## 9. Épico I — Conteúdos

### RF-I01
Psicólogo cria biblioteca.

Tipos:
- texto;
- link;
- PDF;
- áudio;
- vídeo externo.

### RF-I02
Atribuir conteúdo a pacientes.

### RF-I03
Registrar status:
- enviado;
- aberto;
- concluído.

## 10. Épico J — Dashboard

### Psicólogo
- pacientes ativos;
- agenda;
- atividades entregues;
- atividades pendentes;
- registros recentes;
- atalhos.

### Paciente
- próxima sessão;
- como estou hoje;
- atividades;
- objetivos;
- conteúdos;
- registros recentes.

## 11. Requisitos não funcionais

### RNF-01 — Segurança
TLS em trânsito, criptografia adequada em repouso, políticas de acesso e segregação.

### RNF-02 — Performance
P95 das telas principais menor que 2,5s em condições normais.

### RNF-03 — Disponibilidade
Meta inicial: 99,5%.

### RNF-04 — Auditoria
Eventos críticos imutáveis para uso operacional.

### RNF-05 — Backup
Rotina automatizada e teste de restauração.

### RNF-06 — Responsividade
Mobile-first para paciente e responsivo para psicólogo.

### RNF-07 — Acessibilidade
WCAG 2.2 AA como objetivo.

### RNF-08 — Observabilidade
Logs, erros, métricas e tracing em operações críticas.

### RNF-09 — Minimização
Não coletar dado sem justificativa clara.

### RNF-10 — Portabilidade
Exportação estruturada futura em JSON/CSV/PDF conforme categoria de dado.


---


# 03 — Personas, Jornadas e Fluxos

## Persona 1 — Psicólogo clínico individual

### Objetivos
- organizar pacientes;
- reduzir anotações dispersas;
- acompanhar evolução;
- aumentar adesão aos exercícios;
- proteger dados;
- reduzir tarefas repetitivas.

### Dores
- WhatsApp misturado com vida pessoal;
- agenda fragmentada;
- exercícios em PDF;
- falta de histórico estruturado;
- retrabalho.

## Persona 2 — Paciente

### Objetivos
- lembrar o que foi combinado;
- refletir entre sessões;
- perceber padrões;
- registrar acontecimentos;
- completar exercícios com facilidade.

### Dores
- esquecer pontos da sessão;
- não saber onde guardar reflexões;
- perder arquivos;
- sentir que exercício é “mais uma tarefa”.

## Persona 3 — Gestor de clínica — futuro

### Objetivos
- gerenciar equipe;
- acompanhar agenda;
- controlar permissões;
- padronizar processos;
- manter compliance.

## Fluxo 1 — Onboarding do psicólogo

1. Cadastro.
2. Verificação de e-mail.
3. Configuração do perfil.
4. Registro do CRP.
5. Aceite de termos.
6. Configuração de segurança.
7. Criação da organização.
8. Tour do produto.
9. Cadastro do primeiro paciente.

## Fluxo 2 — Convite do paciente

1. Psicólogo cadastra paciente.
2. Sistema cria relação.
3. Sistema gera convite único com expiração.
4. Paciente cria conta.
5. Confirma identidade mínima.
6. Aceita termos e privacidade.
7. Visualiza quais dados serão compartilhados.
8. Entra no dashboard.

## Fluxo 3 — Ciclo de uma sessão

1. Atendimento agendado.
2. Lembrete.
3. Sessão ocorre.
4. Psicólogo marca como realizada.
5. Cria registro.
6. Atualiza objetivos.
7. Atribui exercício.
8. Paciente recebe aviso.
9. Paciente executa atividade.
10. Psicólogo revisa antes da próxima sessão.

## Fluxo 4 — Diário

1. Paciente abre “Meu Diário”.
2. Cria registro.
3. Define emoção/intensidade.
4. Escolhe privacidade.
5. Salva.
6. Se compartilhado, psicólogo vê no feed.
7. Se privado, permanece inacessível ao psicólogo.

## Fluxo 5 — Exercício

1. Psicólogo abre biblioteca.
2. Cria ou seleciona modelo.
3. Atribui.
4. Define prazo.
5. Paciente inicia.
6. Autosave.
7. Paciente envia.
8. Registro fica congelado como versão enviada.
9. Psicólogo revisa.
10. Feedback opcional.

## Fluxo 6 — Encerramento

1. Psicólogo altera status para encerramento.
2. Registra motivo/encaminhamento quando cabível.
3. Cancelam-se notificações futuras.
4. Paciente mantém direitos de acesso aplicáveis.
5. Regras de retenção entram em vigor.
6. Exclusão deve respeitar obrigações regulatórias e legais.

## Fluxo 7 — Situação potencialmente crítica

O produto não deve tentar “resolver” clinicamente.

1. Um registro pode conter texto sensível.
2. Caso exista mecanismo automatizado futuro, qualquer classificação deve ser tratada como sinal não diagnóstico.
3. Interface mostra recursos de segurança previamente definidos pela política do produto.
4. O app não promete monitoramento humano 24/7.
5. O profissional não deve receber promessa de alerta em tempo real sem infraestrutura que sustente SLA real.


---


# 04 — Regras de Negócio e Permissões

## 1. Modelo de acesso

Papéis:

- `platform_admin`
- `organization_owner`
- `psychologist`
- `clinic_staff` — futuro, acesso administrativo limitado
- `patient`

## 2. Matriz resumida

| Recurso | Psicólogo responsável | Paciente | Staff futuro | Admin plataforma |
|---|---:|---:|---:|---:|
| Dados cadastrais | Sim | Próprios | Limitado | Suporte controlado |
| Agenda | Sim | Própria | Sim, sem clínico | Suporte controlado |
| Prontuário | Sim | Conforme direito/processo | Não | Não por padrão |
| Registro restrito | Sim | Não | Não | Não por padrão |
| Diário privado | Não | Sim | Não | Não |
| Diário compartilhado | Sim | Sim | Não | Não |
| Exercícios | Sim | Responde | Não | Não |
| Objetivos | Sim | Conforme visibilidade | Não | Não |
| Auditoria | Leitura limitada | Eventos próprios quando cabível | Não | Segurança autorizada |

## 3. Regra de relacionamento

Um psicólogo só acessa dados clínicos se existir relacionamento ativo ou histórico autorizado entre o profissional e o paciente.

## 4. Multi-tenant

Toda entidade operacional deve conter `organization_id` quando fizer sentido.

As políticas RLS devem validar:

- organização;
- papel;
- relacionamento;
- propriedade;
- visibilidade;
- status.

## 5. Prontuário x registro restrito

O sistema deve modelar ambos separadamente.

### Prontuário
Registro clínico estruturado, sujeito às regras de acesso aplicáveis.

### Registro documental/restrito
Informação de acesso técnico restrito quando a natureza do dado exigir restrição.

### Proibição
Não utilizar um simples booleano `private_note=true` dentro da mesma tabela sem controles de autorização separados. O risco de vazamento por erro de frontend é alto.

## 6. Diário

- padrão inicial: privado;
- paciente escolhe compartilhar;
- psicólogo não pode alterar privacidade do diário do paciente;
- compartilhamento não implica automaticamente incorporação ao prontuário.

## 7. Exclusão

A ação “excluir conta” não pode executar `DELETE CASCADE` indiscriminado.

Fluxo:
1. receber solicitação;
2. classificar dados;
3. eliminar o que puder ser eliminado;
4. reter o que deva ser retido;
5. anonimizar quando aplicável;
6. registrar justificativa.

## 8. Alteração de registro clínico

- manter versão;
- registrar autor;
- timestamp;
- motivo opcional/obrigatório conforme política;
- impedir alteração silenciosa.

## 9. Convite

- token de uso único;
- expiração;
- hash do token no banco;
- revogação;
- não expor dados clínicos na URL.

## 10. Notificações

Não incluir detalhes clínicos sensíveis no corpo de push/e-mail por padrão.

Preferir:
“Você tem uma nova atividade no aplicativo.”

Evitar:
“Seu psicólogo enviou exercício sobre crise de ansiedade.”

## 11. Exportação

Exportações clínicas devem:

- exigir reautenticação;
- registrar auditoria;
- possuir expiração;
- evitar links públicos;
- incluir apenas escopo autorizado.

## 12. Menores de idade

Não implementar no MVP sem desenho específico de:

- responsáveis;
- consentimentos;
- representação;
- visibilidade;
- sigilo;
- regras profissionais;
- incidentes.

Recomendação de produto: MVP inicialmente para maiores de 18 anos.


---


# 05 — Arquitetura Técnica

## 1. Arquitetura de alto nível

```text
[Browser / PWA]
      |
      v
[Next.js]
      |
      +--> [Supabase Auth]
      |
      +--> [PostgREST / RPC / Edge Functions]
      |
      v
[PostgreSQL + RLS]
      |
      +--> [Storage privado]
      |
      +--> [Audit events]
      |
      +--> [Jobs / Webhooks]
```

## 2. Princípios

- frontend nunca é fonte de autorização;
- autorização deve existir no banco/API;
- nenhum bucket clínico público;
- service role apenas em backend confiável;
- segredos nunca no navegador;
- separação de domínios;
- event log para operações críticas.

## 3. Domínios

### Identity
- users
- profiles
- organizations
- memberships

### Care
- patients
- psychologist_patient_relationships
- appointments
- therapy_sessions
- clinical_records
- restricted_records
- goals

### Engagement
- exercises
- assignments
- responses
- mood_logs
- diary_entries
- contents

### Platform
- notifications
- consents
- audit_logs
- feature_flags

## 4. Next.js

Estrutura sugerida:

```text
src/
  app/
    (auth)/
    (psychologist)/
    (patient)/
    api/
  components/
  features/
    appointments/
    patients/
    records/
    exercises/
    diary/
    mood/
    goals/
  lib/
    supabase/
    auth/
    permissions/
    validation/
    audit/
  types/
```

## 5. Supabase

### Auth
- email/senha;
- magic link opcional;
- MFA;
- sessão curta para ações sensíveis.

### PostgreSQL
- UUID;
- timestamptz;
- constraints;
- foreign keys;
- índices;
- RLS.

### Storage
Buckets:
- `patient-content-private`
- `professional-content-private`
- `library-assets`

Nunca usar bucket público para dados de saúde.

## 6. Edge Functions

Usar para:

- convites;
- notificações;
- exportações;
- ações administrativas;
- chamadas futuras de IA;
- integrações.

## 7. Jobs

- expirar convites;
- lembretes;
- limpar arquivos temporários;
- recalcular métricas;
- retenção;
- alertas operacionais.

## 8. Ambientes

- local
- development
- staging
- production

Dados reais nunca devem ser copiados diretamente para staging sem anonimização.

## 9. Estratégia multi-clínica

Mesmo no MVP individual, criar `organizations`.

Motivo:
evita migração estrutural quando forem adicionadas clínicas.

## 10. Feature flags

Flags:
- `ai_assistant`
- `whatsapp`
- `telehealth`
- `clinic_mode`
- `minor_patients`
- `advanced_exports`

## 11. Decisão arquitetural importante

Evitar guardar respostas de exercícios e diário em uma única coluna JSON sem estrutura.

JSONB pode ser usado no construtor de formulários, mas entidades de negócio e metadados importantes devem permanecer relacionais.


---


# 06 — Banco de Dados

## Convenções

- PK: `id uuid`
- datas: `timestamptz`
- soft delete onde necessário: `deleted_at`
- auditoria: `created_at`, `updated_at`, `created_by`
- tenant: `organization_id`

## Tabelas

### `profiles`
- id
- full_name
- display_name
- avatar_path
- phone
- created_at
- updated_at

### `organizations`
- id
- name
- type
- owner_user_id
- created_at

### `organization_members`
- id
- organization_id
- user_id
- role
- status

### `psychologists`
- id
- user_id
- organization_id
- crp_number
- crp_state
- bio
- status

### `patients`
- id
- organization_id
- linked_user_id nullable
- full_name
- social_name nullable
- birth_date
- email
- phone
- status
- started_at
- ended_at

### `psychologist_patient_relationships`
- id
- organization_id
- psychologist_id
- patient_id
- status
- started_at
- ended_at

### `appointments`
- id
- organization_id
- psychologist_id
- patient_id
- starts_at
- ends_at
- modality
- location_or_link
- status
- cancellation_reason
- administrative_notes

### `therapy_sessions`
- id
- organization_id
- appointment_id
- psychologist_id
- patient_id
- session_date
- duration_minutes
- status

### `clinical_records`
- id
- organization_id
- session_id nullable
- patient_id
- psychologist_id
- demand_summary
- objectives_summary
- evolution_summary
- procedures_summary
- referrals_summary
- plan_summary
- version
- locked_at nullable

### `restricted_records`
- id
- organization_id
- session_id nullable
- patient_id
- psychologist_id
- content
- classification
- version

### `record_versions`
- id
- record_type
- record_id
- version
- snapshot_json
- changed_by
- changed_at
- reason

### `goals`
- id
- organization_id
- patient_id
- psychologist_id
- title
- description
- status
- progress
- visible_to_patient
- starts_at
- target_at

### `exercise_templates`
- id
- organization_id nullable
- owner_psychologist_id nullable
- title
- description
- category
- schema_json
- visibility
- active

### `exercise_assignments`
- id
- organization_id
- exercise_template_id
- psychologist_id
- patient_id
- assigned_at
- due_at
- status
- instructions

### `exercise_responses`
- id
- assignment_id
- patient_id
- response_json
- status
- started_at
- submitted_at
- reviewed_at

### `exercise_feedback`
- id
- assignment_id
- psychologist_id
- feedback
- visible_to_patient
- created_at

### `diary_entries`
- id
- patient_id
- organization_id
- title
- content
- emotion
- intensity
- visibility
- entry_at
- created_at
- updated_at

### `mood_logs`
- id
- patient_id
- organization_id
- mood_score
- intensity
- emotions_json
- note
- visibility
- logged_at

### `content_items`
- id
- organization_id
- owner_psychologist_id
- title
- description
- type
- url_or_path
- category
- active

### `content_assignments`
- id
- content_item_id
- patient_id
- psychologist_id
- assigned_at
- opened_at
- completed_at

### `consents`
- id
- user_id
- consent_type
- document_version
- granted
- granted_at
- revoked_at
- ip_hash
- user_agent_hash

### `notifications`
- id
- user_id
- type
- channel
- payload_safe_json
- scheduled_at
- sent_at
- status

### `audit_logs`
- id
- actor_user_id
- organization_id
- action
- resource_type
- resource_id
- metadata_json
- ip_hash
- created_at

## Índices essenciais

- appointments(psychologist_id, starts_at)
- appointments(patient_id, starts_at)
- clinical_records(patient_id, created_at)
- restricted_records(patient_id, created_at)
- diary_entries(patient_id, entry_at)
- mood_logs(patient_id, logged_at)
- exercise_assignments(patient_id, status, due_at)
- audit_logs(resource_type, resource_id, created_at)

## Regras RLS exemplificadas

### Paciente
Pode ler:
- seu perfil;
- agenda própria;
- exercícios próprios;
- objetivos visíveis;
- diário próprio;
- humor próprio;
- conteúdo atribuído;
- prontuário conforme política de produto validada.

Não pode ler:
- `restricted_records`;
- registros de outros pacientes;
- logs internos;
- dados de outros psicólogos.

### Psicólogo
Pode ler dados do paciente se:
- pertence à organização;
- possui relacionamento;
- recurso pertence ao paciente relacionado.

## Migrações

Toda alteração de schema deve ser versionada.

Nunca editar produção manualmente sem migration.


---


# 07 — API e Contratos

## Estratégia

No MVP, utilizar Supabase/PostgREST e RPCs controladas.

Para operações sensíveis, preferir funções de backend.

## Convenção de resposta

```json
{
  "data": {},
  "error": null,
  "meta": {}
}
```

## Endpoints conceituais

### Pacientes

`POST /patients`
- cria paciente.

`GET /patients`
- lista pacientes do profissional.

`GET /patients/:id`
- retorna visão autorizada.

`PATCH /patients/:id`
- altera dados permitidos.

### Agenda

`POST /appointments`
`GET /appointments`
`PATCH /appointments/:id`
`POST /appointments/:id/cancel`
`POST /appointments/:id/complete`

### Sessões

`POST /sessions`
`GET /sessions/:id`
`POST /sessions/:id/clinical-record`
`POST /sessions/:id/restricted-record`

### Exercícios

`POST /exercise-templates`
`GET /exercise-templates`
`POST /exercise-assignments`
`POST /exercise-assignments/:id/start`
`POST /exercise-assignments/:id/submit`
`POST /exercise-assignments/:id/review`

### Diário

`POST /diary`
`GET /diary`
`PATCH /diary/:id`
`POST /diary/:id/share`
`POST /diary/:id/unshare`

### Humor

`POST /mood`
`GET /mood?from=&to=`

### Objetivos

`POST /goals`
`PATCH /goals/:id`
`GET /goals`

### Exportação

`POST /exports`
Retorna job.

`GET /exports/:id`
Retorna estado.

## Idempotência

Operações importantes devem aceitar `Idempotency-Key`.

Exemplos:
- convite;
- envio de exercício;
- notificação;
- exportação.

## Validação

Usar schema validation no servidor.

Sugestão:
- Zod no frontend/backend;
- constraints no PostgreSQL.

## Paginação

Cursor-based para:
- histórico;
- auditoria;
- feed;
- biblioteca.

## Rate limiting

Aplicar em:
- login;
- convite;
- reset de senha;
- exportação;
- IA futura;
- upload.

## Erros

- 400 validação;
- 401 não autenticado;
- 403 sem autorização;
- 404 recurso inexistente ou ocultado;
- 409 conflito;
- 422 regra de negócio;
- 429 limite;
- 500 falha interna.

Não retornar mensagens que revelem existência de paciente a usuário sem permissão.


---


# 08 — Segurança, LGPD e Compliance

## 1. Classificação dos dados

Informações ligadas à saúde e ao acompanhamento psicológico devem ser tratadas com nível elevado de proteção.

A arquitetura deve assumir que boa parte do conteúdo clínico é dado pessoal sensível.

## 2. Referências regulatórias a validar

- Lei Geral de Proteção de Dados — Lei 13.709/2018.
- Normas e orientações da ANPD.
- Código de Ética Profissional do Psicólogo.
- Resolução CFP nº 01/2009 — registros documentais.
- Resolução CFP nº 13/2022 — psicoterapia.
- Resolução CFP nº 09/2024 — exercício profissional mediado por TDICs.
- Manual Orientativo de Registro e Elaboração de Documentos Psicológicos do CFP, publicado em 2025.
- Lei 13.787/2018, quando aplicável à guarda de prontuários em saúde.

**Observação:** a validação final deve ser feita antes da entrada em produção.

## 3. Mudança importante para atendimento digital

A regulamentação atual do CFP para TDICs exige atenção a contrato, recursos utilizados, proteção do sigilo e responsabilidades do profissional.

O produto deve permitir que o profissional configure e documente:
- modalidade;
- ferramentas;
- termos;
- consentimentos;
- orientações de privacidade.

## 4. Princípios LGPD

- finalidade;
- adequação;
- necessidade;
- livre acesso;
- qualidade;
- transparência;
- segurança;
- prevenção;
- não discriminação;
- responsabilização.

## 5. Bases legais

Não “fixar” uma única base legal no código.

Criar inventário de tratamento com:
- finalidade;
- categoria de dado;
- titular;
- operação;
- base legal validada;
- retenção;
- operador;
- compartilhamentos.

## 6. Privacy by design

### Minimização
Coletar somente dados necessários.

### Default privado
Diário nasce privado.

### Segregação
Registros clínicos e restritos separados.

### Controle
Permissões no banco.

### Transparência
Explicar ao usuário:
- quem vê;
- o que é compartilhado;
- para que serve;
- retenção;
- direitos.

## 7. Controles técnicos

- TLS;
- criptografia em repouso;
- RLS;
- MFA;
- sessão com expiração;
- reautenticação para exportação;
- secrets manager;
- rate limit;
- WAF/anti-abuso quando necessário;
- buckets privados;
- signed URLs curtas;
- logs;
- backup;
- restore test;
- SAST/DAST;
- dependency scanning.

## 8. Segurança de logs

Nunca enviar texto clínico integral para:
- Sentry;
- analytics;
- logs de aplicação;
- ferramentas de suporte;
- data warehouse.

Redigir/sanitizar payloads.

## 9. Analytics

Usar IDs pseudonimizados.

Eventos:
`exercise_submitted`
e não:
`exercise_anxiety_crisis_submitted`.

## 10. Incidente

Criar playbook:

1. detectar;
2. conter;
3. preservar evidências;
4. classificar impacto;
5. identificar titulares;
6. avaliar necessidade de comunicação;
7. corrigir;
8. documentar;
9. post-mortem.

## 11. Retenção

Não implementar prazo único global.

Criar política por classe:
- conta;
- prontuário;
- registro documental;
- auditoria;
- diário;
- exercício;
- arquivos.

A documentação atual do CFP diferencia prazos e regras para tipos de registro; a política final deve ser validada juridicamente e pelo responsável técnico.

## 12. Direitos do titular

Criar área/processo para:
- confirmação;
- acesso;
- correção;
- informação;
- portabilidade quando aplicável;
- revisão;
- eliminação quando aplicável;
- revogação de consentimento quando essa for a base;
- contato de privacidade.

## 13. Fornecedores

Antes de contratar:
- Supabase;
- Vercel;
- e-mail;
- analytics;
- IA;
- WhatsApp;
- storage;
- observabilidade;

avaliar:
- DPA;
- suboperadores;
- região;
- retenção;
- segurança;
- treinamento de modelos;
- transferência internacional;
- exclusão.

## 14. IA

Nenhum conteúdo clínico deve ser enviado a modelo externo sem:
- finalidade definida;
- fornecedor avaliado;
- contrato adequado;
- configuração de retenção;
- minimização;
- autorização/hipótese legal validada;
- supervisão;
- registro.

## 15. Checklist para produção

- [ ] ROPA/inventário de dados
- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] Contrato B2B
- [ ] DPA com fornecedores
- [ ] Política de retenção
- [ ] Processo de direitos do titular
- [ ] Processo de incidentes
- [ ] Revisão jurídica
- [ ] Revisão do responsável técnico
- [ ] Pentest
- [ ] Backup + teste de restore
- [ ] MFA
- [ ] RLS testada
- [ ] Logs sanitizados
- [ ] Monitoramento


---


# 09 — UX/UI e Design System

## 1. Direção

A interface deve transmitir:
- acolhimento;
- discrição;
- confiança;
- simplicidade;
- profissionalismo.

Evitar:
- gamificação infantil;
- excesso de emojis;
- linguagem de diagnóstico;
- estética hospitalar;
- notificações invasivas.

## 2. Navegação do psicólogo

Desktop:
- Dashboard
- Agenda
- Pacientes
- Exercícios
- Biblioteca
- Relatórios
- Configurações

Dentro do paciente:
- Visão geral
- Sessões
- Registros
- Objetivos
- Exercícios
- Diário compartilhado
- Humor
- Conteúdos

## 3. Navegação do paciente

Bottom navigation:
- Início
- Entre sessões
- Diário
- Evolução
- Perfil

## 4. Home do paciente

### Bloco 1
“Como você está hoje?”

### Bloco 2
Próxima sessão.

### Bloco 3
Para você fazer.

### Bloco 4
Objetivos.

### Bloco 5
Conteúdos.

## 5. Home do psicólogo

- agenda de hoje;
- pacientes recentes;
- exercícios recebidos;
- pendências;
- ações rápidas.

## 6. Design tokens

### Tipografia
Fonte sem serifa moderna.

Escala:
- Display
- H1
- H2
- H3
- Body
- Small
- Caption

### Espaçamento
Base de 4px.

### Radius
8, 12 e 16px.

### Elevação
Mínima.

## 7. Cores semânticas

Não atrelar emoção a “vermelho = ruim” de forma agressiva.

Usar cores para:
- sucesso;
- alerta;
- erro;
- informação;
- estados neutros.

## 8. Componentes

- AppShell
- Sidebar
- BottomNav
- PatientCard
- AppointmentCard
- GoalCard
- ExerciseCard
- MoodSelector
- Timeline
- EmptyState
- Modal
- Drawer
- PrivacyBadge
- VisibilitySelector
- AuditIndicator
- FileUploader
- Skeleton
- Toast

## 9. Microcopy

Preferir:
“Compartilhar com meu psicólogo”

Em vez de:
“Liberar acesso”.

Preferir:
“Registro privado”

Em vez de:
“Registro secreto”.

## 10. Estados vazios

Exemplo:
“Você ainda não tem exercícios pendentes.”

CTA:
“Ver conteúdos”

## 11. Acessibilidade

- contraste AA;
- navegação por teclado;
- labels;
- foco visível;
- não usar apenas cor;
- áreas de toque adequadas;
- suporte a leitores de tela.


---


# 10 — IA e Automações

## 1. Princípio

A IA entra depois que o produto básico for confiável.

O sistema não deve depender de IA para:
- autenticação;
- autorização;
- prontuário;
- agenda;
- execução de exercícios;
- privacidade.

## 2. Casos de uso permitidos — fase futura

### Assistente do psicólogo
- estruturar texto ditado;
- resumir registros selecionados;
- sugerir tópicos para revisão;
- encontrar exercícios relevantes;
- melhorar organização de notas;
- busca semântica.

### Administrativo
- mensagens;
- lembretes;
- organização de agenda;
- FAQ do sistema.

### Paciente
- ajudar a estruturar um diário;
- transformar texto livre em categorias escolhidas pelo usuário;
- perguntas reflexivas de baixa criticidade;
- navegação.

## 3. Casos proibidos ou de alto risco

Não lançar sem governança específica:
- diagnóstico;
- score de risco clínico apresentado como verdade;
- recomendação de medicamento;
- recomendação de interrupção de tratamento;
- decisão clínica automática;
- avaliação psicológica automática;
- “terapia autônoma”;
- intervenção de crise baseada apenas em LLM.

## 4. Arquitetura

```text
App
 |
 v
AI Gateway
 |
 +-- policy
 +-- redaction
 +-- consent/context checks
 +-- provider routing
 +-- prompt version
 +-- output validation
 |
 v
LLM Provider
```

## 5. AI Gateway

Responsável por:
- impedir chamada direta do frontend;
- selecionar contexto mínimo;
- mascarar identificadores;
- versionar prompt;
- registrar uso;
- aplicar limites;
- validar saída.

## 6. Dados

Nunca enviar banco inteiro.

Usar:
- seleção explícita;
- contexto mínimo;
- janela temporal;
- campos necessários.

## 7. Human in the loop

Toda sugestão clínica ao profissional deve exigir:
- revisão;
- edição;
- aceite explícito.

Nunca gravar sugestão diretamente no prontuário como se fosse do psicólogo.

## 8. Automações sem IA

Priorizar primeiro:
- lembrete de sessão;
- atividade pendente;
- aviso de exercício entregue;
- follow-up administrativo;
- expiração de convite;
- limpeza de arquivos.

## 9. Versionamento

Tabela futura:
`ai_runs`

Campos:
- id
- user_id
- feature
- provider
- model
- prompt_version
- input_classification
- output_status
- latency
- tokens
- created_at

Não persistir prompt clínico integral por padrão.


---


# 11 — Backlog e Roadmap

## Fase 0 — Fundação

### P0
- projeto Next.js;
- Supabase;
- migrations;
- ambientes;
- autenticação;
- organização;
- perfis;
- CI;
- logging;
- RLS base.

## Fase 1 — Pacientes e agenda

### P0
- cadastro;
- convite;
- relação;
- lista;
- perfil;
- agenda;
- status;
- calendário.

## Fase 2 — Sessões e registros

### P0
- sessão;
- prontuário;
- registro restrito;
- versionamento;
- auditoria;
- timeline.

## Fase 3 — Entre sessões

### P0
- biblioteca de exercícios;
- construtor;
- atribuição;
- respostas;
- diário;
- humor;
- objetivos.

## Fase 4 — Conteúdo e dashboard

### P1
- biblioteca;
- envio;
- dashboard profissional;
- dashboard paciente;
- gráficos.

## Fase 5 — Segurança de produção

### P0
- pentest;
- MFA;
- políticas;
- backups;
- restore;
- retenção;
- incidentes;
- hardening.

## Fase 6 — Beta

### P0
- 5–10 psicólogos;
- feedback;
- bugs;
- UX;
- métricas;
- suporte.

## Fase 7 — Monetização

### P1
- Stripe/Pagar.me/Asaas, após decisão;
- planos;
- cobrança;
- trial;
- invoices.

## Fase 8 — IA

### P2
- gateway;
- sumarização;
- busca;
- sugestão de exercícios.

## Roadmap sugerido por releases

### Release 0.1
Auth + pacientes + agenda.

### Release 0.2
Sessões + registros.

### Release 0.3
Exercícios + diário + humor.

### Release 0.4
Objetivos + conteúdo + dashboards.

### Release 0.5
Segurança + beta fechado.

### Release 1.0
Produção comercial.

## Priorização MoSCoW

### Must
- auth;
- pacientes;
- agenda;
- sessões;
- registros;
- exercícios;
- diário;
- humor;
- objetivos;
- RLS;
- auditoria;
- LGPD.

### Should
- conteúdo;
- dashboards;
- exportação;
- MFA;
- notificações.

### Could
- WhatsApp;
- IA;
- app nativo;
- videoconferência.

### Won't — MVP
- marketplace;
- diagnóstico;
- prescrição;
- testes automatizados.


---


# 12 — QA e Critérios de Aceite

## Estratégia

- unit tests;
- integration tests;
- E2E;
- security tests;
- RLS tests;
- accessibility;
- backup restore.

## Critérios globais

### CA-01
Usuário não autenticado não acessa área interna.

### CA-02
Paciente A nunca lê dado do paciente B.

### CA-03
Psicólogo A nunca lê paciente do psicólogo B fora de relação autorizada.

### CA-04
Paciente nunca lê `restricted_records`.

### CA-05
Frontend manipulado não contorna RLS.

### CA-06
URL assinada expira.

### CA-07
Exportação gera auditoria.

### CA-08
Alteração de registro mantém versão.

### CA-09
Diário privado não aparece em API do psicólogo.

### CA-10
Notificação não contém conteúdo clínico sensível.

## Cenários E2E

### Psicólogo cadastra paciente
Given psicólogo autenticado  
When cadastra paciente válido  
Then paciente aparece na carteira  
And audit log é criado.

### Paciente aceita convite
Given convite válido  
When paciente cria conta  
Then conta é vinculada  
And token não pode ser reutilizado.

### Exercício
Given exercício atribuído  
When paciente envia  
Then resposta fica disponível ao psicólogo responsável  
And outro profissional não relacionado recebe 403/404.

### Diário privado
Given entrada privada  
When psicólogo consulta feed  
Then entrada não é retornada.

### Diário compartilhado
Given entrada compartilhada  
When psicólogo responsável consulta  
Then entrada é retornada.

## Segurança

Testar:
- IDOR;
- auth bypass;
- SQL injection;
- XSS;
- CSRF quando aplicável;
- upload malicioso;
- signed URLs;
- rate limiting;
- session fixation;
- privilege escalation;
- enumeration.

## Definition of Done

Uma feature só está concluída quando:
- requisito atendido;
- UX implementada;
- validação;
- tratamento de erro;
- loading;
- autorização;
- testes;
- auditoria quando aplicável;
- analytics seguro;
- documentação atualizada.


---


# 13 — DevOps e Observabilidade

## Repositórios

Inicialmente monorepo:

```text
/apps/web
/packages/ui
/packages/config
/supabase/migrations
/docs
```

## Branches

- `main` produção;
- feature branches curtas;
- PR obrigatório.

## CI

Em cada PR:
- lint;
- typecheck;
- unit;
- integration;
- migrations check;
- dependency scan;
- build.

## CD

### Staging
Deploy automático após merge conforme política.

### Production
Deploy controlado.

## Segredos

Nunca:
- `.env` no Git;
- service key no frontend;
- token em log.

## Observabilidade

### Métricas
- request rate;
- error rate;
- latency;
- auth failures;
- job failures;
- notification failures.

### Produto
Eventos sem dado clínico:
- patient_created
- appointment_created
- exercise_assigned
- exercise_submitted
- diary_entry_created
- mood_logged

## Sentry

Aplicar beforeSend/redaction.

Não enviar:
- texto de diário;
- prontuário;
- respostas clínicas;
- nome completo;
- telefone;
- e-mail quando desnecessário.

## Backups

- automatizados;
- retenção definida;
- criptografados;
- teste periódico de recuperação.

## Disaster Recovery

Definir:
- RPO;
- RTO;
- responsáveis;
- processo;
- teste.

## Feature flags

Mudanças de risco alto devem ser ativáveis por flag.


---


# 14 — Métricas e Analytics

## Aquisição

- novos psicólogos;
- origem;
- CAC futuro;
- conversão landing → cadastro.

## Ativação

Definição sugerida:
psicólogo cadastra primeiro paciente + primeira sessão + primeira atividade.

Métricas:
- activation rate;
- tempo até primeiro paciente;
- tempo até primeira atividade.

## Engajamento profissional

- WAU/MAU;
- sessões registradas;
- exercícios atribuídos;
- pacientes ativos.

## Engajamento paciente

- DAU/WAU;
- exercícios iniciados;
- conclusão;
- registros de humor;
- diário;
- conteúdos abertos.

## Retenção

- D7;
- D30;
- M3;
- churn por psicólogo.

## Qualidade

- crash-free sessions;
- error rate;
- P95;
- tickets;
- NPS/CSAT.

## North Star

Pacientes com interação estruturada entre sessões / pacientes com sessões recorrentes.

## Privacidade de analytics

Não coletar:
- texto;
- diagnóstico;
- tema clínico;
- conteúdo de exercício;
- conteúdo de diário.

Usar eventos comportamentais genéricos.


---


# 15 — Riscos e Decisões em Aberto

## Riscos

### R1 — Vazamento de conteúdo clínico
Impacto: crítico.  
Mitigação: RLS, segregação, testes, logs sanitizados, pentest.

### R2 — Confusão entre prontuário e nota privada
Impacto: alto.  
Mitigação: modelos de dados separados e validação profissional/jurídica.

### R3 — IA interpretada como terapia
Impacto: alto.  
Mitigação: escopo, linguagem, human-in-the-loop, feature flags.

### R4 — Notificação revelar informação
Impacto: alto.  
Mitigação: push genérico.

### R5 — Analytics capturar dados sensíveis
Impacto: alto.  
Mitigação: taxonomia segura.

### R6 — Exclusão apagar registro obrigatório
Impacto: alto.  
Mitigação: política de retenção por classe.

### R7 — Multi-tenant mal implementado
Impacto: crítico.  
Mitigação: RLS + testes de isolamento.

### R8 — Promessa de alerta de crise
Impacto: crítico.  
Mitigação: não prometer monitoramento 24/7 sem operação real.

## Decisões abertas

### D1 — Nome do produto
A definir.

### D2 — Público do MVP
Recomendação: profissionais individuais + pacientes adultos.

### D3 — Prontuário formal
Decidir nível de profundidade e validação regulatória.

### D4 — Modelo de monetização
Sugestões:
- Basic;
- Pro;
- Clínica.

### D5 — Região de dados
Validar fornecedores e transferência internacional.

### D6 — Canal de notificações
- push;
- e-mail;
- WhatsApp.

### D7 — Videoconferência
Integrar serviço externo ou não.

### D8 — Menores
Deixar bloqueado até versão posterior.

### D9 — IA
Só após MVP e governança.

## ADRs recomendadas

Criar:
- ADR-001 Multi-tenancy
- ADR-002 RLS
- ADR-003 Separação de registros
- ADR-004 Storage privado
- ADR-005 Analytics sem PHI
- ADR-006 AI Gateway


---


# 16 — Glossário

**Paciente:** usuário beneficiário do acompanhamento.

**Psicólogo:** profissional com acesso clínico autorizado.

**Organização:** tenant do sistema.

**Prontuário:** registro estruturado do acompanhamento sujeito às regras profissionais e de acesso aplicáveis.

**Registro documental/restrito:** registro profissional de acesso restrito, conforme natureza e regra aplicável.

**Exercício:** atividade criada pelo profissional.

**Atribuição:** vínculo entre exercício e paciente.

**Diário:** registro produzido pelo paciente, privado por padrão.

**Mood log:** registro breve de humor/emoções.

**Objetivo:** meta de acompanhamento definida dentro do processo.

**RLS:** Row Level Security.

**MFA:** autenticação multifator.

**Audit log:** trilha de ações relevantes.

**Tenant:** organização isolada logicamente no SaaS.

**Dado pessoal sensível:** categoria de dado com proteção reforçada pela LGPD, incluindo dados referentes à saúde.

**TDIC:** Tecnologias Digitais da Informação e da Comunicação.

**Human in the loop:** exigência de revisão humana antes de decisão/uso.

**AI Gateway:** camada central que controla uso de modelos de IA.
