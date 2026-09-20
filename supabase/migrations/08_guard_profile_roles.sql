-- ====================================================================
-- MIGRAÇÃO 08 — Ninguém escolhe o próprio papel (escalonamento de privilégio)
-- Rode no Supabase: SQL Editor > New query > colar > Run. Idempotente.
--
-- Problema: o app cria o perfil (profiles) no primeiro login usando o papel que veio
-- de user_metadata, e user_metadata é definido pelo PRÓPRIO usuário em supabase.auth.signUp().
-- Qualquer pessoa com a chave pública podia se cadastrar com role = 'superadmin'.
-- Como o papel decide o que o app (e o middleware de rotas) libera, isso precisa ser
-- impedido no banco, independentemente das políticas de RLS que já existam em `profiles`.
--
-- Regra: chamadas feitas pela API com a chave pública / sessão do usuário (papéis JWT
-- 'anon' e 'authenticated') só podem criar perfis 'psychologist' ou 'patient', para si
-- mesmas, e nunca alterar role ou user_id. Papéis administrativos (manager, superadmin,
-- admin, supervisor) só podem ser concedidos pelo SQL Editor / service_role.
-- ====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    v_jwt_role TEXT;
BEGIN
    -- Papel do JWT da requisição: 'anon' | 'authenticated' | 'service_role'.
    -- Vazio quando o comando roda no SQL Editor / conexão direta (postgres).
    v_jwt_role := COALESCE(
        NULLIF(current_setting('request.jwt.claim.role', true), ''),
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
        ''
    );

    IF v_jwt_role NOT IN ('anon', 'authenticated') THEN
        RETURN NEW; -- service_role / SQL Editor: operação administrativa legítima
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.role NOT IN ('psychologist', 'patient') THEN
            RAISE EXCEPTION 'O papel "%" não pode ser atribuído pelo próprio usuário.', NEW.role
                USING ERRCODE = '42501';
        END IF;
        IF NEW.user_id IS NOT NULL AND NEW.user_id IS DISTINCT FROM auth.uid() THEN
            RAISE EXCEPTION 'Não é permitido criar perfil em nome de outro usuário.'
                USING ERRCODE = '42501';
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'O papel de um perfil só pode ser alterado por um administrador.'
                USING ERRCODE = '42501';
        END IF;
        IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE EXCEPTION 'O vínculo do perfil com o usuário não pode ser alterado.'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_guard_profile_role();

COMMIT;

-- ====================================================================
-- AUDITORIA DO QUE JÁ EXISTE (rode separado; não altera nada)
-- ====================================================================

-- A) Perfis com papel administrativo: confirme que CADA UM é legítimo.
--    Se aparecer alguém que você não conhece, rebaixe: update public.profiles set role = 'psychologist' where id = '<ID>';
-- select id, user_id, email, role, created_at
-- from public.profiles
-- where role not in ('psychologist', 'patient')
-- order by created_at;

-- B) Contas cujo cadastro pediu papel diferente de psicólogo/paciente (tentativas de escalonamento):
-- select id, email, raw_user_meta_data ->> 'role' as papel_pedido, created_at
-- from auth.users
-- where coalesce(raw_user_meta_data ->> 'role', 'psychologist') not in ('psychologist', 'patient')
-- order by created_at;

-- C) Políticas atuais da tabela profiles (envie o resultado se quiser que eu revise):
-- select policyname, cmd, roles, qual, with_check from pg_policies where tablename = 'profiles';
