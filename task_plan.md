# Plano de Ação & QA Completo - PsiApp Produção

## Objetivo
Corrigir todos os problemas de usabilidade, renderização de modais (portal), contraste de botões, persistência de sessões, autenticação Supabase e implementar um plano rigoroso de QA para 100% dos formulários, botões e fluxos em produção.

---

## 1. Correções Imediatas de UI / UX & Modais
- [x] **Modal Portal (`src/components/ui/Modal.tsx`)**: Implementado `createPortal(..., document.body)` com `z-[9999]` para desvincular os modais de qualquer container com `backdrop-filter` ou `transform` (como a `glass-header`), garantindo que o modal de Login/Cadastro abra centralizado, espaçoso e 100% visível em qualquer resolução.
- [x] **Contraste dos Botões do Banner (`src/components/psychologist/DashboardView.tsx`)**: Substituídas classes conflitantes nos botões "Convidar Paciente" e "Registrar Sessão" para garantir contraste perfeito no fundo escuro com estilo translúcido premium (`bg-white/15 text-white border-white/25 hover:bg-white/25 backdrop-blur-sm`).
- [x] **Feedback e Persistência de Sessões (`src/components/psychologist/SessionFormModal.tsx` & `LiveSessionModal.tsx`)**: Adicionada notificação de confirmação (`addNotification`) e garantido que `addSession` e `updateSession` atualizem o estado reativo e o banco Supabase em tempo real.
- [x] **Fluxo de Autenticação / Modo Produção (`src/components/auth/AuthModal.tsx` & `src/lib/store/psi-context.tsx`)**: Modal de autenticação integrado com cadastro completo de psicóloga (incluindo CRP, UF e Abordagem Teórica) e login seguro com Supabase Auth.

---

## 2. Revisão e Auditoria de Formulários, Botões e Links
- [x] **Formulário de Sessão (`SessionFormModal.tsx` & `LiveSessionModal.tsx`)**: Validação de campos obrigatórios (paciente, data, tópicos, SOAP), contagem de tempo, anotações de sigilo e persistência garantida.
- [x] **Formulário de Pacientes (`PatientListView.tsx`)**: Validação de nome, e-mail, telefone, data de nascimento, contato de emergência e cálculo de idade.
- [x] **Formulário de Convite de Paciente (`PatientInviteModal.tsx` & `page.tsx`)**: Geração de token criptografado, link copiável, integração com WhatsApp Web e detecção automática via `?invite=token`.
- [x] **Formulário de Objetivos / Metas (`PatientDetailView.tsx`)**: Adição de metas terapêuticas com vínculo dinâmico do psicólogo (`currentPsychologist.id`), status e barra de progresso (0-100%).
- [x] **Formulário de Exercícios Terapêuticos (`ExerciseBuilderModal.tsx`)**: Construtor dinâmico de campos (texto, escala, múltipla escolha), instruções e atribuição direta.
- [x] **Formulário de Escalas Psicométricas (`PsychometricScalesModal.tsx`)**: PHQ-9 e GAD-7 com escore automático, classificação de gravidade e alerta de risco.
- [x] **Formulário Financeiro & Recibos (`FinancialModal.tsx`)**: Controle de pagamentos (Pix/Cartão/Convênio) e geração de recibo CFP para impressão/PDF.
- [x] **Formulários do Paciente (`BetweenSessionsHub.tsx`, `DiaryView.tsx`, `PatientHomeView.tsx`)**: Diário emocional com trava de privacidade (LGPD), check-in de humor (1-5) e player de âncoras de voz.

---

## 3. Matriz de Testes de QA (Execução Passo a Passo)
- [x] **QA 01 - Autenticação & Cadastro**: Cadastro de nova psicóloga com CRP e abordagem teórica, login, logout e modo nuvem.
- [x] **QA 02 - Banner & Navegação**: Visibilidade dos botões do dashboard, troca de abas (Dashboard, Agenda, Pacientes, Biblioteca, Financeiro).
- [x] **QA 03 - Gestão de Pacientes & Convites**: Cadastro manual de paciente, geração de convite WhatsApp, abertura de prontuário 360°.
- [x] **QA 04 - Atendimento Clínico & Sessões**: Início de sessão ao vivo (50min com alertas a 40min e 48min), preenchimento SOAP com IA, registro de notas privadas, registro manual de sessão com notificação.
- [x] **QA 05 - Escalas & Ferramentas Clínicas**: Aplicação de PHQ-9/GAD-7, conceituação cognitiva TCC/ACT, âncoras de áudio.
- [x] **QA 06 - Visão do Paciente (Entre Sessões)**: Registro de humor diário, diário reflexivo privado vs compartilhado, execução de exercícios atribuídos.
- [x] **QA 07 - Financeiro & Recibos**: Emissão de recibo profissional com numeração e dados de CRP.

---

## 4. Build, Validação de Tipos & Deploy
- [x] Executado `npm run build` localmente com 0 erros de TypeScript e Next.js.
- [x] Commit e push realizados para o GitHub `main` disparando deploy na Vercel (`https://psiapp-chi.vercel.app`).
- [x] Validação completa no navegador e documentação registrada no `walkthrough.md`.
