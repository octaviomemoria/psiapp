-- ==============================================================================
-- PSIAPP - MÓDULO FINANCEIRO COMPLETO (RECEITAS, DESPESAS, PACOTES & LIVRO CAIXA)
-- ==============================================================================

-- 1. Categorias Financeiras
CREATE TABLE IF NOT EXISTS financial_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT DEFAULT 'tag',
    color TEXT DEFAULT '#0d9488',
    is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Pacotes de Sessões Terapêuticas
CREATE TABLE IF NOT EXISTS patient_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_sessions INT NOT NULL DEFAULT 4,
    sessions_completed INT NOT NULL DEFAULT 0,
    total_price NUMERIC(10,2) NOT NULL,
    session_unit_price NUMERIC(10,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Transações Financeiras (Livro Caixa: Entradas & Saídas)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    package_id UUID REFERENCES patient_packages(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    
    amount NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
    
    payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'boleto', 'insurance_reimbursement')),
    
    receipt_number TEXT,
    financial_responsible_name TEXT,
    financial_responsible_cpf TEXT,
    is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
    receipt_pdf_url TEXT,
    receipt_notes TEXT,
    
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_period TEXT CHECK (recurrence_period IN ('monthly', 'yearly', 'weekly')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS "Psychologists manage own categories" ON financial_categories;
CREATE POLICY "Psychologists manage own categories" ON financial_categories
    FOR ALL TO authenticated
    USING (
        psychologist_id IS NULL OR psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Psychologists manage own packages" ON patient_packages;
CREATE POLICY "Psychologists manage own packages" ON patient_packages
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Psychologists manage own transactions" ON financial_transactions;
CREATE POLICY "Psychologists manage own transactions" ON financial_transactions
    FOR ALL TO authenticated
    USING (
        psychologist_id IN (
            SELECT id FROM psychologists WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );
