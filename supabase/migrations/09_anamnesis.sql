-- ====================================================================
-- MIGRAÇÃO 09 — Anamnese (modelos, respostas e preenchimento pelo paciente)
-- Rode no Supabase: SQL Editor > New query > colar > Run.
-- É idempotente (pode rodar mais de uma vez). Requer a migração 06 (patient_groups).
--
-- 1) anamnesis_templates: modelos PERSONALIZADOS do psicólogo. Os modelos padrão
--    (adulto, infantil, adolescente, idoso, casal) ficam no código da aplicação.
-- 2) anamnesis_responses: respostas de cada paciente, com cópia das perguntas
--    (snapshot) para que editar o modelo não altere respostas antigas.
-- 3) patient_groups.anamnesis_template_id: modelo importado pelo grupo do paciente.
-- 4) Funções públicas (anon) para o paciente preencher pelo link, com token de
--    uso único e prazo. O token é longo e aleatório; a resposta só grava enquanto
--    o link é válido e depois o token é apagado.
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. MODELOS PERSONALIZADOS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anamnesis_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    category TEXT NOT NULL DEFAULT 'Personalizado',
    description TEXT,
    schema JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(schema) = 'array'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.anamnesis_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Psychologists manage own anamnesis templates" ON public.anamnesis_templates;
CREATE POLICY "Psychologists manage own anamnesis templates" ON public.anamnesis_templates
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

-- --------------------------------------------------------------------
-- 2. RESPOSTAS
-- template_id é TEXT: guarda o UUID de um modelo personalizado ou "system:<nome>" de um modelo padrão.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anamnesis_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_snapshot JSONB NOT NULL CHECK (jsonb_typeof(template_snapshot) = 'array'),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers) = 'object'),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('sent', 'draft', 'completed')),
    filled_by TEXT NOT NULL DEFAULT 'psychologist' CHECK (filled_by IN ('psychologist', 'patient')),
    completed_at TIMESTAMPTZ,
    fill_token TEXT UNIQUE CHECK (fill_token IS NULL OR char_length(fill_token) >= 48),
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anamnesis_responses_patient ON public.anamnesis_responses(patient_id, created_at DESC);

ALTER TABLE public.anamnesis_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Psychologists manage own anamnesis responses" ON public.anamnesis_responses;
CREATE POLICY "Psychologists manage own anamnesis responses" ON public.anamnesis_responses
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

-- --------------------------------------------------------------------
-- 3. GRUPO -> MODELO
-- --------------------------------------------------------------------
ALTER TABLE public.patient_groups ADD COLUMN IF NOT EXISTS anamnesis_template_id TEXT;

-- --------------------------------------------------------------------
-- 4. PREENCHIMENTO PELO PACIENTE (página /anamnese/[token])
-- --------------------------------------------------------------------

-- Devolve só o necessário para exibir o formulário: primeiro nome do paciente, nome do profissional,
-- nome do modelo e as perguntas. NULL se o link não existe, expirou ou já foi usado.
CREATE OR REPLACE FUNCTION public.get_anamnesis_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_r    public.anamnesis_responses;
    v_pat  TEXT;
    v_psy  TEXT;
BEGIN
    IF p_token IS NULL OR char_length(p_token) < 48 THEN
        RETURN NULL;
    END IF;

    SELECT * INTO v_r
      FROM public.anamnesis_responses
     WHERE fill_token = p_token
       AND status IN ('sent', 'draft')
       AND (token_expires_at IS NULL OR token_expires_at > NOW());
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT split_part(COALESCE(pt.social_name, pt.full_name), ' ', 1) INTO v_pat
      FROM public.patients pt WHERE pt.id = v_r.patient_id;

    SELECT COALESCE(pr.display_name, pr.full_name) INTO v_psy
      FROM public.psychologists ps
      JOIN public.profiles pr ON pr.id = ps.profile_id
     WHERE ps.id = v_r.psychologist_id;

    RETURN jsonb_build_object(
        'patient_first_name', v_pat,
        'psychologist_name', v_psy,
        'template_name', v_r.template_name,
        'template_snapshot', v_r.template_snapshot
    );
END;
$$;

-- Grava as respostas e invalida o link (uso único). Retorna FALSE se o link não é mais válido.
CREATE OR REPLACE FUNCTION public.submit_anamnesis_by_token(p_token TEXT, p_answers JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_token IS NULL OR char_length(p_token) < 48
       OR p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object'
       OR pg_column_size(p_answers) > 200000 THEN
        RETURN FALSE;
    END IF;

    SELECT id INTO v_id
      FROM public.anamnesis_responses
     WHERE fill_token = p_token
       AND status IN ('sent', 'draft')
       AND (token_expires_at IS NULL OR token_expires_at > NOW())
     FOR UPDATE;
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    UPDATE public.anamnesis_responses
       SET answers = p_answers,
           status = 'completed',
           filled_by = 'patient',
           completed_at = NOW(),
           fill_token = NULL,
           token_expires_at = NULL,
           updated_at = NOW()
     WHERE id = v_id;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.get_anamnesis_by_token(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_anamnesis_by_token(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_anamnesis_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_anamnesis_by_token(TEXT, JSONB) TO anon, authenticated;

-- Tempo real: o psicólogo vê a anamnese concluída sem recarregar.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.anamnesis_responses;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

COMMIT;
