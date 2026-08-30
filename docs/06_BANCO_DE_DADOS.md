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
