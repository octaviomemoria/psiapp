-- ====================================================================
-- MIGRAÇÃO 07 — Agenda: salas, recorrência, solicitações de agendamento
-- Rode no Supabase: SQL Editor > New query > colar > Run.
-- É idempotente (pode rodar mais de uma vez).
-- Requer as migrações anteriores e a tabela `clinics` (production_upgrade.sql).
--
-- 1) clinic_rooms: salas do psicólogo (ou da clínica).
-- 2) appointments: room_id, series_id e recurrence_rule.
-- 3) booking_settings: link público, horários de atendimento e regras.
-- 4) booking_requests: solicitações feitas pela página pública /agendar/[slug].
-- 5) Funções públicas (anon): informações da página, horários ocupados e criação
--    de solicitação. A validação e os limites de abuso ficam AQUI no banco, pois a
--    chave pública permite chamar a função direto, sem passar pelo site.
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. SALAS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clinic_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID REFERENCES public.psychologists(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
    room_number TEXT,
    type TEXT NOT NULL DEFAULT 'physical' CHECK (type IN ('physical', 'virtual')),
    capacity INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (psychologist_id IS NOT NULL OR clinic_id IS NOT NULL)
);

ALTER TABLE public.clinic_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage rooms" ON public.clinic_rooms;
CREATE POLICY "Owners manage rooms" ON public.clinic_rooms
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM public.psychologists WHERE profile_id IN (
                SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
        OR clinic_id IN (
            SELECT id FROM public.clinics WHERE manager_profile_id IN (
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
        OR clinic_id IN (
            SELECT id FROM public.clinics WHERE manager_profile_id IN (
                SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

-- --------------------------------------------------------------------
-- 2. AGENDAMENTOS: sala e recorrência
-- --------------------------------------------------------------------
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.clinic_rooms(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS series_id UUID;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_recurrence_rule_check') THEN
        ALTER TABLE public.appointments
            ADD CONSTRAINT appointments_recurrence_rule_check
            CHECK (recurrence_rule IS NULL OR recurrence_rule IN ('weekly', 'biweekly', 'monthly'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_room_starts ON public.appointments(room_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_series ON public.appointments(series_id);

-- --------------------------------------------------------------------
-- 3. CONFIGURAÇÃO DO AGENDAMENTO ONLINE
-- weekly_hours: {"1":[{"start":"09:00","end":"12:00"}], ...}  (chave = dia da semana, 0 = domingo)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_settings (
    psychologist_id UUID PRIMARY KEY REFERENCES public.psychologists(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    slot_minutes INT NOT NULL DEFAULT 50 CHECK (slot_minutes BETWEEN 15 AND 180),
    min_notice_hours INT NOT NULL DEFAULT 12 CHECK (min_notice_hours BETWEEN 0 AND 720),
    max_days_ahead INT NOT NULL DEFAULT 30 CHECK (max_days_ahead BETWEEN 1 AND 180),
    weekly_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    modalities TEXT[] NOT NULL DEFAULT ARRAY['online', 'presencial'],
    welcome_message TEXT CHECK (welcome_message IS NULL OR char_length(welcome_message) <= 500),
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Psychologists manage own booking settings" ON public.booking_settings;
CREATE POLICY "Psychologists manage own booking settings" ON public.booking_settings
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
-- 4. SOLICITAÇÕES DE AGENDAMENTO
-- Sem política para `anon`: a página pública só grava pela função create_booking_request.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL CHECK (char_length(patient_name) BETWEEN 2 AND 120),
    email TEXT NOT NULL CHECK (char_length(email) <= 160),
    phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
    requested_start TIMESTAMPTZ NOT NULL,
    requested_end TIMESTAMPTZ NOT NULL,
    modality TEXT NOT NULL DEFAULT 'online' CHECK (modality IN ('presencial', 'online', 'domiciliar')),
    message TEXT CHECK (message IS NULL OR char_length(message) <= 1000),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'canceled')),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    decline_reason TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_psy_status ON public.booking_requests(psychologist_id, status, requested_start);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Psychologists manage own booking requests" ON public.booking_requests;
CREATE POLICY "Psychologists manage own booking requests" ON public.booking_requests
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
-- 5. FUNÇÕES PÚBLICAS (página /agendar/[slug])
-- --------------------------------------------------------------------

-- 5a. Dados exibidos na página. Devolve NULL se o link não existe ou está desativado.
CREATE OR REPLACE FUNCTION public.get_public_booking_info(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_s    public.booking_settings;
    v_name TEXT;
    v_crp  TEXT;
BEGIN
    SELECT * INTO v_s FROM public.booking_settings WHERE slug = lower(p_slug) AND enabled;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT COALESCE(pr.display_name, pr.full_name), ps.crp_number || '/' || ps.crp_state
      INTO v_name, v_crp
      FROM public.psychologists ps
      JOIN public.profiles pr ON pr.id = ps.profile_id
     WHERE ps.id = v_s.psychologist_id;

    RETURN jsonb_build_object(
        'psychologist_name', v_name,
        'crp', v_crp,
        'slot_minutes', v_s.slot_minutes,
        'min_notice_hours', v_s.min_notice_hours,
        'max_days_ahead', v_s.max_days_ahead,
        'weekly_hours', v_s.weekly_hours,
        'modalities', to_jsonb(v_s.modalities),
        'welcome_message', v_s.welcome_message,
        'timezone', v_s.timezone
    );
END;
$$;

-- 5b. Somente os intervalos ocupados (sem nomes nem dados de pacientes).
CREATE OR REPLACE FUNCTION public.get_public_busy_slots(p_slug TEXT, p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (busy_start TIMESTAMPTZ, busy_end TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT a.starts_at, a.ends_at
      FROM public.appointments a
      JOIN public.booking_settings s ON s.psychologist_id = a.psychologist_id
     WHERE s.slug = lower(p_slug) AND s.enabled
       AND a.status IN ('scheduled', 'confirmed', 'completed')
       AND a.starts_at < LEAST(p_to, p_from + INTERVAL '60 days')
       AND a.ends_at > p_from
    UNION ALL
    SELECT r.requested_start, r.requested_end
      FROM public.booking_requests r
      JOIN public.booking_settings s ON s.psychologist_id = r.psychologist_id
     WHERE s.slug = lower(p_slug) AND s.enabled
       AND r.status = 'pending'
       AND r.requested_start < LEAST(p_to, p_from + INTERVAL '60 days')
       AND r.requested_end > p_from;
$$;

-- 5c. Cria a solicitação. Todas as regras são revalidadas aqui.
-- Erros (mensagem = código, tratado pela página): booking_unavailable, invalid_input,
-- outside_hours, slot_taken, too_many_requests.
CREATE OR REPLACE FUNCTION public.create_booking_request(
    p_slug TEXT,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_start TIMESTAMPTZ,
    p_modality TEXT,
    p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_s        public.booking_settings;
    v_name     TEXT := btrim(COALESCE(p_name, ''));
    v_email    TEXT := lower(btrim(COALESCE(p_email, '')));
    v_phone    TEXT := NULLIF(btrim(COALESCE(p_phone, '')), '');
    v_message  TEXT := NULLIF(btrim(COALESCE(p_message, '')), '');
    v_end      TIMESTAMPTZ;
    v_local    TIMESTAMP;
    v_dow      INT;
    v_minutes  INT;
    v_w        JSONB;
    v_ws       INT;
    v_we       INT;
    v_ok       BOOLEAN := FALSE;
    v_id       UUID;
BEGIN
    SELECT * INTO v_s FROM public.booking_settings WHERE slug = lower(p_slug) AND enabled;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'booking_unavailable' USING ERRCODE = 'P0001';
    END IF;

    IF char_length(v_name) NOT BETWEEN 2 AND 120
       OR char_length(v_email) > 160
       OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
       OR (v_phone IS NOT NULL AND char_length(v_phone) > 30)
       OR (v_message IS NOT NULL AND char_length(v_message) > 1000)
       OR p_start IS NULL
       OR p_modality IS NULL OR NOT (p_modality = ANY (v_s.modalities)) THEN
        RAISE EXCEPTION 'invalid_input' USING ERRCODE = 'P0001';
    END IF;

    v_end := p_start + make_interval(mins => v_s.slot_minutes);

    IF p_start < NOW() + make_interval(hours => v_s.min_notice_hours)
       OR p_start > NOW() + make_interval(days => v_s.max_days_ahead) THEN
        RAISE EXCEPTION 'outside_hours' USING ERRCODE = 'P0001';
    END IF;

    -- O horário precisa cair dentro de uma janela de atendimento e alinhado ao tamanho do slot.
    v_local   := p_start AT TIME ZONE v_s.timezone;
    v_dow     := EXTRACT(DOW FROM v_local)::INT;
    v_minutes := EXTRACT(HOUR FROM v_local)::INT * 60 + EXTRACT(MINUTE FROM v_local)::INT;

    FOR v_w IN SELECT * FROM jsonb_array_elements(COALESCE(v_s.weekly_hours -> v_dow::TEXT, '[]'::JSONB)) LOOP
        v_ws := split_part(v_w ->> 'start', ':', 1)::INT * 60 + split_part(v_w ->> 'start', ':', 2)::INT;
        v_we := split_part(v_w ->> 'end', ':', 1)::INT * 60 + split_part(v_w ->> 'end', ':', 2)::INT;
        IF v_minutes >= v_ws
           AND v_minutes + v_s.slot_minutes <= v_we
           AND EXTRACT(SECOND FROM v_local) = 0
           AND (v_minutes - v_ws) % v_s.slot_minutes = 0 THEN
            v_ok := TRUE;
        END IF;
    END LOOP;

    IF NOT v_ok THEN
        RAISE EXCEPTION 'outside_hours' USING ERRCODE = 'P0001';
    END IF;

    -- Horário já ocupado por atendimento ou por outra solicitação pendente.
    IF EXISTS (
        SELECT 1 FROM public.appointments a
         WHERE a.psychologist_id = v_s.psychologist_id
           AND a.status IN ('scheduled', 'confirmed', 'completed')
           AND a.starts_at < v_end AND a.ends_at > p_start
    ) OR EXISTS (
        SELECT 1 FROM public.booking_requests r
         WHERE r.psychologist_id = v_s.psychologist_id
           AND r.status = 'pending'
           AND r.requested_start < v_end AND r.requested_end > p_start
    ) THEN
        RAISE EXCEPTION 'slot_taken' USING ERRCODE = 'P0001';
    END IF;

    -- Limites contra abuso: por e-mail e total de pendentes por psicólogo.
    IF (SELECT COUNT(*) FROM public.booking_requests
         WHERE psychologist_id = v_s.psychologist_id AND status = 'pending' AND lower(email) = v_email) >= 3
       OR (SELECT COUNT(*) FROM public.booking_requests
            WHERE psychologist_id = v_s.psychologist_id AND status = 'pending') >= 100 THEN
        RAISE EXCEPTION 'too_many_requests' USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO public.booking_requests (psychologist_id, patient_name, email, phone, requested_start, requested_end, modality, message)
    VALUES (v_s.psychologist_id, v_name, v_email, v_phone, p_start, v_end, p_modality, v_message)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_booking_info(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_busy_slots(TEXT, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_booking_request(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booking_info(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_busy_slots(TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_request(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO anon, authenticated;

-- --------------------------------------------------------------------
-- 6. Tempo real: o psicólogo vê a solicitação chegar sem recarregar a página.
-- --------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

COMMIT;
