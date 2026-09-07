# Plano Diretor: Transformação do MVP em SaaS Clínico Premium de Produção

## Objetivo
Definir o roadmap técnico, de produto, de conformidade legal (CFP/LGPD) e de infraestrutura necessário para elevar o PsiApp de um MVP funcional para uma plataforma SaaS Premium, escalável, segura e pronta para comercialização em larga escala para clínicas e psicólogos autônomos.

---

## Fases do Roadmap

### Fase 1: Arquitetura, Roteamento & Refatoração de Estado (Fundação Sólida)
- [x] **Descentralização do `page.tsx` para Next.js App Router Nativo**:
  - Criadas 23 rotas reais com layouts dedicados cobrindo os 4 papéis do sistema:
    - **Psicólogo**: `/psicologo/dashboard`, `/psicologo/pacientes`, `/psicologo/pacientes/[id]`, `/psicologo/agenda`, `/psicologo/biblioteca`, `/psicologo/financeiro`.
    - **Paciente**: `/paciente/inicio`, `/paciente/entre-sessoes`, `/paciente/diario`, `/paciente/evolucao`, `/paciente/perfil`.
    - **Gerente da Clínica**: `/gerente/dashboard`, `/gerente/equipe`, `/gerente/pacientes`, `/gerente/financeiro`, `/gerente/salas`.
    - **SuperAdmin**: `/superadmin/dashboard`, `/superadmin/clinicas`, `/superadmin/planos`, `/superadmin/auditoria`.
  - Deep-linking real habilitado com histórico do navegador e compatibilidade integral com a página demonstrativa central.
- [ ] **Migração do Estado Monolítico (`psi-context.tsx`) para TanStack Query + Zustand**:
  - Planejada separação entre server-state paginado e client-state.
- [x] **Edge Middleware para Segurança de Sessão**:
  - `src/middleware.ts` com cabeçalhos de segurança rígidos (HSTS, NoSniff, X-Frame-Options DENY, Permissions-Policy para câmera/mic restrita) e inspeção de tokens JWT.

### Fase 2: Segurança Nível Saúde, Auditoria CFP & Criptografia
- [x] **Criptografia de Dados Sensíveis de Prontuário**:
  - Implementado `src/lib/crypto/encryption.ts` com WebCrypto API (AES-GCM-256 + PBKDF2 com salt aleatório de 16 bytes e IV de 12 bytes) para cifrar relatos confidenciais e notas privadas de supervisão.
- [x] **Trilha de Auditoria Imutável (CFP 001/2009 e 004/2020)**:
  - Script SQL `supabase/migrations/02_audit_trail_immutable.sql` com tabela append-only (`clinical_audit_log`), sem permissão de UPDATE ou DELETE via RLS e triggers de banco automáticos.
- [x] **Autenticação Segura & MFA (Multi-Factor Authentication)**:
  - Implementado `src/lib/auth/two-factor.ts` com gerador e validador TOTP (RFC 6238) padrão Google Authenticator/Authy, URIs `otpauth://`, 8 códigos descartáveis de backup e testes com 100% de sucesso.
  - Criado `src/components/auth/TwoFactorSetupModal.tsx` integrado ao cabeçalho.
- [x] **Validação Digital de Documentos Clínicos por Hash & QR Code (CFP 006/2019)**:
  - Implementado `src/lib/crypto/document-verifier.ts` com hash criptográfico SHA-256 e suíte de testes.
  - Atualizado `src/components/psychologist/ClinicalReportModal.tsx` com selo de autenticidade digital e QR Code.
  - Criada a rota pública de validação judicial e médica em `src/app/validar/[hash]/page.tsx`.

### Fase 3: Telepsicologia Nativa & Comunicação Integrada (CFP 009/2024)
- [x] **Sala de Teleconsulta Integrada (WebRTC Ready)**:
  - Implementado `src/components/psychologist/TelepsychologyCockpitModal.tsx` com interface dividida:
    - Transmissão de vídeo com indicador de latência, status de rede e Picture-in-Picture.
    - Sala de espera virtual com verificação prévia de fone de ouvido e ambiente privativo.
    - Prontuário SOAP em tempo real com **autosave contínuo a cada 5 segundos no localStorage** para prevenir perda de dados em oscilações de rede.
    - Criptografia automática de anotações privadas com AES-256 ao finalizar sessão.
    - Botão de saída rápida / emergência.
- [x] **Mensageria Segura In-App com Controle Ético de Horário & Triagem de Crise**:
  - Implementado `src/components/common/SecureChatModal.tsx` com criptografia de ponta a ponta (E2EE), barreira de expediente configurável (aviso aos limites terapêuticos fora do horário) e gatilho automático de acolhimento de crise com discagem direta para CVV 188 e SAMU 192.
  - Integrado ao `Header.tsx` para psicólogo e paciente.

### Fase 4: Monetização, Faturamento SaaS & Cobrança de Pacientes
- [x] **Módulo de Cobrança de Sessões via Pix Dinâmico**:
  - Implementado `src/lib/billing/payment-service.ts` com geração de BRCode copia-e-cola, QR Code dinâmico com expiração de 30min e cálculo de split de honorários.
  - Criado `src/components/common/PixPaymentModal.tsx` com contador regressivo, botão de cópia com feedback, simulação de webhook de confirmação bancária e emissão automática de recibo CFP com número de registro e CRP.
- [x] **Billing SaaS de Assinaturas & Planos**:
  - Implementado `src/components/common/SaaSSubscriptionModal.tsx` com seleção de planos (*Autônomo*, *Clínica Pro*, *Enterprise*), faturamento mensal/anual com desconto de 20%, checkout transparente e simulação de ativação instantânea integrada ao Header.
- [x] **Rota de Webhook Real de Pagamento (Asaas / Stripe / Pix)**:
  - Criado `src/app/api/billing/webhook/route.ts` com validação de token secreto, atualização automática de sessões para `paid_pix` no Supabase, registro na trilha de auditoria e processamento de renovação de assinaturas.
- [x] **Exportação Contábil & Financeira para Excel/CSV**:
  - Implementado `src/lib/billing/export-financial.ts` gerando arquivos compatíveis com o Excel no Brasil (UTF-8 BOM, ponto-e-vírgula e vírgula decimal) com demonstrativo de honorários brutos, taxas e valores líquidos.
- [x] **Personalização White-Label da Clínica**:
  - Implementado `src/components/common/ClinicBrandingModal.tsx` permitindo que a clínica defina nome institucional, slogan, paleta de cores (Teal, Indigo, Emerald, Rose, Slate), CNPJ, endereço e telefone para emissão automática em recibos e laudos.

### Fase 5: Experiência Mobile & PWA
- [x] **PWA Manifest & Metadados Mobile Nativos**:
  - Criado `public/manifest.json` com configurações de standalone, orientações e cores de tema (`#0D9488`).
  - Criado `public/icon.svg` com ícone clínico de alta fidelidade.
  - Atualizado `src/app/layout.tsx` com metadados PWA, viewport dinâmico e Apple Web App tags.
- [x] **Service Worker & Operação Offline-First**:
  - Implementado `public/sw.js` com estratégia Network-First e cache de ferramentas de emergência emocional (TIPP, 5-4-3-2-1, Respiração 4-7-8) e diário para que o paciente nunca fique desassistido sem internet.
  - Criado `src/components/common/PwaRegistration.tsx` com alerta automático de status offline e sincronização ao restabelecer rede.
- [ ] **Empacotamento Nativo via Capacitor / Ionic**:
  - Biometria nativa e Push Notifications via Firebase Cloud Messaging.

### Fase 6: Engenharia de Confiabilidade, Testes & Observabilidade
- [x] **Observabilidade Médica & Sanitização LGPD (Art. 11)**:
  - Implementado `src/lib/monitoring/logger.ts` com mascaramento automático de CPFs, senhas, tokens de autenticação e hipóteses diagnósticas antes de qualquer envio de telemetria.
- [x] **Despachante Multicanal de Notificações (WhatsApp + E-mail)**:
  - Implementado `src/lib/notifications/dispatcher.ts` e endpoint seguro `src/app/api/notifications/send/route.ts` para lembretes de sessão 24h e 2h antes (com orientações de sigilo e sala criptografada).
- [x] **Portabilidade de Prontuário Clínico & Dossiê Interoperável (LGPD Art. 18 / CFP 001/2009)**:
  - Implementado `src/lib/export/medical-record-export.ts` com metadados jurídicos, respeito estrito à privacidade de diários não autorizados e modal `ExportRecordModal.tsx`.
- [x] **Onboarding e Anamnese Digital Pública do Paciente**:
  - Implementada rota pública `/onboarding/[token]` para preenchimento de ficha cadastral e consentimento informado LGPD.
- [x] **Segurança da Conta & Gestão de Sessões Ativas**:
  - Implementado `src/components/common/AccountSecurityModal.tsx` com visualização de dispositivos ativos, revogação de sessões e alteração de senha.
- [x] **Suíte de Testes Automatizados & Script `npm test`**:
  - Módulo puro `src/lib/utils/psychometrics.ts` (PHQ-9 e GAD-7) com suíte unitária `src/lib/utils/psychometrics.test.ts` (7/7 aprovados).
  - Módulo puro `src/lib/auth/two-factor.ts` (RFC 6238 TOTP) com suíte unitária `src/lib/auth/two-factor.test.ts` (7/7 aprovados).
  - Módulo puro `src/lib/crypto/document-verifier.ts` (SHA-256) com suíte unitária `src/lib/crypto/document-verifier.test.ts` (3/3 aprovados).
  - Módulo puro `src/lib/monitoring/logger.ts` (Sanitização LGPD) com suíte unitária `src/lib/monitoring/logger.test.ts` (4/4 aprovados).
  - Módulo puro `src/lib/billing/export-financial.ts` (Exportador CSV Excel) com suíte unitária `src/lib/billing/export-financial.test.ts` (3/3 aprovados).
  - Módulo puro `src/lib/notifications/dispatcher.ts` (WhatsApp + E-mail) com suíte unitária `src/lib/notifications/dispatcher.test.ts` (3/3 aprovados).
  - Módulo puro `src/lib/export/medical-record-export.ts` (Dossiê LGPD) com suíte unitária `src/lib/export/medical-record-export.test.ts` (3/3 aprovados).
  - Total: **30 testes unitários automatizados com 100% de sucesso**.
  - Script `"test"` configurado em `package.json`.
- [x] **Pipeline de CI/CD (GitHub Actions)**:
  - Criado `.github/workflows/ci.yml` executando lint, testes unitários e build de produção a cada push/PR.
- [x] **Build de Produção Validado**:
  - `npm run build` executado com **Exit Code 0**, gerando 25 rotas (23 estáticas + `/onboarding/[token]` + `/validar/[hash]` + 6 API routes) e middleware Edge de 26.7 kB com zero erros de lint ou tipos.

---

## Critérios de Sucesso para "Produção Premium"
1. **LTV e Retenção do Psicólogo:** O terapeuta utiliza o sistema diariamente como sua principal ferramenta de trabalho e prontuário legal.
2. **Zero Fricção para o Paciente:** O paciente baixa o app pelo link do convite, faz login biometria e realiza os exercícios entre sessões com prazer estético e acolhimento.
3. **Auditabilidade Total:** 100% de conformidade com exigências éticas do CFP e jurídicas da LGPD.
4. **Auto-sustentabilidade Financeira:** Fluxo de pagamento e cobrança de assinaturas 100% automatizado, sem intervenção manual.

