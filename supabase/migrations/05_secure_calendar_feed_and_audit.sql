-- ====================================================================
-- MIGRAÇÃO 05 — Feed iCal protegido por token + auditoria sem vazamento
-- Rode no Supabase: SQL Editor > New query > colar > Run.
-- Idempotente. Requer a migração 02 (clinical_audit_log) já aplicada.
-- ====================================================================

BEGIN;

-- ====================================================================
-- PARTE 1 — FEED iCAL
-- Problema: /api/calendar/feed aceitava psychologistId sem token e, sem ele,
-- devolvia a agenda de TODOS os psicólogos (usando a service_role, que ignora RLS).
-- Solução: cada psicólogo tem um token secreto e longo; o endpoint só entrega
-- a agenda do dono do token, por meio de uma função do banco (sem service_role).
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.calendar_feed_tokens (
    psychologist_id UUID PRIMARY KEY REFERENCES public.psychologists(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE CHECK (char_length(token) >= 48),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rotated_at      TIMESTAMPTZ
);

-- RLS ligado e SEM políticas: ninguém lê ou grava a tabela direto (nem com a chave pública).
-- O acesso é somente pelas funções abaixo.
ALTER TABLE public.calendar_feed_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_feed_tokens FROM anon, authenticated;

-- Devolve (ou cria) o token do psicólogo logado. p_rotate = true gera um novo e invalida o anterior.
CREATE OR REPLACE FUNCTION public.get_or_create_calendar_feed_token(p_rotate BOOLEAN DEFAULT FALSE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_psy   UUID;
    v_token TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
    END IF;

    SELECT ps.id INTO v_psy
    FROM public.psychologists ps
    JOIN public.profiles pr ON pr.id = ps.profile_id
    WHERE pr.user_id = auth.uid()
    LIMIT 1;

    IF v_psy IS NULL THEN
        RAISE EXCEPTION 'psychologist not found' USING ERRCODE = '42501';
    END IF;

    SELECT token INTO v_token FROM public.calendar_feed_tokens WHERE psychologist_id = v_psy;

    IF v_token IS NULL OR p_rotate THEN
        -- 2 UUIDv4 sem hífens = 64 hex (~244 bits aleatórios)
        v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
        INSERT INTO public.calendar_feed_tokens (psychologist_id, token)
        VALUES (v_psy, v_token)
        ON CONFLICT (psychologist_id)
        DO UPDATE SET token = EXCLUDED.token, rotated_at = NOW();
    END IF;

    RETURN v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_calendar_feed_token(BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_calendar_feed_token(BOOLEAN) TO authenticated;

-- Agenda do dono do token (usada pelo endpoint público do feed). Expõe só o mínimo:
-- primeiro nome (ou nome social), horários, modalidade e local/link. Sem notas, sem e-mail/telefone.
CREATE OR REPLACE FUNCTION public.get_calendar_feed(p_token TEXT)
RETURNS TABLE (
    id               UUID,
    starts_at        TIMESTAMPTZ,
    ends_at          TIMESTAMPTZ,
    modality         TEXT,
    location_or_link TEXT,
    status           TEXT,
    patient_name     TEXT,
    psychologist_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_psy UUID;
BEGIN
    IF p_token IS NULL OR char_length(p_token) < 48 THEN
        RETURN;
    END IF;

    SELECT t.psychologist_id INTO v_psy FROM public.calendar_feed_tokens t WHERE t.token = p_token;
    IF v_psy IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT a.id, a.starts_at, a.ends_at, a.modality, a.location_or_link, a.status,
           split_part(COALESCE(NULLIF(p.social_name, ''), p.full_name), ' ', 1),
           COALESCE(pr.display_name, pr.full_name)
    FROM public.appointments a
    JOIN public.patients p ON p.id = a.patient_id
    JOIN public.psychologists ps ON ps.id = a.psychologist_id
    JOIN public.profiles pr ON pr.id = ps.profile_id
    WHERE a.psychologist_id = v_psy
      AND a.status IN ('scheduled', 'confirmed')
      AND a.starts_at >= NOW() - INTERVAL '90 days'
    ORDER BY a.starts_at;
END;
$$;

REVOKE ALL ON FUNCTION public.get_calendar_feed(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_calendar_feed(TEXT) TO anon, authenticated;

-- ====================================================================
-- PARTE 2 — AUDITORIA
-- Problemas:
--  (a) o gatilho grava o conteúdo integral (SOAP e anotações privadas) em old_data/new_data
--      e a política de leitura deixava qualquer clinic_admin/superadmin ler tudo;
--  (b) qualquer usuário logado podia INSERIR linhas falsas no log (audit_log_insert_policy);
--  (c) UPDATE/DELETE não tinham política, mas os privilégios de tabela continuavam concedidos.
-- Solução: o conteúdo continua guardado (permite recuperar registro apagado), porém só é legível
-- pelo autor da ação; administradores enxergam uma visão SEM conteúdo; só o gatilho escreve no log.
-- ====================================================================

-- (b) ninguém insere direto; só o gatilho (SECURITY DEFINER, roda como dono da tabela)
DROP POLICY IF EXISTS "audit_log_insert_policy" ON public.clinical_audit_log;

-- (a) leitura direta apenas das próprias ações
DROP POLICY IF EXISTS "audit_log_select_policy" ON public.clinical_audit_log;
DROP POLICY IF EXISTS "audit_log_select_own" ON public.clinical_audit_log;
CREATE POLICY "audit_log_select_own" ON public.clinical_audit_log
    FOR SELECT TO authenticated
    USING (performed_by = auth.uid());

-- (c) imutável na prática: sem escrita direta para nenhum papel da API
REVOKE ALL ON public.clinical_audit_log FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.clinical_audit_log FROM authenticated;
GRANT SELECT ON public.clinical_audit_log TO authenticated;

-- Visão para administradores da plataforma: evento, tabela, registro, autor, data e QUAIS colunas
-- mudaram — nunca o conteúdo. (Escopo de clinic_admin por clínica exigiria vincular o log a uma
-- organização; por ora somente superadmin.)
DROP VIEW IF EXISTS public.clinical_audit_log_admin;
CREATE VIEW public.clinical_audit_log_admin
WITH (security_barrier = true) AS
SELECT
    l.id,
    l.table_name,
    l.record_id,
    l.action,
    l.performed_by,
    l.actor_role,
    l.created_at,
    CASE
        WHEN l.action = 'UPDATE' AND l.old_data IS NOT NULL AND l.new_data IS NOT NULL THEN
            ARRAY(
                SELECT e.key
                FROM jsonb_each(l.new_data) AS e
                WHERE l.old_data -> e.key IS DISTINCT FROM e.value
                ORDER BY e.key
            )
        ELSE NULL
    END AS changed_columns
FROM public.clinical_audit_log l
WHERE EXISTS (
    SELECT 1 FROM public.profiles pf
    WHERE pf.user_id = auth.uid() AND pf.role = 'superadmin'
);

REVOKE ALL ON public.clinical_audit_log_admin FROM PUBLIC, anon;
GRANT SELECT ON public.clinical_audit_log_admin TO authenticated;

-- Gatilho: mesma lógica, agora com search_path fixo (SECURITY DEFINER sem isso é vetor de escalonamento)
CREATE OR REPLACE FUNCTION public.fn_capture_clinical_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.clinical_audit_log (table_name, record_id, action, performed_by, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', v_user_id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.clinical_audit_log (table_name, record_id, action, performed_by, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', v_user_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.clinical_audit_log (table_name, record_id, action, performed_by, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', v_user_id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

COMMIT;

-- ====================================================================
-- VERIFICAÇÃO (rode separado; não altera nada)
-- ====================================================================
-- 1) Um usuário comum NÃO deve mais ver linhas de outros (deve devolver só as suas):
--      select count(*) from public.clinical_audit_log;
-- 2) Feed: com token inválido não devolve nada; com o token de um psicólogo devolve só a agenda dele:
--      select * from public.get_calendar_feed('token-invalido');
-- 3) Políticas ativas na auditoria (esperado: somente audit_log_select_own):
--      select policyname, cmd from pg_policies where tablename = 'clinical_audit_log';
