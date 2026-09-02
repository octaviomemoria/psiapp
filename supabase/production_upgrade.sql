-- ==============================================================================
-- PSIAPP - SCRIPT DE ATUALIZAÇÃO PARA PRODUÇÃO (SUPABASE)
-- Execute este script no SQL Editor do Supabase para habilitar todas as tabelas
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Atualizar restrição de papéis (Role) na tabela profiles
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE IF EXISTS profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('psychologist', 'patient', 'manager', 'superadmin', 'admin', 'supervisor'));

-- 3. Atualizar colunas na tabela psychologists
ALTER TABLE IF EXISTS psychologists ADD COLUMN IF NOT EXISTS session_default_price NUMERIC(10,2) DEFAULT 250.00;
ALTER TABLE IF EXISTS psychologists ADD COLUMN IF NOT EXISTS session_default_duration_minutes INT DEFAULT 50;
ALTER TABLE IF EXISTS psychologists ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS psychologists ADD COLUMN IF NOT EXISTS e_psi_verified BOOLEAN DEFAULT TRUE;

-- 4. Criar tabela de Clínicas (Multi-Tenant & Gestão)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    trade_name TEXT,
    document_cnpj TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    plan_tier TEXT DEFAULT 'clinica_pro',
    manager_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela de Escalas Psicométricas (PHQ-9, GAD-7, etc.)
CREATE TABLE IF NOT EXISTS psychometric_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
    scale_id TEXT NOT NULL, -- 'phq9', 'gad7', etc.
    scale_name TEXT NOT NULL,
    total_score INT NOT NULL,
    severity_level TEXT NOT NULL, -- 'Mínima', 'Leve', 'Moderada', 'Grave'
    risk_flag BOOLEAN NOT NULL DEFAULT FALSE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    clinical_interpretation TEXT,
    taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Diagramas de Conceituação Cognitiva (TCC / ACT)
CREATE TABLE IF NOT EXISTS cognitive_diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
    situation TEXT,
    automatic_thoughts TEXT,
    emotions TEXT,
    bodily_sensations TEXT,
    behaviors TEXT,
    alternative_thought TEXT,
    suds_score INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Âncoras de Voz Terapêuticas
CREATE TABLE IF NOT EXISTS voice_anchors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Regulação Emocional',
    audio_url TEXT,
    duration_seconds INT NOT NULL DEFAULT 0,
    instruction TEXT,
    transcript TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Convites para Pacientes
CREATE TABLE IF NOT EXISTS patient_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Extensões nas tabelas existentes (para compatibilidade total com novas features)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 220.00;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

ALTER TABLE therapy_sessions ADD COLUMN IF NOT EXISTS soap_subjective TEXT;
ALTER TABLE therapy_sessions ADD COLUMN IF NOT EXISTS soap_objective TEXT;
ALTER TABLE therapy_sessions ADD COLUMN IF NOT EXISTS soap_assessment TEXT;
ALTER TABLE therapy_sessions ADD COLUMN IF NOT EXISTS soap_plan TEXT;

-- 6. Habilitar RLS em todas as tabelas
ALTER TABLE psychometric_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_private_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. POLÍTICAS DE RLS ESTRITAS (ISOLAMENTO MULTI-TENANT, SIGILO CFP E LGPD)
-- ==============================================================================

-- 7.1 Pacientes
DROP POLICY IF EXISTS "Authenticated users access patients" ON patients;
DROP POLICY IF EXISTS "Psychologists manage own patients" ON patients;
DROP POLICY IF EXISTS "Patients view own profile" ON patients;

CREATE POLICY "Psychologists manage own patients" ON patients
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT patient_id FROM psychologist_patient_relationships
            WHERE psychologist_id IN (
                SELECT id FROM psychologists WHERE profile_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            )
        )
        OR linked_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    WITH CHECK (
        id IN (
            SELECT patient_id FROM psychologist_patient_relationships
            WHERE psychologist_id IN (
                SELECT id FROM psychologists WHERE profile_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            )
        )
        OR linked_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 7.2 Agendamentos
DROP POLICY IF EXISTS "Authenticated users manage appointments" ON appointments;
DROP POLICY IF EXISTS "Psychologists manage own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients view own appointments" ON appointments;

CREATE POLICY "Psychologists manage own appointments" ON appointments
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Patients view own appointments" ON appointments
    FOR SELECT TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 7.3 Sessões Terapêuticas
DROP POLICY IF EXISTS "Psychologists manage therapy_sessions" ON therapy_sessions;
DROP POLICY IF EXISTS "Psychologists manage own therapy_sessions" ON therapy_sessions;
DROP POLICY IF EXISTS "Patients view own therapy_sessions" ON therapy_sessions;

CREATE POLICY "Psychologists manage own therapy_sessions" ON therapy_sessions
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 7.4 Notas Privadas da Sessão (Sigilo Absoluto - NUNCA visível ao paciente)
DROP POLICY IF EXISTS "Psychologists view own private notes" ON session_private_notes;
CREATE POLICY "Psychologists manage own private notes" ON session_private_notes
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 7.5 Exercícios Atribuídos e Respostas
DROP POLICY IF EXISTS "Authenticated users manage assigned_exercises" ON assigned_exercises;
CREATE POLICY "Psychologists and patients manage assigned_exercises" ON assigned_exercises
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
        OR patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
        OR patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 7.6 Diário Emocional (Apenas compartilhado é visível ao psicólogo)
DROP POLICY IF EXISTS "Patients manage own diary_entries" ON diary_entries;
DROP POLICY IF EXISTS "Psychologist view shared diary entries only" ON diary_entries;

CREATE POLICY "Patients manage own diary_entries" ON diary_entries
    FOR ALL TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Psychologists view shared diary_entries" ON diary_entries
    FOR SELECT TO authenticated
    USING (
        is_shared_with_psychologist = TRUE
        AND patient_id IN (
            SELECT patient_id FROM psychologist_patient_relationships
            WHERE psychologist_id IN (
                SELECT id FROM psychologists WHERE profile_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

-- 7.7 Termômetro de Humor
DROP POLICY IF EXISTS "Patients manage own mood_logs" ON mood_logs;
DROP POLICY IF EXISTS "Psychologists view mood_logs" ON mood_logs;

CREATE POLICY "Patients manage own mood_logs" ON mood_logs
    FOR ALL TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE linked_profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Psychologists view patient mood_logs" ON mood_logs
    FOR SELECT TO authenticated
    USING (
        patient_id IN (
            SELECT patient_id FROM psychologist_patient_relationships
            WHERE psychologist_id IN (
                SELECT id FROM psychologists WHERE profile_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

-- 7.8 Objetivos Terapêuticos
DROP POLICY IF EXISTS "Authenticated users manage goals" ON goals;
CREATE POLICY "Psychologists and patients manage goals" ON goals
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
        OR (
            visible_to_patient = TRUE
            AND patient_id IN (
                SELECT id FROM patients WHERE linked_profile_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            )
        )
    )
    WITH CHECK (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

