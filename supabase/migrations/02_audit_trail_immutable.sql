-- ====================================================================
-- MIGRAÇÃO DE TRILHA DE AUDITORIA IMUTÁVEL (CFP 001/2009 & 004/2020)
-- PsiApp SaaS - Conformidade com Normas Éticas e LGPD Artigo 11
-- ====================================================================

-- 1. Criação da tabela de auditoria clínica (Append-Only)
CREATE TABLE IF NOT EXISTS public.clinical_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(64) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(16) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'ACCESS', 'EXPORT')),
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role VARCHAR(32) DEFAULT 'psychologist',
    ip_address INET,
    user_agent TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índices de alta performance para auditoria e fiscalização
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON public.clinical_audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.clinical_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.clinical_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.clinical_audit_log(table_name);

-- 3. Habilitação de RLS Estrito
ALTER TABLE public.clinical_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS:
-- Inserção permitida para o sistema autenticado
CREATE POLICY "audit_log_insert_policy" ON public.clinical_audit_log
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Leitura restrita: Apenas administradores ou o próprio profissional sobre seus registros
CREATE POLICY "audit_log_select_policy" ON public.clinical_audit_log
    FOR SELECT
    USING (
        auth.uid() = performed_by OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('superadmin', 'clinic_admin')
        )
    );

-- BLOQUEIO TOTAL DE ALTERAÇÃO E EXCLUSÃO (Garantia Imutável do CFP)
-- Nenhuma política FOR UPDATE ou FOR DELETE é criada, tornando o registro 100% imutável.

-- 5. Função Genérica de Gatilho para Captura Automática
CREATE OR REPLACE FUNCTION public.fn_capture_clinical_audit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Triggers em Tabelas Clínicas Cruciais
DROP TRIGGER IF EXISTS trg_audit_therapy_sessions ON public.therapy_sessions;
CREATE TRIGGER trg_audit_therapy_sessions
    AFTER INSERT OR UPDATE OR DELETE ON public.therapy_sessions
    FOR EACH ROW EXECUTE FUNCTION public.fn_capture_clinical_audit();

DROP TRIGGER IF EXISTS trg_audit_session_notes ON public.session_private_notes;
CREATE TRIGGER trg_audit_session_notes
    AFTER INSERT OR UPDATE OR DELETE ON public.session_private_notes
    FOR EACH ROW EXECUTE FUNCTION public.fn_capture_clinical_audit();

DROP TRIGGER IF EXISTS trg_audit_consents ON public.consents;
CREATE TRIGGER trg_audit_consents
    AFTER INSERT OR UPDATE OR DELETE ON public.consents
    FOR EACH ROW EXECUTE FUNCTION public.fn_capture_clinical_audit();

COMMENT ON TABLE public.clinical_audit_log IS 'Trilha de auditoria imutável obrigatória conforme Resoluções CFP 001/2009 e 004/2020 para prontuário eletrônico em psicologia.';
