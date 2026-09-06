# 06 — Banco de Dados (Schema de Produção Supabase)

## Convenções Arquiteturais

- **Chave Primária:** `id UUID DEFAULT uuid_generate_v4()`
- **Datas:** `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Multi-Tenant:** Isolamento relacional por psicólogo e paciente via `psychologist_patient_relationships` e `profiles` vinculados a `auth.uid()`.
- **Sigilo Profissional:** Tabelas segregadas para registros compartilháveis vs. anotações privativas de supervisão (`session_private_notes`).

---

## Tabelas em Produção (19 Tabelas Homologadas)

### 1. `profiles`
- `id` (UUID, PK)
- `user_id` (UUID, UNIQUE) — Referência ao `auth.users(id)` do Supabase Auth
- `role` (TEXT) — `CHECK (role IN ('psychologist', 'patient', 'manager', 'superadmin', 'admin', 'supervisor'))`
- `full_name` (TEXT)
- `display_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2. `psychologists`
- `id` (UUID, PK)
- `profile_id` (UUID, FK -> `profiles.id`)
- `crp_number` (TEXT) — Número do registro no CRP
- `crp_state` (TEXT) — UF do conselho regional (ex: 'SP', 'RJ')
- `approach` (TEXT) — Linha teórica (TCC, ACT, Psicanálise, Humanismo, etc.)
- `specialties` (TEXT[]) — Array de áreas de atuação
- `session_default_price` (NUMERIC) — Valor base de consulta
- `session_default_duration_minutes` (INT) — Duração padrão (ex: 50 minutos)
- `e_psi_verified` (BOOLEAN) — Validação de cadastro e-Psi para teleconsulta

### 3. `patients`
- `id` (UUID, PK)
- `profile_id` (UUID, FK -> `profiles.id`, NULLABLE)
- `full_name` (TEXT)
- `social_name` (TEXT, NULLABLE)
- `birth_date` (DATE / TEXT)
- `gender` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `emergency_contact_name`, `emergency_contact_phone` (TEXT)
- `clinical_notes_overview` (TEXT)
- `status` (TEXT) — `'active'`, `'inactive'`, `'archived'`
- `started_at` (TIMESTAMPTZ)

### 4. `psychologist_patient_relationships`
- `id` (UUID, PK)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `patient_id` (UUID, FK -> `patients.id`)
- `status` (TEXT) — `'active'`, `'transferred'`, `'discharged'`
- `created_at` (TIMESTAMPTZ)

### 5. `appointments`
- `id` (UUID, PK)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `patient_id` (UUID, FK -> `patients.id`)
- `starts_at`, `ends_at` (TIMESTAMPTZ)
- `modality` (TEXT) — `'in_person'`, `'online'`
- `location_or_link` (TEXT) — Link da teleconsulta (Google Meet / WebRTC) ou sala presencial
- `status` (TEXT) — `'scheduled'`, `'confirmed'`, `'completed'`, `'canceled'`, `'no_show'`
- `price` (NUMERIC) — Honorário cobrado
- `payment_status` (TEXT) — `'pending'`, `'paid_pix'`, `'paid_credit'`, `'paid_cash'`, `'paid_invoice'`, `'exempt'`
- `receipt_number` (TEXT) — Número do recibo de prestação de serviços psicológicos
- `paid_at` (TIMESTAMPTZ)
- `cancellation_reason`, `notes` (TEXT)

### 6. `therapy_sessions` (Prontuário & Evolução)
- `id` (UUID, PK)
- `appointment_id` (UUID, FK -> `appointments.id`, NULLABLE)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `patient_id` (UUID, FK -> `patients.id`)
- `session_date` (TIMESTAMPTZ)
- `duration_minutes` (INT)
- `summary` (TEXT)
- `techniques_used` (TEXT[])
- `homework_assigned` (TEXT)
- `status` (TEXT) — `'draft'`, `'finalized'`
- `soap_subjective`, `soap_objective`, `soap_assessment`, `soap_plan` (TEXT) — Formato SOAP

### 7. `session_private_notes` (Sigilo Estrito CFP)
- `id` (UUID, PK)
- `session_id` (UUID, FK -> `therapy_sessions.id`, ON DELETE CASCADE)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `patient_id` (UUID, FK -> `patients.id`)
- `private_clinical_hypothesis` (TEXT)
- `supervision_notes` (TEXT) — Anotações reservadas de supervisão clínica
- `transference_countertransference_notes` (TEXT) — Dinâmica contratransferencial
- `risk_assessment_notes` (TEXT) — Avaliação sigilosa de risco

### 8. `psychometric_results`
- `id` (UUID, PK)
- `patient_id` (UUID, FK -> `patients.id`)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `scale_id` (TEXT) — `'phq9'`, `'gad7'`, etc.
- `scale_name` (TEXT)
- `total_score` (INT)
- `severity_level` (TEXT) — Mínima, Leve, Moderada, Grave
- `risk_flag` (BOOLEAN) — Alerta de risco ético/emergência
- `answers` (JSONB)
- `clinical_interpretation` (TEXT)
- `taken_at` (TIMESTAMPTZ)

### 9. `cognitive_diagrams` (TCC / ACT)
- `id` (UUID, PK)
- `patient_id` (UUID, FK -> `patients.id`)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `situation`, `automatic_thoughts`, `emotions`, `bodily_sensations`, `behaviors`, `alternative_thought` (TEXT)
- `suds_score` (INT) — Escala de Desconforto Subjetivo (0-10)

### 10. `voice_anchors`
- `id` (UUID, PK)
- `patient_id` (UUID, FK -> `patients.id`)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `title`, `category`, `audio_url`, `instruction`, `transcript` (TEXT)
- `duration_seconds` (INT)

### 11. `patient_invites`
- `id` (UUID, PK)
- `psychologist_id` (UUID, FK -> `psychologists.id`)
- `token` (TEXT, UNIQUE)
- `patient_name`, `patient_email`, `patient_phone` (TEXT)
- `status` (TEXT) — `'pending'`, `'accepted'`, `'expired'`
- `expires_at` (TIMESTAMPTZ)

### 12. `exercise_templates` (Biblioteca Clínica)
- `id` (UUID, PK)
- `psychologist_id` (UUID, NULLABLE)
- `title`, `description`, `instructions`, `category` (TEXT)
- `schema_fields` (JSONB)
- `is_public_library` (BOOLEAN)

### 13. `assigned_exercises`
- `id` (UUID, PK)
- `template_id` (UUID, FK -> `exercise_templates.id`, NULLABLE)
- `psychologist_id` (UUID)
- `patient_id` (UUID)
- `title`, `instructions` (TEXT)
- `schema_fields` (JSONB)
- `due_date` (TIMESTAMPTZ, NULLABLE)
- `status` (TEXT) — `'pending'`, `'completed'`, `'reviewed'`
- `assigned_at`, `completed_at`, `reviewed_at` (TIMESTAMPTZ)

### 14. `exercise_answers`
- `id` (UUID, PK)
- `assigned_exercise_id` (UUID, FK -> `assigned_exercises.id`)
- `patient_id` (UUID)
- `responses` (JSONB)
- `patient_notes` (TEXT)
- `submitted_at` (TIMESTAMPTZ)

### 15. `exercise_feedback`
- `id` (UUID, PK)
- `assigned_exercise_id` (UUID, FK -> `assigned_exercises.id`)
- `psychologist_id` (UUID)
- `feedback_text`, `clinical_observations` (TEXT)

### 16. `diary_entries`
- `id` (UUID, PK)
- `patient_id` (UUID)
- `title`, `content`, `primary_emotion` (TEXT)
- `intensity` (INT)
- `is_shared_with_psychologist` (BOOLEAN DEFAULT FALSE) — **Privacy by default**
- `entry_date` (TIMESTAMPTZ)

### 17. `mood_logs`
- `id` (UUID, PK)
- `patient_id` (UUID)
- `score` (INT) — 1 a 5
- `intensity` (INT) — 0 a 10
- `primary_feeling` (TEXT)
- `tags` (TEXT[])
- `note` (TEXT)
- `logged_at` (TIMESTAMPTZ)

### 18. `consents` (Auditoria & Termos LGPD)
- `id` (UUID, PK)
- `user_id` (UUID)
- `terms_version` (TEXT) — Ex: `'CFP-LGPD-2026.1'`
- `accepted_at` (TIMESTAMPTZ)
- `details` (JSONB) — Hash SHA-256, preço, partes e payload assinado

### 19. `clinics`
- `id` (UUID, PK)
- `name`, `trade_name`, `document_cnpj`, `phone`, `email`, `address`, `plan_tier` (TEXT)
- `manager_profile_id` (UUID, FK -> `profiles.id`)

---

## Storage Buckets (Supabase Storage)

- `avatars` (Público, 5MB): Fotos de perfil de profissionais e pacientes.
- `voice-anchors` (Público, 20MB): Áudios terapêuticos e exercícios sonoros.
- `documents` (Privado, 20MB): Contratos assinados, fichas de anamnese e documentos em PDF.

---

## Triggers & Automações no Banco de Dados

### 1. `on_auth_user_auto_confirm` (Auto-Confirmação de E-mail)
Executa `BEFORE INSERT` em `auth.users`, atribuindo `NEW.email_confirmed_at := NOW()`. Garante que qualquer novo psicólogo ou paciente cadastrado possa fazer login imediato sem travar na tela de verificação de e-mail.

### 2. `handle_new_user` (Provisionamento Automático de Perfil)
Executa `AFTER INSERT` em `auth.users`, criando automaticamente o registro correspondente em `public.profiles` e na tabela de especialidade (`psychologists` ou `patients`).

---

## Políticas RLS (Row Level Security)

1. **Multi-Tenant Psicólogo-Paciente:**
   A leitura e mutação de dados de pacientes (`patients`, `appointments`, `therapy_sessions`, `goals`) só são permitidas caso exista um registro ativo correspondente em `psychologist_patient_relationships` onde o psicólogo seja o usuário autenticado (`auth.uid()`) ou `patients.psychologist_id = current_psychologist.id`.
2. **Sigilo Absoluto de Notas Privadas:**
   A tabela `session_private_notes` possui política exclusiva para psicólogos. Pacientes não possuem permissão de SELECT nem UPDATE sobre este recurso.
3. **Diário com Compartilhamento Condicional:**
   O paciente lê e edita todos os seus próprios diários. O psicólogo só tem permissão de leitura sobre registros onde `is_shared_with_psychologist = TRUE`.
