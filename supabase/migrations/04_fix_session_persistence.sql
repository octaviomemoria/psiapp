-- ====================================================================
-- MIGRAÇÃO 04 — Correções de persistência de pacientes e sessões
-- Rode no Supabase: SQL Editor > New query > colar > Run.
-- É idempotente (pode rodar mais de uma vez).
-- ====================================================================

BEGIN;

-- 1. Colunas do registro SOAP.
--    Antes só existiam em production_upgrade.sql; sem elas, TODA sessão gravada
--    pela "Sessão ao Vivo" era recusada pelo banco.
ALTER TABLE public.therapy_sessions ADD COLUMN IF NOT EXISTS soap_subjective TEXT;
ALTER TABLE public.therapy_sessions ADD COLUMN IF NOT EXISTS soap_objective  TEXT;
ALTER TABLE public.therapy_sessions ADD COLUMN IF NOT EXISTS soap_assessment TEXT;
ALTER TABLE public.therapy_sessions ADD COLUMN IF NOT EXISTS soap_plan       TEXT;

-- 2. RLS na tabela de vínculos psicólogo <-> paciente.
--    Estava DESLIGADO: qualquer usuário com a chave pública (anon) podia listar
--    os vínculos e criar um vínculo para si mesmo com qualquer paciente.
ALTER TABLE public.psychologist_patient_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Psychologists manage own relationships" ON public.psychologist_patient_relationships;
CREATE POLICY "Psychologists manage own relationships" ON public.psychologist_patient_relationships
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

-- Observação: não há política para o paciente nesta tabela de propósito. A política de
-- "patients" já consulta esta tabela; uma política daqui consultando "patients" causaria
-- recursão infinita de RLS.

COMMIT;

-- ====================================================================
-- DIAGNÓSTICO (rode separado, depois da migração; não altera nada)
-- ====================================================================

-- A) Pacientes SEM vínculo com nenhum psicólogo (ficam invisíveis no app).
--    É o que acontece com cadastros feitos antes desta correção quando o vínculo falhou.
-- select p.id, p.full_name, p.email, p.created_at
-- from public.patients p
-- where not exists (select 1 from public.psychologist_patient_relationships r where r.patient_id = p.id)
-- order by p.created_at desc;

-- B) Para reativar um paciente órfão (ex.: a Lara), vincule-o ao psicólogo correto.
--    Descubra o id do psicólogo com:  select id, profile_id from public.psychologists;
-- insert into public.psychologist_patient_relationships (psychologist_id, patient_id, status)
-- values ('<ID_DO_PSICOLOGO>', '<ID_DO_PACIENTE>', 'active')
-- on conflict (psychologist_id, patient_id) do update set status = 'active';

-- C) Sessões gravadas para um paciente (confirma se algo chegou ao banco):
-- select id, session_number, session_date, status, created_at
-- from public.therapy_sessions
-- where patient_id = '<ID_DO_PACIENTE>'
-- order by created_at desc;
