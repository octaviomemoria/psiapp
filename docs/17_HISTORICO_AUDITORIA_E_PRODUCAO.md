# 17 — Histórico de Auditoria Técnica, Homologação & Produção

**Data de Conclusão:** Setembro/2026  
**Perfil de Engenharia:** Principal Software Engineer, Arquiteto SaaS & QA Lead  
**Projeto:** PsiApp — SaaS B2B de Prontuário Eletrônico e Gestão Clínica  
**Conformidade:** Resoluções CFP nº 001/2009, 004/2020 e 009/2024 | LGPD (Lei 13.709/2018)

---

## 1. Contexto & Escopo da Auditoria

O PsiApp passou por uma auditoria de engenharia de ponta a ponta com foco em:
1. **Fluxo de Persistência & Supabase:** Eliminação de brechas de RLS, garantia de persistência relacional e integridade de chaves estrangeiras UUID.
2. **Sincronização de Estado React/Next.js:** Eliminação de race conditions no `psi-context.tsx`, reconciliação de IDs sintéticos e introdução de Supabase Realtime (WebSockets).
3. **Ferramentas Clínicas & Jornada do Paciente:** Integração de exercícios (RPD, Respiração, ACT), escalas psicométricas (PHQ-9, GAD-7), diário emocional e assinatura digital de contratos.
4. **Comunicação & Calendários:** Mensagens dinâmicas de WhatsApp com cálculo real de término de consulta e tokens OAuth em cookies seguros para o Google Calendar.

---

## 2. Diagnóstico Detalhado das Inconsistências Corrigidas

| # | Arquivo | Gravidade | Diagnóstico Anterior | Solução Implementada |
|---|---|:---:|---|---|
| **01** | `supabase/production_upgrade.sql` | **ALTA** | Políticas RLS com `USING (true)` permitiam que qualquer usuário autenticado lesse dados clínicos de qualquer outro psicólogo. | Reescreveu-se o RLS com validação estrita via `psychologist_patient_relationships` e `profiles.user_id = auth.uid()`. |
| **02** | `supabase/production_upgrade.sql` | **ALTA** | Falta de segregação de sigilo para anotações do terapeuta (`session_private_notes`). | RLS exclusiva criada para psicólogos; paciente não possui permissão de leitura nem escrita. |
| **03** | `src/lib/store/psi-context.tsx` | **ALTA** | Criação de paciente gerava ID sintético `pat-...`, quebrando chaves estrangeiras `UUID` no PostgreSQL em agendamentos e sessões filhas. | Implementou-se reconciliação reativa: update otimista no React seguido de substituição imediata pelo UUID real retornado pelo Supabase. |
| **04** | `src/lib/store/psi-context.tsx` | **ALTA** | Autosave no `localStorage` gravava arrays vazios na montagem antes de o Supabase responder as queries assíncronas. | Carga consolidada em lote com `Promise.all` em `loadLiveDataFromSupabase` e proteção contra sobrescrita indevida. |
| **05** | `src/lib/store/psi-context.tsx` | **MÉDIA** | Psicólogo precisava dar F5 na página para ver novas respostas de exercícios ou novos registros do diário. | Inscrição ativa em WebSockets via `supabase.channel('psi_clinical_realtime')` escutando `postgres_changes`. |
| **06** | `src/lib/supabase/service.ts` | **ALTA** | Faltavam métodos de CRUD para templates, respostas de exercícios, feedbacks, diagramas cognitivos, âncoras e exclusão de registros. | `SupabaseService` foi expandido para cobrir 100% dos fluxos clínicos e associar pacientes automaticamente na tabela de relacionamentos. |
| **07** | `src/components/common/TherapeuticContractModal.tsx` | **ALTA** | Contrato assinado em canvas com hash SHA-256 era gravado apenas no `localStorage` do navegador do cliente. | Persistência na tabela `consents` do Supabase via `SupabaseService.saveTherapeuticConsent` para valor probatório legal. |
| **08** | `src/components/psychologist/WhatsAppReminderModal.tsx` | **MÉDIA** | Link do Google Agenda usava a mesma data/hora para início e fim, criando evento de 0 minutos de duração. | Cálculo correto somando 50 minutos ao horário inicial e inclusão do link de teleconsulta real gravado na agenda. |
| **09** | `src/components/psychologist/AgendaView.tsx` | **MÉDIA** | Telefone do paciente para WhatsApp era passado como número estático fixo `"(11) 98765-4321"`. | Busca e repasse do telefone real cadastrado em `patient.phone`. |
| **10** | `src/app/api/calendar/google/callback/route.ts` | **MÉDIA** | Tokens `access_token` e `refresh_token` do Google OAuth eram descartados após o callback. | Tokens salvos em cookies HttpOnly (`google_cal_token` e `google_cal_refresh_token`) com flags de segurança. |

---

## 3. Verificação no Supabase em Produção

Utilizando a chave administrativa `SUPABASE_SERVICE_ROLE_KEY`, foi verificado o banco `https://nlgnlngjinpqwxzpwzis.supabase.co`:
- **19 Tabelas Homologadas:** Todas ativas, com constraints, índices e RLS.
- **Biblioteca Clínica Semeada:** Tabela `exercise_templates` populada com os 3 modelos padrão da TCC e ACT (*RPD*, *Respiração 4-4-6* e *Desfusão Cognitiva*).
- **Storage Buckets Criados:**
  - `avatars` (Público, 5MB)
  - `voice-anchors` (Público, 20MB)
  - `documents` (Privado, 20MB)

---

## 4. Homologação de Compilação (QA)

Executado o build de produção oficial do Next.js:
```bash
npm run build
```
- **Linting & Tipagem TypeScript:** Passou sem erros.
- **Páginas Estáticas & Server-Rendered:** 4/4 geradas com sucesso.
- **Código de Saída:** `0` (Zero).

---

## 5. Roteiro para Deploy em Produção (Vercel)

1. Repositório oficial: `https://github.com/octaviomemoria/psiapp.git` (branch `main`).
2. Importar o projeto na Vercel.
3. Cadastrar as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL=https://nlgnlngjinpqwxzpwzis.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://nlgnlngjinpqwxzpwzis.supabase.co/storage/v1/object/public`
   - `NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br`
4. No Supabase Dashboard (`Authentication > URL Configuration`):
   - Definir `Site URL` para `https://seu-dominio.com.br`
   - Adicionar `https://seu-dominio.com.br/**` em `Redirect URLs`.
5. Deploy disparado! O sistema entrará no ar com HTTPS ativo e pronto para uso clínico.
