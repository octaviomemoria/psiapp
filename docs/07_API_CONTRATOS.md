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
