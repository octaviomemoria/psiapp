# Plano de Revisão Ponta a Ponta, Contas de Teste e Módulos Gerente & SuperAdmin

## 🎯 Objetivo
Realizar uma auditoria e revisão ponta a ponta no PsiApp, criar os 4 usuários de teste padrão solicitados com login rápido, e implementar as suítes completas de **Administração do Gerente (Dono da Clínica)** — com estrito sigilo ético CFP/LGPD — e do **SuperAdmin (Dono do Sistema SaaS Multi-Tenant)**.

---

## 👥 Usuários de Teste Pré-Configurados (1-Click & Credenciais)
1. **Paciente:** `paciente@teste.com` / `paciente@teste.com` (Perfil Paciente com acesso a diário, humor, metas e ferramentas)
2. **Psicólogo:** `psicologo@teste.com` / `psicologo@teste.com` (Perfil Dra. Ana Martins / Terapeuta com prontuário 360°)
3. **Gerente:** `gerente@teste.com` / `gerente@teste.com` (Perfil Dono da Clínica com gestão de profissionais, salas e financeiro)
4. **SuperAdmin:** `superadmin@teste.com` / `superadmin@teste.com` (Perfil Administrador do Sistema com gestão de clínicas e planos SaaS)

---

## 📋 Tarefas de Implementação

### 1. Tipagem & Modelo de Dados Multi-Role (`src/types/database.ts`)
- [x] Expandir `UserRole` para `'psychologist' | 'patient' | 'manager' | 'superadmin' | 'admin'`.
- [x] Definir interfaces para: `Clinic`, `ClinicPsychologist`, `ClinicRoom`, `SaaSTenant`, `SaaSPlan`, `PlatformMetric`.

### 2. Base de Dados Inicial & Armazenamento Reativo (`src/lib/store/`)
- [x] Cadastrar as 4 contas de teste em `initial-data.ts` com dados e credenciais reconhecidas.
- [x] Adicionar dados iniciais da clínica modelo (*Clínica Mente Saudável*), salas de atendimento e métricas SaaS em `initial-data.ts`.
- [x] Expandir `psi-context.tsx` para gerenciar os estados e ações do Gerente e do SuperAdmin com reatividade e persistência.

### 3. Módulo do Gerente (Dono da Clínica) — `src/components/manager/`
- [x] `ManagerNav.tsx`: Navegação em abas (Dashboard, Psicólogos da Equipe, Pacientes da Clínica, Financeiro Consolidado, Salas & Espaços).
- [x] `ManagerDashboardView.tsx`: KPIs da clínica (faturamento, ocupação de salas, profissionais ativos, total de sessões).
- [x] `ManagerPsychologistsView.tsx`: Escala, status, especialidades e repasses da equipe de terapeutas.
- [x] `ManagerPatientsView.tsx`: Cadastro institucional e distribuição/transferência de pacientes entre psicólogos.
- [x] `ManagerFinancialView.tsx`: Faturamento bruto, repasses da clínica, inadimplência e controle de recibos.
- [x] `ManagerRoomsView.tsx`: Gestão e status de ocupação das salas físicas e links virtuais.
- [x] **Barreira de Sigilo Ético CFP:** Proteção explícita impedindo acesso a notas de evolução, diários íntimos e RPDs.

### 4. Módulo do SuperAdmin (Dono do Sistema SaaS) — `src/components/superadmin/`
- [x] `SuperAdminNav.tsx`: Navegação em abas (Visão Geral SaaS, Gestão de Clínicas, Usuários Globais, Planos & MRR, Auditoria).
- [x] `SuperAdminDashboardView.tsx`: MRR da plataforma, clínicas ativas, total de psicólogos/pacientes e uptime do sistema.
- [x] `SuperAdminTenantsView.tsx`: Gestão de clínicas parceiras (status, limite de profissionais, ativação/bloqueio de tenant).
- [x] `SuperAdminPlansView.tsx`: Planos SaaS (Autônomo, Clínica Pro, Enterprise) e faturamento de assinaturas.
- [x] `SuperAdminAuditView.tsx`: Logs de auditoria, chamadas de IA, uso de storage e status de conformidade LGPD.

### 5. Revisão de Autenticação & Atalhos 1-Click (`src/components/auth/AuthModal.tsx` e `Header.tsx`)
- [x] Implementar botões de **Acesso Rápido de Teste (1-Click)** para os 4 perfis (`paciente@teste.com`, `psicologo@teste.com`, `gerente@teste.com`, `superadmin@teste.com`).
- [x] Atualizar o seletor de perfis no `Header.tsx` para permitir alternância fluida entre todos os 4 papéis.

### 6. Roteamento Principal (`src/app/page.tsx`)
- [x] Renderizar condicionalmente as views completas de Psicólogo, Paciente, Gerente e SuperAdmin conforme o `currentRole`.

### 7. Verificação de Build & Testes Ponta a Ponta
- [x] Executar `npm run build` e certificar 0 erros de TypeScript e de compilação.
- [x] Validar todos os fluxos de navegação e formulários de cada papel.
