-- ==============================================================================
-- PSISaaS / PSIAPP - SEED DE DADOS INICIAIS DEMONSTRATIVOS
-- Dra. Ana Martins + 5 Pacientes com histórico clínico completo
-- ==============================================================================

-- 1. Perfis
INSERT INTO profiles (id, full_name, display_name, email, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Dra. Ana Martins', 'Dra. Ana', 'ana.martins@psisaas.com.br', '(11) 98765-4321', 'psychologist'),
('22222222-2222-2222-2222-222222222221', 'Mariana Costa', 'Mariana', 'mariana.costa@email.com', '(11) 99111-2233', 'patient'),
('22222222-2222-2222-2222-222222222222', 'Pedro Almeida', 'Pedro', 'pedro.almeida@email.com', '(11) 99222-3344', 'patient'),
('22222222-2222-2222-2222-222222222223', 'Fernanda Lima', 'Fernanda', 'fernanda.lima@email.com', '(11) 99333-4455', 'patient'),
('22222222-2222-2222-2222-222222222224', 'Carlos Oliveira', 'Carlos', 'carlos.oliveira@email.com', '(11) 99444-5566', 'patient'),
('22222222-2222-2222-2222-222222222225', 'Juliana Rocha', 'Juliana', 'juliana.rocha@email.com', '(11) 99555-6677', 'patient')
ON CONFLICT (id) DO NOTHING;

-- 2. Psicóloga
INSERT INTO psychologists (id, profile_id, crp_number, crp_state, approach, specialties, bio) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '06/123456', 'SP', 'Terapia Cognitivo-Comportamental (TCC)', ARRAY['Ansiedade', 'Burnout', 'Autoestima', 'Regulação Emocional'], 'Psicóloga Clínica especialista em TCC e Mindfulness com 8 anos de experiência no acompanhamento de adultos.')
ON CONFLICT (id) DO NOTHING;

-- 3. Pacientes
INSERT INTO patients (id, linked_profile_id, full_name, birth_date, gender, email, phone, status, started_at, clinical_notes_overview) VALUES
('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222221', 'Mariana Costa', '1994-05-12', 'Feminino', 'mariana.costa@email.com', '(11) 99111-2233', 'active', '2026-02-10', 'Demanda principal: Transtorno de ansiedade generalizada (TAG) e pensamentos intrusivos sobre desempenho profissional.'),
('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Pedro Almeida', '1988-11-24', 'Masculino', 'pedro.almeida@email.com', '(11) 99222-3344', 'active', '2026-03-01', 'Demanda principal: Transição de carreira e sintomas de esgotamento/burnout.'),
('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222223', 'Fernanda Lima', '1997-08-30', 'Feminino', 'fernanda.lima@email.com', '(11) 99333-4455', 'active', '2026-01-15', 'Demanda principal: Fortalecimento da autoestima e limites em relações afetivas.'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222224', 'Carlos Oliveira', '1982-03-18', 'Masculino', 'carlos.oliveira@email.com', '(11) 99444-5566', 'active', '2026-04-05', 'Demanda principal: Estresse crônico, irritabilidade e dificuldades de desconexão do trabalho.'),
('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222225', 'Juliana Rocha', '1991-09-05', 'Feminino', 'juliana.rocha@email.com', '(11) 99555-6677', 'active', '2026-05-20', 'Demanda principal: Comunicação assertiva, síndrome da impostora e organização de rotina.')
ON CONFLICT (id) DO NOTHING;

-- 4. Relações
INSERT INTO psychologist_patient_relationships (psychologist_id, patient_id, status, started_at) VALUES
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444441', 'active', '2026-02-10'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444442', 'active', '2026-03-01'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444443', 'active', '2026-01-15'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'active', '2026-04-05'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444445', 'active', '2026-05-20')
ON CONFLICT DO NOTHING;
