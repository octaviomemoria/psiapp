# Descobertas Técnicas e Diagnóstico de Gaps: MVP vs. Produção Premium (PsiApp)

## 1. Contexto e Diagnóstico do MVP Atual
- **Framework & Roteamento:** Next.js 14 App Router, porém implementado como monólito de visualização controlada por abas em `src/app/page.tsx`. Falta deep-linking real via rotas de URL (`/psicologo/pacientes/[id]`, `/paciente/diario`, etc.).
- **Gerenciamento de Estado:** Construto monolítico em `psi-context.tsx` (~52KB) que carrega coleções inteiras em memória (`initial-data.ts`, ~68KB), salva em `localStorage` e tenta sincronizar de forma pontual com o Supabase.
- **Autenticação:** Mecanismo híbrido com alternância manual de 4 perfis (`psychologist`, `patient`, `manager`, `superadmin`) para testes rápidos. O modo `demo_mode` ainda convive com o `supabase_live` no mesmo fluxo de runtime.
- **Conformidade Ética & LGPD:** Princípios basilares (CFP 001/2009 e 004/2020) já estruturados no schema (`session_private_notes`, termos com hash SHA-256 e privacidade do diário).

---

## 2. Matriz de Gaps Críticos para Padrão "Produção Premium"

### A. Arquitetura de Software & Roteamento
| Aspecto | Estado MVP Atual | Padrão Produção Premium |
|---|---|---|
| **Roteamento** | Monopágina (`page.tsx`) com render condicional de tabs em React state. | App Router real com layouts aninhados (`/app/(dashboard)/psicologo/...`, `/app/(portal)/paciente/...`). Permite deep linking, histórico do navegador, SEO e Server Components granulares. |
| **Gerenciamento de Estado** | `psi-context.tsx` monolítico mantendo coleções completas em RAM + `localStorage`. | TanStack Query (React Query) com invalidação granular de cache, paginação no banco (Postgres), mutações otimistas e separação estrita entre server-state e UI-state. |
| **Proteção de Acesso & Middleware** | Verificação no lado cliente. | `middleware.ts` do Next.js validando tokens JWT Supabase nas bordas (Edge), barrando acesso não autorizado antes mesmo de entregar o bundle de scripts. |

### B. Segurança, LGPD e Conformidade CFP
| Aspecto | Estado MVP Atual | Padrão Produção Premium |
|---|---|---|
| **Criptografia de Prontuário** | Dados em texto claro nas colunas do PostgreSQL com RLS. | Criptografia em repouso com Envelope Encryption (KMS ou chaves derivadas do usuário) para anotações confidenciais e prontuários SOAP. |
| **Trilha de Auditoria (Audit Trail)** | Logs em memória ou tabela simples. | Log de auditoria imutável (append-only) via triggers de banco para qualquer leitura/edição de prontuário, exigência explícita do CFP para validade jurídica. |
| **Assinatura Digital de Documentos** | Desenho em Canvas + hash SHA-256 local. | Integração com assinatura digital qualificada (ICP-Brasil / PAdES) para laudos, atestados e relatórios psicológicos. |
| **2FA / MFA** | Login apenas por e-mail/senha ou clique rápido. | Autenticação Multifator obrigatória (TOTP via Google Authenticator ou SMS/WhatsApp) para psicólogos e administradores de clínicas. |

### C. Telepsicologia & Comunicação (CFP 009/2024)
| Aspecto | Estado MVP Atual | Padrão Produção Premium |
|---|---|---|
| **Teleconsulta** | Links externos manuais (Google Meet / Zoom / WhatsApp). | Sala de teleconsulta embutida (WebRTC via LiveKit ou Daily.co) com criptografia E2EE, sala de espera virtual, medição de conexão, verificação de privacidade e sem gravação inadvertida. |
| **Chat & Mensageria** | Apenas links para WhatsApp (`wa.me`). | Chat clínico seguro in-app com controle de horário de atendimento, status de entrega e isolamento de contatos privados. |

### D. Monetização, Faturamento & Financeiro B2B
| Aspecto | Estado MVP Atual | Padrão Produção Premium |
|---|---|---|
| **Cobrança SaaS (Assinaturas)** | Módulo demonstrativo de planos em memória. | Integração nativa com Stripe Billing ou Asaas: Checkout transparente, portal de assinatura, upgrade/downgrade de planos, gestão de inadimplência (dunning). |
| **Honorários das Consultas** | Controle manual com recibo em HTML para impressão. | Cobrança automática de consultas por Pix dinâmico (com QR Code copia e cola) e Cartão de Crédito com split de pagamento e conciliação automática. |

### E. Experiência Mobile & Aplicativos Nativos
| Aspecto | Estado MVP Atual | Padrão Produção Premium |
|---|---|---|
| **Mobile App** | PWA básico e arquivo `capacitor.config.ts`. | App híbrido empacotado e otimizado com Capacitor/Ionic, autenticação biométrica (FaceID/Biometria), Push Notifications (OneSignal/Firebase Cloud Messaging) e funcionamento offline para diário/exercícios. |

### F. Qualidade, Testes & Observabilidade
| Aspecto | Estado MVP Atual | Padrão Produção Premium |
|---|---|---|
| **Testes Automatizados** | Nenhum teste automatizado configurado no `package.json`. | Suíte de testes unitários (Vitest/Jest) para regras de negócio (cálculo de escores PHQ-9/GAD-7, recibos), testes de integração e testes E2E com Playwright para fluxos críticos de atendimento. |
| **Observabilidade & Monitoramento** | Apenas `console.log` e `console.warn`. | Sentry para monitoramento de exceções e performance, PostHog para telemetria de produto sem PII, e alertas no Slack/Discord para indisponibilidade. |

---

## 3. Principais Barreiras de Valor Percebido (O que torna um app "Premium" para o Psicólogo)
1. **Economia real de tempo administrativo:** Preenchimento de evolução SOAP guiado por IA treinada em psicopatologia com revisão de 1 clique.
2. **Confiabilidade e zero perda de dados:** Salvamento automático rascunho em tempo real (autosave) durante a sessão.
3. **Identidade visual e white-label:** A clínica ou o psicólogo podem colocar sua logo, paleta de cores e subdomínio próprio (`draana.psisaas.com.br`).
4. **App do Paciente acolhedor:** Sensação de acolhimento, microanimações suaves, feedback háptico, sem cara de "sistema corporativo frio".
