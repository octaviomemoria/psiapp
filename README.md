# PsiApp — Plataforma SaaS de Acompanhamento Psicológico & Gestão Clínica

> **SaaS B2B de prontuário eletrônico, telepsicologia, gestão clínica e engajamento terapêutico entre sessões.**  
> Arquitetura moderna em **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** e **Supabase (PostgreSQL + RLS + Realtime)**, concebida sob estrita conformidade com as resoluções do **CFP (Conselho Federal de Psicologia)** e as diretrizes da **LGPD (Lei Geral de Proteção de Dados)** para dados sensíveis de saúde mental.

---

## 🌟 Visão Geral & Diferenciais Clínicos

O PsiApp resolve a lacuna histórica de continuidade entre consultas de psicoterapia, integrando em um único ecossistema seguro:
1. **Prontuário Eletrônico & Evolução Clínica (CFP 001/2009 e 004/2020):** Registro de sessões no formato SOAP (*Subjective, Objective, Assessment, Plan*), histórico temporal e anotações confidenciais do terapeuta com isolamento criptográfico no banco de dados.
2. **Engajamento Interativo Entre Sessões:** Prescrição e resposta de tarefas estruturadas da TCC e ACT (como RPD - Registro de Pensamentos Disfuncionais, Respiração Diafragmática e Desfusão Cognitiva).
3. **Diário Emocional com Privacy-by-Default:** O paciente registra sentimentos e reflexões que nascem **100% privadas por padrão**, sendo compartilhadas com o psicólogo apenas mediante autorização expressa.
4. **Escalas Psicométricas Padronizadas:** Aplicação e pontuação automatizada de inventários clínicos como **PHQ-9** (depressão) e **GAD-7** (ansiedade), com alertas clínicos e flags de risco ético.
5. **Termo de Consentimento & Contrato Terapêutico Digital:** Assinatura digital em Canvas com geração de hash SHA-256 e auditoria jurídica persistida na tabela de consentimentos.
6. **Sincronização em Tempo Real (Supabase Realtime):** Atualização instantânea via WebSockets de novos diários, exercícios respondidos ou escalas preenchidas sem necessidade de recarregar a tela.
7. **Lembretes de Consulta & Agenda Conectada:** Mensagens prontas para WhatsApp com link dinâmico de teleconsulta e integração de 1-clique com Google Calendar e iCal feed.

---

## 🏗️ Arquitetura Técnica & Stack

```text
┌────────────────────────────────────────────────────────┐
│                   Cliente Web (Browser / PWA)          │
│        React 18 • Next.js 14 App Router • Tailwind CSS  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / WSS
                            ▼
┌────────────────────────────────────────────────────────┐
│             PsiApp Engine & State Management           │
│   • psi-context.tsx (Reatividade Otimista + UUID Sync) │
│   • SupabaseService (Camada de Serviços & Abstração)   │
│   • Next.js Route Handlers (/api/calendar/*)           │
└───────────────────────────┬────────────────────────────┘
                            │ REST / PostgREST & WebSockets
                            ▼
┌────────────────────────────────────────────────────────┐
│              Supabase Cloud (PostgreSQL 15)            │
│   • 19 Tabelas Relacionais com Chaves Estrangeiras     │
│   • Row Level Security (RLS) Estrito por Tenant/Vínculo│
│   • Storage Buckets (avatars, voice-anchors, documents)│
│   • Supabase Realtime (postgres_changes listener)      │
└────────────────────────────────────────────────────────┘
```

### Tecnologias Utilizadas:
* **Frontend:** Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
* **Backend & Banco de Dados:** Supabase (PostgreSQL 15), Row Level Security (RLS), Supabase Storage.
* **Mensageria & Tempo Real:** Supabase Realtime (WebSockets).
* **Segurança Criptográfica:** Web Crypto API (`window.crypto.subtle` com SHA-256) para validação probatória de contratos terapêuticos.
* **Integrações:** Google Calendar API (OAuth 2.0 com tokens em cookies HttpOnly), iCalendar Feed (.ics RFC 5545), WhatsApp Direct Links (`wa.me`).

---

## 🗄️ Estrutura do Banco de Dados (19 Tabelas Homologadas)

Todas as tabelas contam com índices, constraints relacionais e políticas de **Row Level Security (RLS)**:

| Tabela | Descrição & Propósito |
|---|---|
| `profiles` | Contas de usuários e papéis de acesso (`psychologist`, `patient`, `clinic_admin`, `superadmin`). |
| `psychologists` | Dados profissionais do psicólogo (CRP, UF, abordagem, valor padrão de sessão, duração). |
| `patients` | Prontuários e fichas cadastrais dos pacientes atendidos. |
| `psychologist_patient_relationships` | Vínculos institucionais multi-tenant ativos e inativos entre psicólogos e pacientes. |
| `appointments` | Agendamentos clínicos (presencial e online via TDIC), status financeiro e recibos. |
| `therapy_sessions` | Registro longitudinal de sessões (formato SOAP, técnicas aplicadas e duração). |
| `session_private_notes` | **Anotações estritamente confidenciais do terapeuta** (hipóteses, supervisão e contratransferência). Isoladas por RLS. |
| `psychometric_results` | Resultados e scores de escalas psicométricas padronizadas (PHQ-9, GAD-7, etc.). |
| `cognitive_diagrams` | Diagramas de conceituação cognitiva e reestruturação de pensamentos (TCC/ACT). |
| `voice_anchors` | Âncoras de áudio terapêuticas gravadas ou enviadas para regulação emocional. |
| `patient_invites` | Tokens seguros para convite, onboarding e ativação de novos pacientes. |
| `exercise_templates` | Biblioteca de modelos de exercícios terapêuticos (RPD, Respiração, Desfusão Cognitiva). |
| `assigned_exercises` | Exercícios prescritos para execução entre sessões com status e prazos. |
| `exercise_answers` | Respostas estruturadas enviadas pelos pacientes às atividades prescritas. |
| `exercise_feedback` | Devolutivas e comentários clínicos do psicólogo sobre as respostas do paciente. |
| `diary_entries` | Diário emocional do paciente, com flag `is_shared_with_psychologist`. |
| `mood_logs` | Check-in diário de humor, emoções sentidas e intensidade (0 a 10). |
| `consents` | Termos de consentimento livre e esclarecido (TCLE) e contratos terapêuticos assinados com hash SHA-256. |
| `clinics` | Organizações, clínicas e consultórios compartilhados (Multi-Tenant). |

---

## 🛡️ Segurança & Conformidade Ética (CFP & LGPD)

1. **Sigilo Profissional Absoluto (Resolução CFP nº 001/2009 & 004/2020):**
   * Anotações de supervisão e hipóteses diagnósticas privadas (`session_private_notes`) possuem políticas de banco que impedem tecnicamente qualquer acesso por parte do paciente.
2. **Isolamento Multi-Tenant Rigoroso:**
   * Profissionais só acessam prontuários de pacientes vinculados a eles via `psychologist_patient_relationships`. Políticas permissivas genéricas (`USING (true)`) foram banidas.
3. **Consentimento Explícito & LGPD (Art. 11 — Dados Sensíveis de Saúde):**
   * Assinatura digital canvas com geração de hash SHA-256 gravado na tabela `consents` com data, versão dos termos e IP para auditoria jurídica.
4. **Armazenamento Seguro de Mídias (Storage Buckets):**
   * `avatars`: Público para fotos de perfil otimizadas.
   * `voice-anchors`: Áudios terapêuticos de regulação.
   * `documents`: Privado com acesso assinado para prontuários, termos e contratos.
5. **Diretrizes de Segurança em TDICs (Resolução CFP nº 009/2024):**
   * Canal criptografado (HTTPS/TLS) em todas as comunicações, recomendação de fones de ouvido e verificação de sigilo nas salas de teleatendimento.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos:
* Node.js 18+ instalado.
* NPM ou Yarn.

### Passo a Passo:

```bash
# 1. Clonar o repositório
git clone https://github.com/octaviomemoria/psiapp.git
cd psiapp

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Executar em modo de desenvolvimento
npm run dev

# 5. Acessar no navegador:
# http://localhost:3000
```

---

## ⚙️ Variáveis de Ambiente (.env.local)

```env
# 1. BANCO DE DADOS & AUTENTICAÇÃO (SUPABASE)
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-publica
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-privada

# 2. STORAGE (BUCKETS DO SUPABASE)
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://sua-url-supabase.supabase.co/storage/v1/object/public

# 3. URL DA APLICAÇÃO (PRODUÇÃO / LOCAL)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. DISPARO DE E-MAILS & CONVITES (OPCIONAL NO MVP)
RESEND_API_KEY=
EMAIL_FROM="PsiApp <contato@psisaas.com.br>"

# 5. GOOGLE CALENDAR OAUTH (OPCIONAL)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 🚢 Como Fazer o Deploy para Produção (Vercel)

A aplicação foi auditada e homologada com o build de produção do Next.js (`npm run build`), alcançando **Exit Code 0** sem nenhum erro de linting ou tipagem.

1. **Vincular o Repositório:** Acesse a [Vercel](https://vercel.com) e importe o repositório `octaviomemoria/psiapp`.
2. **Definir Variáveis de Ambiente:** Na tela de importação, adicione as variáveis de ambiente descritas acima, atualizando `NEXT_PUBLIC_APP_URL` para o seu domínio (ex: `https://app.seudominio.com.br`).
3. **Configurar Redirecionamento no Supabase:**
   * Acesse `Authentication > URL Configuration` no Supabase Dashboard.
   * Defina o **Site URL** com o endereço do app em produção.
   * Adicione `https://seu-dominio.com.br/**` às **Redirect URLs**.
4. **Disparar Deploy:** Clique em **Deploy**. A Vercel provisionará automaticamente o certificado SSL/HTTPS.

---

## 📄 Licença & Conformidade

Este software foi desenvolvido com foco exclusivo em clínicas de psicologia, consultórios e psicólogos autônomos. Todos os procedimentos de armazenamento de prontuário e consentimento foram desenhados para atender ao Código de Ética Profissional do Psicólogo e à LGPD.
