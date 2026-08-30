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
