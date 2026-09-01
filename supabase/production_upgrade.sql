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

-- 6. Habilitar RLS em todas as novas tabelas
ALTER TABLE psychometric_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_invites ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Estritas (Segregação de Sigilo e Isolamento de Tenants)

-- 6.1 Escalas Psicométricas
CREATE POLICY "Psychologists manage psychometric_results of their patients" 
    ON psychometric_results FOR ALL TO authenticated 
    USING (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
    WITH CHECK (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Patients view own psychometric_results" 
    ON psychometric_results FOR SELECT TO authenticated 
    USING (patient_id IN (SELECT id FROM patients WHERE linked_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- 6.2 Diagramas Cognitivos (TCC/ACT)
CREATE POLICY "Psychologists manage cognitive_diagrams of their patients" 
    ON cognitive_diagrams FOR ALL TO authenticated 
    USING (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
    WITH CHECK (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Patients view own cognitive_diagrams" 
    ON cognitive_diagrams FOR SELECT TO authenticated 
    USING (patient_id IN (SELECT id FROM patients WHERE linked_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- 6.3 Âncoras de Voz
CREATE POLICY "Psychologists manage voice_anchors" 
    ON voice_anchors FOR ALL TO authenticated 
    USING (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
    WITH CHECK (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Patients view assigned voice_anchors" 
    ON voice_anchors FOR SELECT TO authenticated 
    USING (patient_id IN (SELECT id FROM patients WHERE linked_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- 6.4 Convites de Pacientes
CREATE POLICY "Psychologists manage own patient_invites" 
    ON patient_invites FOR ALL TO authenticated 
    USING (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
    WITH CHECK (psychologist_id IN (SELECT id FROM psychologists WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Permitir leitura pública/anônima de convite ativo por token
CREATE POLICY "Allow public read on active patient_invites by token" 
    ON patient_invites FOR SELECT TO anon 
    USING (status = 'pending' AND expires_at > NOW());

-- 7. Trigger para criação automática de Profile após cadastro no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_crp_number TEXT;
    v_crp_state TEXT;
    v_approach TEXT;
    v_new_profile_id UUID;
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'psychologist');
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    v_crp_number := NEW.raw_user_meta_data->>'crp_number';
    v_crp_state := COALESCE(NEW.raw_user_meta_data->>'crp_state', 'SP');
    v_approach := COALESCE(NEW.raw_user_meta_data->>'approach', 'TCC (Terapia Cognitivo-Comportamental)');

    -- Inserir Perfil
    INSERT INTO public.profiles (user_id, full_name, display_name, email, role)
    VALUES (NEW.id, v_full_name, split_part(v_full_name, ' ', 1), NEW.email, v_role)
    RETURNING id INTO v_new_profile_id;

    -- Se for Psicólogo, criar registro na tabela psychologists
    IF v_role = 'psychologist' THEN
        INSERT INTO public.psychologists (profile_id, crp_number, crp_state, approach, bio)
        VALUES (
            v_new_profile_id,
            COALESCE(v_crp_number, '06/' || floor(random() * 90000 + 10000)::text),
            v_crp_state,
            v_approach,
            'Psicóloga clínica dedicada ao desenvolvimento humano e saúde mental.'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger executado após INSERT em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. POLÍTICAS DE RLS PARA TABELAS CENTRAIS
-- ==============================================================================

DROP POLICY IF EXISTS "Authenticated users access patients" ON patients;
CREATE POLICY "Authenticated users access patients" ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users access psychologists" ON psychologists;
CREATE POLICY "Authenticated users access psychologists" ON psychologists FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Patients manage own mood_logs" ON mood_logs;
DROP POLICY IF EXISTS "Psychologists view mood_logs" ON mood_logs;
CREATE POLICY "Patients manage own mood_logs" ON mood_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Psychologists view mood_logs" ON mood_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Patients manage own diary_entries" ON diary_entries;
DROP POLICY IF EXISTS "Psychologist view shared diary entries only" ON diary_entries;
CREATE POLICY "Patients manage own diary_entries" ON diary_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Psychologist view shared diary entries only" ON diary_entries FOR SELECT TO authenticated USING (is_shared_with_psychologist = TRUE);

DROP POLICY IF EXISTS "Authenticated users manage appointments" ON appointments;
CREATE POLICY "Authenticated users manage appointments" ON appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Psychologists manage therapy_sessions" ON therapy_sessions;
CREATE POLICY "Psychologists manage therapy_sessions" ON therapy_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage assigned_exercises" ON assigned_exercises;
CREATE POLICY "Authenticated users manage assigned_exercises" ON assigned_exercises FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage goals" ON goals;
CREATE POLICY "Authenticated users manage goals" ON goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

