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

## 5. Supabase & Camada de Persistência

### Auth & Sessão
- Autenticação por email/senha com provisionamento automático de perfil (`profiles`) e psicólogo (`psychologists`);
- **Trigger `on_auth_user_auto_confirm`**: Auto-confirmação instantânea de e-mails no `auth.users` para onboarding imediato de psicólogos e pacientes;
- Token OAuth do Google Calendar armazenado em cookies HttpOnly seguros (`google_cal_token` e `google_cal_refresh_token`).

### PostgreSQL & RLS (Row Level Security)
- 19 tabelas relacionais com PKs UUID (`uuid_generate_v4()`);
- Chaves estrangeiras com regras estritas de integridade referencial (`ON DELETE CASCADE` / `SET NULL`);
- Isolamento multi-tenant real garantido via `psychologist_patient_relationships` e checagem de perfil (`prof.user_id = auth.uid()`);
- Segregação de sigilo para `session_private_notes` (invisível para pacientes);
- Proteção de `diary_entries`: leitura restrita ao paciente, liberada ao psicólogo apenas quando `is_shared_with_psychologist = true`.

### Supabase Realtime (WebSockets)
- O cliente React (`psi-context.tsx`) mantém canal ativo via `supabase.channel('psi_clinical_realtime')`;
- Escuta eventos de mutação (`postgres_changes`) nas tabelas críticas:
  - `psychometric_results` (novas escalas preenchidas);
  - `diary_entries` (novos registros emocionais);
  - `assigned_exercises` (exercícios concluídos);
  - `appointments` (status de agenda e pagamentos);
- Dispara revalidação automática de dados clínicos sem necessidade de F5 pelo profissional.

### Storage Buckets (Provisionados)
1. `avatars` (Público, limite de 5MB): Fotos de perfil de psicólogos e pacientes.
2. `voice-anchors` (Público, limite de 20MB): Áudios terapêuticos de desescalonamento e relaxamento.
3. `documents` (Privado, limite de 20MB): Contratos terapêuticos, termos assinados e laudos clínicos.

## 6. Arquitetura de Sincronização de Calendários

A plataforma oferece 3 modalidades sincronizadas de agenda sem custo adicional:

1. **Feed iCal Contínuo (`/api/calendar/feed`):**
   - Implementado como Route Handler no Next.js App Router com diretiva `export const dynamic = 'force-dynamic'`;
   - Responde com `Content-Type: text/calendar; charset=utf-8` e headers de cache nulo (`no-cache, no-store, must-revalidate`);
   - Gera payload RFC 5545 formatando datas e horários em UTC (`YYYYMMDDTHHmmssZ`);
   - Suporta protocolo `webcal://` para abertura nativa de inscrição no app Calendário do iPhone (iOS), iPad, macOS, Apple Watch e Google Calendar.
2. **Atalhos Rápidos de 1-Clique na UI:**
   - Link dinâmico para Google Calendar (`https://calendar.google.com/calendar/render?action=TEMPLATE...`);
   - Download de arquivo `.ics` individual para importação instantânea em qualquer dispositivo.
3. **Módulo Google Calendar API (OAuth 2.0):**
   - Endpoints `/api/calendar/google/auth` (redirecionamento com escopo `https://www.googleapis.com/auth/calendar.events`), `/callback` (troca de código por access/refresh tokens) e `/sync` (criação bidirecional de eventos).

## 7. Arquitetura do Copiloto Clínico de IA

```text
[LiveSessionModal / Prontuário]
         │
         ▼
[AIService (lib/ai/ai-service.ts)]
         │
         ├── Contextualização: Abordagem (TCC, ACT, Psicanálise)
         ├── Anonimização: Apenas primeiro nome e notas do relato clínico
         ├── Prompt Estruturado: Diretrizes SOAP internacionais
         │
         ▼
[Google Gemini / LLM Provider]
         │
         ▼
[Minuta SOAP Pré-Preenchida na UI]
         │
         ▼
[Revisão, Edição e Validação pelo Psicólogo (Human-in-the-Loop)]
         │
         ▼
[Gravação Oficial no Prontuário (therapy_sessions)]
```

## 8. Reconciliação Reativa de IDs (UUID PostgreSQL vs Frontend)

Para evitar erros de sintaxe de UUID (`invalid input syntax for type uuid`) e manter a fluidez da UI:
1. Ao adicionar um paciente no frontend, um ID temporário otimista é gerado para resposta imediata da interface;
2. O `SupabaseService.insertPatient` executa assincronamente no Supabase, vinculando o paciente à coluna `psychologist_id` e/ou relação em `psychologist_patient_relationships`;
3. Assim que o PostgreSQL retorna o registro com o UUID real, o estado do React reconcilia as entidades substituindo o ID temporário pelo UUID definitivo;
4. Todas as criações subsequentes de sessões, agendamentos e exercícios herdam o UUID válido garantindo integridade referencial.

## 9. Assinatura Digital & Consentimento Criptográfico (LGPD)

- No `TherapeuticContractModal.tsx`, a assinatura do paciente é capturada em Canvas HTML5;
- O payload de integridade (`paciente + psicólogo + valor + timestamp + assinatura`) é processado via Web Crypto API nativa gerando um hash **SHA-256**;
- O hash, data e versão dos termos (`CFP-LGPD-2026.1`) são gravados na tabela `consents` do Supabase para valor probatório perante auditorias éticas e jurídicas.

## 10. Ambientes & Deploy

- **Local:** `http://localhost:3000` conectado ao Supabase Cloud com fallback para LocalStorage em modo demo;
- **Production (Vercel):** `https://psiappgestao.vercel.app` com HTTPS/TLS obrigatório, compressão de assets e Edge CDN.

## 11. Estratégia Multi-Tenant & Clínicas

- O modelo suporta tanto o psicólogo autônomo individual quanto clínicas com múltiplos profissionais e salas através da tabela `clinics`;
- Cada relacionamento de atendimento é registrado de forma explícita na tabela `psychologist_patient_relationships` e na coluna `patients.psychologist_id`, possibilitando transferências de prontuário e supervisão autorizada.
