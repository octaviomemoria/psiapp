-- ==============================================================================
-- PSIAPP - SCRIPT DE ATUALIZAÇÃO PARA PRODUÇÃO (SUPABASE)
-- Execute este script no SQL Editor do Supabase para habilitar todas as tabelas
-- ==============================================================================

-- 1. Tabela de Escalas Psicométricas (PHQ-9, GAD-7, etc.)
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

-- Políticas de RLS permissivas para usuários autenticados
CREATE POLICY "Users can manage their psychometric_results" ON psychometric_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their cognitive_diagrams" ON cognitive_diagrams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their voice_anchors" ON voice_anchors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their patient_invites" ON patient_invites FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permitir acesso público/anônimo para ler convites via token
CREATE POLICY "Allow public read on patient_invites by token" ON patient_invites FOR SELECT TO anon USING (true);

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
