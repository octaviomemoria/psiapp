-- ==============================================================================
-- PSISaaS / PSIAPP - SCHEMA COMPLETO POSTGRESQL COM ROW LEVEL SECURITY (RLS)
-- Arquitetura compatível com Supabase Auth e PostgreSQL 15+
-- ==============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. IDENTIDADE E ORGANIZAÇÕES
-- ==============================================================================

-- Perfis públicos/gerais dos usuários
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- Referência ao auth.users do Supabase
    full_name TEXT NOT NULL,
    display_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('psychologist', 'patient', 'admin', 'supervisor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizações / Clínicas / Consultórios
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    document_tax_id TEXT, -- CNPJ ou CPF
    owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Membros das organizações
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'psychologist', 'secretary')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, profile_id)
);

-- ==============================================================================
-- 2. DADOS ESPECÍFICOS DE PSICÓLOGOS E PACIENTES
-- ==============================================================================

-- Psicólogos
CREATE TABLE IF NOT EXISTS psychologists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    crp_number TEXT NOT NULL,
    crp_state VARCHAR(2) NOT NULL,
    approach TEXT, -- Ex: TCC, Psicanálise, Humanista, etc.
    specialties TEXT[],
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(crp_number, crp_state)
);

-- Pacientes (Carteira de Clientes)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    linked_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Se o paciente tiver conta cadastrada no app
    full_name TEXT NOT NULL,
    social_name TEXT,
    birth_date DATE,
    gender TEXT,
    email TEXT,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'on_hold')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    clinical_notes_overview TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relação Psicólogo <-> Paciente
CREATE TABLE IF NOT EXISTS psychologist_patient_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'transferred')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(psychologist_id, patient_id)
);

-- ==============================================================================
-- 3. AGENDAMENTOS, SESSÕES E REGISTROS CLÍNICOS
-- ==============================================================================

-- Agendamentos de Consultas
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    modality TEXT NOT NULL DEFAULT 'online' CHECK (modality IN ('presencial', 'online', 'domiciliar')),
    location_or_link TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show', 'rescheduled')),
    cancellation_reason TEXT,
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessões Terapêuticas Realizadas
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_number INT,
    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes INT NOT NULL DEFAULT 50,
    modality TEXT NOT NULL DEFAULT 'online',
    main_topics TEXT[],
    summary TEXT NOT NULL,
    interventions_used TEXT,
    evolution_observed TEXT,
    homework_assigned TEXT,
    next_session_plan TEXT,
    status TEXT NOT NULL DEFAULT 'finalized' CHECK (status IN ('draft', 'finalized', 'amended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anotações Privadas do Psicólogo (SEGREGAÇÃO DE SIGILO RIGOROSA - NUNCA VISÍVEL AO PACIENTE)
CREATE TABLE IF NOT EXISTS session_private_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES therapy_sessions(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    private_clinical_hypothesis TEXT NOT NULL,
    supervision_notes TEXT,
    transference_countertransference_notes TEXT,
    risk_assessment_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. OBJETIVOS TERAPÊUTICOS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Geral', -- Ex: Ansiedade, Autoestima, Hábitos, Relacionamentos
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'evolving', 'completed', 'paused')),
    target_date DATE,
    visible_to_patient BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. EXERCÍCIOS TERAPÊUTICOS E FORMULÁRIOS
-- ==============================================================================

-- Modelos / Biblioteca de Exercícios
CREATE TABLE IF NOT EXISTS exercise_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE SET NULL, -- Null se for da biblioteca pública
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    category TEXT NOT NULL DEFAULT 'Autoconhecimento',
    schema_fields JSONB NOT NULL DEFAULT '[]'::jsonb, -- Estrutura dos campos do formulário
    is_public_library BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exercícios Atribuídos ao Paciente
CREATE TABLE IF NOT EXISTS assigned_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES exercise_templates(id) ON DELETE SET NULL,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructions TEXT,
    schema_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed', 'expired')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Respostas dos Exercícios enviadas pelos Pacientes
CREATE TABLE IF NOT EXISTS exercise_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_exercise_id UUID NOT NULL REFERENCES assigned_exercises(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    patient_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback do Psicólogo sobre o Exercício
CREATE TABLE IF NOT EXISTS exercise_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_exercise_id UUID NOT NULL REFERENCES assigned_exercises(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    clinical_observations TEXT, -- Privado do psicólogo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. DIÁRIO EMOCIONAL E MONITORAMENTO DE HUMOR (PACIENTE)
-- ==============================================================================

-- Diário do Paciente (Controle Rigoroso de Compartilhamento)
CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    predominant_emotion TEXT, -- Ex: Alegria, Tristeza, Ansiedade, Raiva, Calma, etc.
    intensity INT NOT NULL DEFAULT 5 CHECK (intensity >= 0 AND intensity <= 10),
    is_shared_with_psychologist BOOLEAN NOT NULL DEFAULT FALSE, -- DEFAULT É PRIVADO
    entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monitoramento de Humor ("Como você está hoje?")
CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    mood_score INT NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5), -- 1=Muito mal, 2=Mal, 3=Neutro, 4=Bem, 5=Muito bem
    emotions TEXT[] NOT NULL DEFAULT '{}',
    intensity INT NOT NULL DEFAULT 5 CHECK (intensity >= 0 AND intensity <= 10),
    notes TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. BIBLIOTECA DE CONTEÚDOS E MATERIAIS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'audio', 'pdf', 'guide')),
    url_or_file_path TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Psicoeducação',
    tags TEXT[],
    estimated_read_time_minutes INT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conteúdos Atribuídos / Recomendados ao Paciente
CREATE TABLE IF NOT EXISTS patient_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_library(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    personalized_note TEXT,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'viewed', 'completed')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ==============================================================================
-- 8. AUDITORIA E CONSENTIMENTOS LGPD
-- ==============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- Ex: 'lgpd_terms', 'telehealth_consent', 'data_sharing'
    terms_version TEXT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- ==============================================================================
-- 9. ÍNDICES DE PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_psychologist ON appointments(psychologist_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON therapy_sessions(patient_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_patient ON mood_logs(patient_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_patient ON diary_entries(patient_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_assigned_exercises_patient ON assigned_exercises(patient_id, status);

-- ==============================================================================
-- 10. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_private_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_content ENABLE ROW LEVEL SECURITY;

-- Regra RLS Crítica: Notas Privadas NUNCA podem ser lidas por pacientes
-- Apenas o psicólogo criador tem acesso de SELECT/UPDATE
CREATE POLICY "Psychologists view own private notes" 
    ON session_private_notes 
    FOR ALL 
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (SELECT profile_id FROM psychologists WHERE id = session_private_notes.psychologist_id)));

-- Regra RLS Diário: Psicólogo só pode ler entradas com is_shared_with_psychologist = true
CREATE POLICY "Psychologist view shared diary entries only"
    ON diary_entries
    FOR SELECT
    USING (
        is_shared_with_psychologist = TRUE 
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE id IN (SELECT linked_profile_id FROM patients WHERE id = diary_entries.patient_id))
    );
