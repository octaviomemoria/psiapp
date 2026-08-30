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
