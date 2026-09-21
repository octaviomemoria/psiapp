# 18 — Próximos passos (após a paridade de funcionalidades)

Atualizado em 21/09/2026. Este documento registra o que foi entregue nas quatro fases de paridade com o aplicativo
de referência, o que **precisa ser feito antes de usar em produção** e o que ainda está pendente.

## 1. O que foi entregue

| Fase | Entrega | Migration |
|---|---|---|
| 1. Cadastro de pacientes | Formulário único de cadastro e edição (pessoais, endereço com ViaCEP, dados adicionais, responsável, tags), grupos gerenciáveis, máscaras e validação de CPF/telefone/CEP, idade calculada | `06_patient_registration_fields.sql` |
| 2. Agenda | Calendário mês/semana/dia, sessões por dia, salas (cadastro e grade de ocupação), recorrência, aviso de conflito, solicitações de agendamento e página pública `/agendar/[slug]` | `07_agenda_rooms_requests.sql` |
| 3. Relatórios | Relatórios de agendamentos, pagamento de sessões e anotações, aba Financeiro no prontuário, exportação CSV, financeiro unificado | nenhuma |
| 4. Anamnese e evolução | Cinco modelos padrão, editor de modelos, importação pelo grupo do paciente, preenchimento pelo psicólogo ou pelo paciente (link `/anamnese/[token]`), ficha de evolução imprimível, anamnese no export LGPD | `09_anamnesis.sql` |

A numeração pulou a `08`, que já existia (`08_guard_profile_roles.sql`, trava de papéis). As migrations devem ser
aplicadas **em ordem crescente** no SQL Editor do Supabase: `04`, `05`, `06`, `07`, `08`, `09`. Todas são idempotentes.

## 2. Antes de usar em produção (obrigatório)

### 2.1 Aplicar e validar as migrations
As migrations `06`, `07` e `09` **nunca foram executadas em um PostgreSQL** durante o desenvolvimento (não havia banco
disponível). Foram validadas apenas por leitura e pelos testes do lado do aplicativo, com um servidor de mentira das
funções públicas. Faça primeiro em um projeto Supabase de teste:

- [ ] Aplicar `04` → `09` em sequência e conferir que nenhuma dá erro.
- [ ] Conferir que as tabelas novas existem com RLS ligado: `patient_groups`, `clinic_rooms`, `booking_settings`,
      `booking_requests`, `anamnesis_templates`, `anamnesis_responses`.
- [ ] Conferir que as seis funções públicas existem e são executáveis por `anon`: `get_public_booking_info`,
      `get_public_busy_slots`, `create_booking_request`, `get_anamnesis_by_token`, `submit_anamnesis_by_token`.
- [ ] Conferir a publicação em tempo real (`supabase_realtime`) para `booking_requests` e `anamnesis_responses`.

### 2.2 Testes de segurança com dois usuários (RLS)
Criar dois psicólogos (A e B) e um visitante sem login, e verificar:

- [ ] B não enxerga pacientes, grupos, salas, solicitações, anamneses nem modelos de A.
- [ ] Sem login (`anon`), **nenhuma** tabela nova pode ser lida ou gravada diretamente; só as funções públicas respondem.
- [ ] `get_public_busy_slots` devolve apenas intervalos, nunca nomes ou dados de pacientes.
- [ ] `create_booking_request` recusa: horário fora da janela, ocupado, sem antecedência mínima, além do limite de
      dias, e o 4º pedido pendente do mesmo e-mail.
- [ ] `submit_anamnesis_by_token` funciona uma única vez; depois o token não serve mais; um token vencido não grava.
- [ ] Um token de anamnese de um paciente não dá acesso a nada de outro paciente.

### 2.3 Roteiro manual no ambiente real
- [ ] Cadastrar paciente com todos os campos, incluindo menor com responsável; editar e reabrir.
- [ ] Criar sala, agendar com recorrência semanal e conferir o conflito de horário e de sala.
- [ ] Ativar o link em "Agendamento online", abrir `/agendar/seu-link` em janela anônima, solicitar, aprovar na agenda.
- [ ] Criar um grupo, vincular a um modelo de anamnese, importar no prontuário, enviar o link ao paciente, preencher
      e conferir que a resposta aparece para o psicólogo.
- [ ] Conferir cada relatório contra dados conhecidos e o CSV aberto no Excel (acentos e vírgula decimal).
- [ ] Imprimir a ficha de evolução e a anamnese (navegador e PDF).

## 3. Pendências técnicas conhecidas

Ordenadas por importância.

1. **Salas do gerente não são gravadas no banco.** As salas cadastradas no painel do gerente ficam só na tela
   (no papel de gerente não há conta de psicólogo para ser dono da linha). Só as salas do psicólogo logado persistem.
   A política RLS de `clinic_rooms` já prevê o gerente da clínica (`clinics.manager_profile_id`); falta ligar o painel
   do gerente a essa gravação.
2. **Aprovar solicitação não avisa o paciente sozinho.** Hoje o app oferece o botão "Avisar no WhatsApp". Falta o envio
   automático (e-mail/WhatsApp) na aprovação e na recusa, usando `src/lib/notifications/dispatcher.ts`.
3. **Agendamento não está ligado à sessão clínica.** `TherapySession.appointment_id` existe mas nada o preenche.
   Ao concluir um atendimento, oferecer "Registrar sessão" já vinculado ao agendamento.
4. **Edição de série recorrente.** Cada ocorrência é independente; não há "aplicar a todas as próximas".
5. **Semana do calendário:** atendimentos simultâneos ficam sobrepostos visualmente (o conflito é avisado, mas o
   desenho não os coloca lado a lado).
6. **Limite de abuso do link público depende só do banco** (3 pedidos pendentes por e-mail, 100 por profissional).
   Não há limite por IP. Avaliar Cloudflare/Turnstile ou limitação na borda se houver abuso.
7. **Fuso horário do agendamento online fixo em Brasília.** A grade e a validação usam UTC-3 (sem horário de verão
   desde 2019). Se o Brasil voltar a ter horário de verão, revisar `BR_OFFSET_MS` em `schedule-utils.ts` e a função
   `create_booking_request` (que já usa o fuso `America/Sao_Paulo` no banco).
8. **Onboarding do paciente ainda é simulação.** `src/app/onboarding/[token]/page.tsx` guarda a "breve anamnese" só em
   estado local e não grava nada. A anamnese real é o link `/anamnese/[token]`; decidir se o onboarding passa a
   redirecionar para ela ou é removido.
9. **`Patient.anamnesis_completed`** continua sem coluna nem uso; o estado real vem das respostas em
   `anamnesis_responses`. Remover o campo do tipo ou derivá-lo.
10. **`src/lib/billing/export-financial.ts`** não é usado por nenhuma tela (o novo `src/lib/reports/csv.ts` o substituiu
    nos relatórios). Remover ou consolidar.
11. **Conteúdo dos modelos de anamnese** (`src/lib/anamnesis/default-templates.ts`) foi escrito como ponto de partida
    e **precisa de revisão clínica** por um profissional antes de ser oferecido a pacientes.

## 4. Funcionalidades ainda não feitas

- **Integrações PsicoMarketing e BuscaPsico:** não há API pública documentada conhecida. Retomar quando houver
  documentação e credenciais. A estrutura de solicitações (`booking_requests`) e o `slug` público já servem de base.
- **Notificação ao psicólogo** quando chegar uma solicitação de agendamento ou uma anamnese for concluída (hoje só
  aparece ao abrir a tela; o tempo real atualiza os dados, mas não avisa).
- **Lembretes automáticos de sessão** para o responsável, respeitando `guardian_send_reminders` (o campo é gravado,
  mas nenhum envio o consulta ainda). Idem `guardian_allow_billing_contact` nos e-mails de cobrança.
- **Anamnese:** anexar arquivos, assinatura/aceite do paciente e histórico de versões de uma resposta editada.
- **Relatórios:** exportação em PDF, comparativo entre períodos e gráfico de evolução de escalas na ficha impressa.
- **Auditoria:** registrar no `clinical_audit_log` (migration `02`) a leitura e o export de anamneses, como já é feito
  para outros dados clínicos.

## 5. Decisões de produto e LGPD em aberto

- **CPF/RG em texto simples** (decisão tomada): protegidos por RLS. Reavaliar a criptografia em repouso se houver
  exigência contratual ou auditoria (`src/lib/crypto/encryption.ts` existe). Criptografar impede buscar por CPF.
- **Anamnese contém dado de saúde (dado sensível):** decidir se as respostas devem ser criptografadas em repouso e por
  quanto tempo são retidas após o encerramento do paciente (Resolução CFP nº 001/2009 pede guarda mínima de 5 anos).
- **Texto de consentimento** da página pública de anamnese e da de agendamento: revisar com o jurídico e com a Política
  de Privacidade (`/privacidade`).
- **Tokens de anamnese:** validade fixa em 30 dias e uso único. Confirmar se esses valores atendem à prática clínica.

## 6. Como verificar o projeto localmente

```bash
npm test          # testes unitários (sem banco)
npm run lint      # ESLint com zero avisos (o CI exige)
npx tsc --noEmit  # verificação de tipos
npm run build     # build de produção
```

Observação: `npm run build` e `npm run dev` compartilham a pasta `.next`. Se um deles quebrar o outro (CSS sumindo ou
404 em rotas), pare o servidor, apague `.next` e inicie de novo.
