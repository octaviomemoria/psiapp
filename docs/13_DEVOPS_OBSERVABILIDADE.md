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
