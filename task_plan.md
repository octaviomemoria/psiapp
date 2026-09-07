# Plano Diretor: Transformação do MVP em SaaS Clínico Premium de Produção

## Objetivo
Definir o roadmap técnico, de produto, de conformidade legal (CFP/LGPD) e de infraestrutura necessário para elevar o PsiApp de um MVP funcional para uma plataforma SaaS Premium, escalável, segura e pronta para comercialização em larga escala para clínicas e psicólogos autônomos.

---

## Fases do Roadmap

### Fase 1: Arquitetura, Roteamento & Refatoração de Estado (Fundação Sólida)
- [ ] **Descentralização do `page.tsx` para Next.js App Router Nativo**:
  - Criar grupos de rotas com layouts dedicados: `app/(auth)/...`, `app/(psicologo)/...`, `app/(paciente)/...`, `app/(clinica)/...`, `app/(admin)/...`.
  - Permitir deep linking real e navegação por URL (`/psicologo/pacientes/[id]`, `/paciente/diario`, etc.).
- [ ] **Migração do Estado Monolítico (`psi-context.tsx`) para TanStack Query + Zustand**:
  - Separar estado de servidor (cache, sincronização, revalidação e paginação no PostgreSQL) de estado de interface (modais, filtros, menus).
  - Implementar paginação e busca no lado do servidor (eliminar carregamento de dados maciços em memória).
- [ ] **Edge Middleware para Segurança de Sessão**:
  - `middleware.ts` com validação de tokens JWT do Supabase antes de entregar qualquer página privada.
  - Bloqueio de acesso entre papéis (ex: paciente tentando acessar rotas de psicólogo ou gerente).

### Fase 2: Segurança Nível Saúde, Auditoria CFP & Criptografia
- [ ] **Criptografia de Dados Sensíveis de Prontuário**:
  - Criptografia em repouso das anotações confidenciais (`session_private_notes`) e relatos íntimos de diário com Envelope Encryption ou Web Crypto.
- [ ] **Trilha de Auditoria Imutável (CFP 001/2009 e 004/2020)**:
  - Tabela append-only com trigger no banco registrando data/hora, IP, ID do profissional e ação para qualquer leitura, alteração ou exclusão de prontuário.
- [ ] **Autenticação Segura & MFA (Multi-Factor Authentication)**:
  - Ativação de 2FA via TOTP (Google Authenticator) obrigatório para profissionais de saúde.
  - Eliminar atalhos de "demo_mode" do bundle de produção pública, isolando-os em ambiente de staging/sandbox.
- [ ] **Assinatura Digital de Documentos Clínicos**:
  - Geração de laudos, relatórios e atestados com padrão PDF/A e assinatura com certificado digital (ICP-Brasil / PAdES / e-CPF).

### Fase 3: Telepsicologia Nativa & Comunicação Integrada (CFP 009/2024)
- [ ] **Sala de Teleconsulta Integrada (WebRTC via LiveKit / Daily.co)**:
  - Chamadas de vídeo criptografadas ponto a ponto embutidas no próprio app (sem depender de abrir abas de terceiros como Google Meet).
  - Sala de espera virtual ("Aguardando o paciente entrar"), teste de câmera/microfone antes da sessão.
  - Modo "Foco Clínico": tela dividida com prontuário SOAP e anotações à esquerda e vídeo do paciente à direita.
  - Botão de emergência na sala de chamada para encerramento imediato seguro.
- [ ] **Mensageria Segura In-App**:
  - Canal de recados e avisos com definição clara de horário de atendimento clínico (evita invasão do WhatsApp pessoal fora do expediente).

### Fase 4: Monetização, Faturamento SaaS & Cobrança de Pacientes
- [ ] **Billing SaaS de Assinaturas (Stripe ou Asaas)**:
  - Checkout transparente de planos (Autônomo, Clínica Pro, Enterprise).
  - Portal do cliente para autogestão de assinaturas, upgrade, downgrade, nota fiscal e histórico de faturas.
  - Webhooks de ativação/bloqueio automático de acesso por inadimplência (Dunning management).
- [ ] **Módulo de Cobrança de Sessões para o Paciente**:
  - Cobrança de consultas via Pix Dinâmico e Cartão de Crédito direto no portal do paciente.
  - Split de pagamento automático para a conta do psicólogo ou da clínica.
  - Emissão automática de recibo e nota fiscal após confirmação do webhook bancário.

### Fase 5: Experiência Mobile Nativa (iOS e Android)
- [ ] **Build Nativo via Capacitor / Ionic**:
  - Empacotamento de binários nativos para App Store e Google Play.
  - Suporte a Biometria (FaceID / TouchID / Impressão Digital) para desbloqueio rápido e seguro do app.
  - Push Notifications automáticas para lembretes de sessão, check-in diário de humor e novas atividades prescritas.
  - Modo Offline para o paciente (registro de diário/humor sem internet com sincronização posterior).

### Fase 6: Engenharia de Confiabilidade, Testes & Observabilidade
- [ ] **Suíte de Testes Automatizados**:
  - Testes unitários com Vitest para regras de negócio (cálculo de escores psicométricos PHQ-9/GAD-7, recibos, RLS).
  - Testes E2E com Playwright para fluxos essenciais (login, criação de sessão, envio de diário, pagamento).
- [ ] **Observabilidade em Produção**:
  - Integração com Sentry para rastreamento de erros e exceções em tempo real.
  - PostHog / Plausible para telemetria de produto estritamente anônima (sem envio de dados sensíveis de saúde).
  - Rotina de Backups automatizados do PostgreSQL com Point-in-Time Recovery (PITR).

---

## Critérios de Sucesso para "Produção Premium"
1. **LTV e Retenção do Psicólogo:** O terapeuta utiliza o sistema diariamente como sua principal ferramenta de trabalho e prontuário legal.
2. **Zero Fricção para o Paciente:** O paciente baixa o app pelo link do convite, faz login biometria e realiza os exercícios entre sessões com prazer estético e acolhimento.
3. **Auditabilidade Total:** 100% de conformidade com exigências éticas do CFP e jurídicas da LGPD.
4. **Auto-sustentabilidade Financeira:** Fluxo de pagamento e cobrança de assinaturas 100% automatizado, sem intervenção manual.

