# Documentação do Projeto — PsiApp (Plataforma de Acompanhamento Psicológico & Gestão Clínica)

**Status:** Produção Live (Homologado na Vercel + Supabase)  
**Versão:** 1.2.0  
**Data-base:** Setembro/2026  
**Domínio em Produção:** `psiappgestao.vercel.app`

## Objetivo

Construir e operar uma plataforma SaaS B2B profissional para psicólogos, clínicas e pacientes, com foco em:

- Gestão clínica 360° e organização da carteira de pacientes;
- Agenda inteligente com sincronização contínua (iPhone/Apple Calendar iCal Feed, Google Calendar 1-clique & OAuth 2.0 API);
- Sessão ao Vivo com cronômetro clínico, modelo estruturado SOAP e prescrição dinâmica de múltiplas tarefas;
- Copiloto de IA para minutas clínicas e apoio diagnóstico respeitando o princípio *Human-in-the-Loop*;
- Prontuário eletrônico em estrita conformidade com as Resoluções CFP 001/2009, 004/2020 e 009/2024;
- Segregação de sigilo absoluto para anotações privadas e supervisão;
- Módulos avançados de intervenção: Quadro Interativo de Conceituação Cognitiva (TCC/ACT), Termômetro SUDS e Âncoras de Voz Terapêuticas;
- Escalas psicométricas padronizadas com cálculo automático de escores (PHQ-9 e GAD-7);
- Central do Paciente ("Entre Sessões") com diário emocional privativo por padrão, check-in de humor longitudinal e canal de apoio em crises (CVV 188);
- Automação de lembretes e confirmações via WhatsApp e E-mail;
- Contrato terapêutico digital com assinatura em Canvas e integridade probatória via hash SHA-256.

## Estrutura da documentação

1. `01_VISAO_PRODUTO.md` — Visão estratégica, proposta de valor e diferenciais clínicos.
2. `02_PRD_REQUISITOS.md` — Requisitos funcionais e não-funcionais detalhados.
3. `03_PERSONAS_JORNADAS_FLUXOS.md` — Personas, fluxos de uso e jornadas do terapeuta e do paciente.
4. `04_REGRAS_NEGOCIO_PERMISSOES.md` — Regras de negócio, papéis (RBAC) e segregação de sigilo ético.
5. `05_ARQUITETURA_TECNICA.md` — Arquitetura de software, stack, padrões de persistência e segurança.
6. `06_BANCO_DE_DADOS.md` — Esquema relacional completo (PostgreSQL 15), triggers, tabelas e RLS.
7. `07_API_CONTRATOS.md` — Rotas de API do Next.js, endpoints de calendário, webhooks e contratos Supabase.
8. `08_SEGURANCA_LGPD_COMPLIANCE.md` — Políticas de segurança, anonimização, consentimentos e conformidade CFP/LGPD.
9. `09_UX_UI_DESIGN_SYSTEM.md` — Padrões de interface, acessibilidade, componentes e tema visual.
10. `10_IA_AUTOMACOES.md` — Copiloto clínico de IA, regras de prompt, limites éticos e automações WhatsApp.
11. `11_BACKLOG_ROADMAP.md` — Histórico de entregas e roadmap de evolução contínua.
12. `12_QA_CRITERIOS_ACEITE.md` — Critérios de qualidade, testes e matriz de aceitação.
13. `13_DEVOPS_OBSERVABILIDADE.md` — Pipeline de deploy Vercel, monitoramento e variáveis de ambiente.
14. `14_METRICAS_ANALYTICS.md` — Indicadores de saúde do produto, engajamento e métricas clínicas.
15. `15_RISCOS_DECISOES_ABERTAS.md` — Matriz de riscos operacionais, mitigação e decisões arquiteturais (ADRs).
16. `16_GLOSSARIO.md` — Glossário de termos clínicos, técnicos e regulatórios.
17. `17_HISTORICO_AUDITORIA_E_PRODUCAO.md` — Histórico de auditoria técnica, inconsistências corrigidas, homologação e guia de deploy.
18. `DOCUMENTACAO_COMPLETA.md` — Documento unificado consolidando toda a especificação técnica do sistema.

## Stack em Produção

- **Frontend:** Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Recharts
- **Backend & BaaS:** Supabase (PostgreSQL 15 + PostgREST + Realtime WebSockets)
- **Autenticação:** Supabase Auth com trigger de auto-confirmação instantânea de e-mails
- **Storage:** Supabase Storage com buckets configurados para avatares, áudios e documentos
- **Segurança de Acesso:** Row Level Security (RLS) estrito com isolamento por psicólogo/clínica
- **Criptografia & Integridade:** Web Crypto API (SHA-256) para contratos e termos de consentimento
- **Integrações de Calendário:** Feed iCal contínuo (RFC 5545 / `webcal://`), Google Calendar 1-clique & Google OAuth 2.0 API
- **Mensageria & E-mails:** WhatsApp Direct API & Resend SMTP
- **Deploy & Infraestrutura:** Vercel Serverless & Edge Network com SSL/TLS automático

## Princípios Inegociáveis do Produto

1. **Privacidade e Sigilo por Padrão (Privacy by Default):** Anotações privativas e hipóteses clínicas do psicólogo nunca trafegam para o paciente. Diários do paciente nascem estritamente privados.
2. **Menor Privilégio e Isolamento Multi-Tenant:** Cada psicólogo só tem acesso aos pacientes e prontuários vinculados à sua carteira clínica.
3. **IA é Apoio, Jamais Substituição:** A IA atua como copiloto de redação e organização (minutas SOAP); nenhuma intervenção clínica é autônoma ou gravada sem revisão humana explícita (*Human-in-the-Loop*).
4. **Vedação a Diagnóstico Automatizado:** A plataforma não emite laudos ou diagnósticos automáticos.
5. **Acolhimento em Crise:** Canais de emergência (CVV 188 / SAMU 192) são destacados permanentemente, com disclaimer de que o app não é serviço de pronto-atendimento.

## Nota regulatória

Este material é uma especificação de produto e tecnologia. Antes da operação comercial, os fluxos clínicos, termos, política de privacidade, contratos e tratamento de dados devem ser validados por profissional jurídico e por psicólogo responsável técnico, considerando as normas vigentes do CFP, CRP, LGPD e demais regras aplicáveis.
