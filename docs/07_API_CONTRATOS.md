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

## Endpoints Implementados (Next.js App Router)

### Sincronização & Integração de Calendário

#### `GET /api/calendar/feed`
- **Descrição:** Retorna o feed de calendário no formato padrão mundial iCalendar (RFC 5545).
- **Parâmetros de Query:** `?token=<user_id_or_psychologist_id>`
- **Headers de Resposta:**
  ```http
  Content-Type: text/calendar; charset=utf-8
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0, s-maxage=0
  Pragma: no-cache
  Expires: 0
  Content-Disposition: inline; filename="psiapp-agenda.ics"
  ```
- **Compatibilidade:** Nativo para iPhone / iPad / Mac via `webcal://`, Apple Watch, Google Agenda ("Do URL") e Microsoft Outlook.

#### `GET /api/calendar/google/auth`
- **Descrição:** Inicia o fluxo de autorização OAuth 2.0 do Google Calendar.
- **Redirecionamento:** `https://accounts.google.com/o/oauth2/v2/auth` com escopo `https://www.googleapis.com/auth/calendar.events` e `access_type=offline`.

#### `GET /api/calendar/google/callback`
- **Descrição:** Recebe o `code` retornado pelo Google, troca por access/refresh tokens e grava em cookies seguros `HttpOnly` (`google_cal_token`).

#### `POST /api/calendar/google/sync`
- **Descrição:** Sincroniza consultas criadas ou alteradas no PsiApp diretamente na API oficial do Google Calendar.
- **Payload:**
  ```json
  {
    "appointmentId": "uuid",
    "summary": "Sessão de Psicoterapia — Paciente",
    "startDateTime": "2026-09-05T14:00:00Z",
    "endDateTime": "2026-09-05T14:50:00Z",
    "description": "Atendimento clínico via PsiApp",
    "meetUrl": "https://meet.google.com/..."
  }
  ```

---

## Contratos de Camada de Serviço (`SupabaseService`)

### Pacientes & Carteira Clínica
- `getPatients(psychologistId?: string): Promise<Patient[]>` — Retorna pacientes vinculados ao psicólogo autenticado.
- `insertPatient(patientData): Promise<Patient | null>` — Cadastra paciente com isolamento por `psychologist_id`.
- `updatePatient(patientId, updates): Promise<boolean>` — Atualiza dados cadastrais.

### Sessões & Prontuário SOAP
- `getSessions(psychologistId, patientId?): Promise<TherapySession[]>` — Busca histórico de sessões.
- `insertSession(sessionData, privateNotes?): Promise<TherapySession | null>` — Salva prontuário SOAP e anotações privativas em transação atômica.

### Exercícios & Engajamento
- `assignExercise(assignment): Promise<AssignedExercise | null>` — Prescreve atividade com prazo.
- `submitExerciseAnswer(answer): Promise<boolean>` — Salva respostas do paciente.
- `reviewExercise(feedback): Promise<boolean>` — Psicólogo registra feedback clínico.

### Diário & Humor
- `getDiaryEntries(patientId, isPsychologist): Promise<DiaryEntry[]>` — Aplica filtro `is_shared_with_psychologist` se for profissional.
- `logMood(moodData): Promise<MoodLog | null>` — Registra check-in emocional diário.

### Escalas Psicométricas & Conceituação
- `savePsychometricResult(result): Promise<boolean>` — Registra escore do PHQ-9 / GAD-7.
- `saveCognitiveDiagram(diagram): Promise<boolean>` — Salva mapa de conceituação cognitiva.
- `saveVoiceAnchor(anchor): Promise<boolean>` — Salva metadados e áudio da âncora de voz.

---

## Idempotência & Validação

- Operações críticas aceitam validação por schemas TypeScript/Zod;
- Tratamento resiliente de conexão offline com reconciliação automática de estado.
