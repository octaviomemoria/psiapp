# Plano de Ação & QA Completo - PsiApp Produção

## Objetivo
Corrigir todos os problemas de usabilidade, renderização de modais (portal), contraste de botões, persistência de sessões, autenticação Supabase e implementar um plano rigoroso de QA para 100% dos formulários, botões e fluxos em produção.

---

## 1. Correções Imediatas de UI / UX & Modais
- [ ] **Modal Portal (`src/components/ui/Modal.tsx`)**: Implementar `createPortal(..., document.body)` para desvincular os modais de qualquer container com `backdrop-filter` ou `transform` (como a `glass-header`), garantindo que o modal de Login/Cadastro abra centralizado, espaçoso e 100% visível em qualquer resolução.
- [ ] **Contraste dos Botões do Banner (`src/components/psychologist/DashboardView.tsx`)**: Substituir classes conflitantes nos botões "Convidar Paciente" e "Registrar Sessão" para garantir contraste perfeito no fundo escuro (fundo translúcido `bg-white/10 text-white border-white/20 hover:bg-white/20` ou botão sólido destacado).
- [ ] **Feedback e Persistência de Sessões (`src/components/psychologist/SessionFormModal.tsx` & `LiveSessionModal.tsx`)**: Adicionar notificação de confirmação e garantir que `addSession` e `updateSession` atualizem o estado reativo e o banco Supabase em tempo real.
- [ ] **Fluxo de Autenticação / Modo Produção (`src/components/auth/AuthModal.tsx` & `src/lib/store/psi-context.tsx`)**: Garantir que o usuário consiga se cadastrar como psicólogo ou entrar com sua conta real, carregando seu consultório limpo e sincronizado com o Supabase.

---

## 2. Revisão e Auditoria de Formulários, Botões e Links
- [ ] **Formulário de Sessão (`SessionFormModal.tsx` & `LiveSessionModal.tsx`)**: Validação de campos obrigatórios (paciente, data, tópicos, SOAP), contagem de tempo, anotações de sigilo e persistência.
- [ ] **Formulário de Pacientes (`PatientListView.tsx`)**: Validação de nome, e-mail, telefone, data de nascimento, contato de emergência e cálculo de idade.
- [ ] **Formulário de Convite de Paciente (`PatientInviteModal.tsx`)**: Geração de token criptografado, link copiável e integração com WhatsApp Web.
- [ ] **Formulário de Objetivos / Metas (`PatientDetailView.tsx`)**: Adição de metas terapêuticas, status e barra de progresso (0-100%).
- [ ] **Formulário de Exercícios Terapêuticos (`ExerciseBuilderModal.tsx`)**: Construtor dinâmico de campos (texto, escala, múltipla escolha), instruções e atribuição direta.
- [ ] **Formulário de Escalas Psicométricas (`PsychometricScalesModal.tsx`)**: PHQ-9 e GAD-7 com escore automático, classificação de gravidade e alerta de risco.
- [ ] **Formulário Financeiro & Recibos (`FinancialModal.tsx`)**: Controle de pagamentos (Pix/Cartão/Convênio) e geração de recibo CFP para impressão/PDF.
- [ ] **Formulários do Paciente (`BetweenSessionsHub.tsx`, `DiaryView.tsx`, `PatientHomeView.tsx`)**: Diário emocional com trava de privacidade (LGPD), check-in de humor (1-5) e player de âncoras de voz.

---

## 3. Matriz de Testes de QA (Execução Passo a Passo)
- [ ] **QA 01 - Autenticação & Cadastro**: Cadastro de nova psicóloga, login, logout, alternância para modo demo.
- [ ] **QA 02 - Banner & Navegação**: Visibilidade dos botões do dashboard, troca de abas (Dashboard, Agenda, Pacientes, Biblioteca, Financeiro).
- [ ] **QA 03 - Gestão de Pacientes & Convites**: Cadastro manual de paciente, geração de convite WhatsApp, abertura de prontuário 360°.
- [ ] **QA 04 - Atendimento Clínico & Sessões**: Início de sessão ao vivo (50min com alertas a 40min e 48min), preenchimento SOAP com IA, registro de notas privadas, registro manual de sessão.
- [ ] **QA 05 - Escalas & Ferramentas Clínicas**: Aplicação de PHQ-9/GAD-7, conceituação cognitiva TCC/ACT, âncoras de áudio.
- [ ] **QA 06 - Visão do Paciente (Entre Sessões)**: Registro de humor diário, diário reflexivo privado vs compartilhado, execução de exercícios atribuídos.
- [ ] **QA 07 - Financeiro & Recibos**: Emissão de recibo profissional com numeração e dados de CRP.

---

## 4. Build, Validação de Tipos & Deploy
- [ ] Executar `npm run build` localmente para garantir 0 erros de TypeScript e Next.js.
- [ ] Commit e push para o GitHub `main` disparando deploy na Vercel (`https://psiapp-chi.vercel.app`).
- [ ] Validação no navegador e documentação no `walkthrough.md`.
