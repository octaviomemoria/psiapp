-- ====================================================================
-- MIGRAÇÃO 06 — Cadastro completo de pacientes
-- Rode no Supabase: SQL Editor > New query > colar > Run.
-- É idempotente (pode rodar mais de uma vez).
--
-- Adiciona a `patients`: contatos, documentos, endereço, dados adicionais,
-- dados do responsável e tags. Cria a tabela `patient_groups` (grupos
-- gerenciáveis pelo psicólogo). CPF/RG ficam em texto simples, protegidos
-- pelas políticas de RLS já existentes em `patients`.
-- ====================================================================

BEGIN;

-- 1. Grupos de pacientes (cada psicólogo cria os seus: Adulto, Infantil, ...)
CREATE TABLE IF NOT EXISTS public.patient_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (psychologist_id, name)
);

ALTER TABLE public.patient_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Psychologists manage own patient groups" ON public.patient_groups;
CREATE POLICY "Psychologists manage own patient groups" ON public.patient_groups
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM public.psychologists WHERE profile_id IN (
                SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        psychologist_id IN (
            SELECT id FROM public.psychologists WHERE profile_id IN (
                SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 2. Informações pessoais e contatos
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.patient_groups(id) ON DELETE SET NULL;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS landline TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS has_social_name BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Endereço
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS address_complement TEXT;

-- 4. Dados adicionais
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS birthplace TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS race TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS relative_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS relative_relationship TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS relative_phone TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS how_found_us TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 5. Responsável (menores de idade ou pagador diferente do paciente)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_mobile TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_cpf TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_rg TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_birth_date DATE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_allow_billing_contact BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_send_reminders BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_patients_group_id ON public.patients(group_id);

COMMIT;
