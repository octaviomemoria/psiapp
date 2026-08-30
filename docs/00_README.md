# Documentação do Projeto — Plataforma de Acompanhamento Psicológico

**Status:** Planejamento / Pré-MVP  
**Versão:** 1.0  
**Data-base:** 24/08/2026  
**Nome comercial:** A definir

## Objetivo

Construir uma plataforma SaaS para psicólogos e pacientes, com foco em:

- organização do acompanhamento psicológico;
- agenda e sessões;
- prontuário e registros profissionais;
- exercícios entre sessões;
- diário e registros do paciente;
- acompanhamento de humor e objetivos;
- conteúdos recomendados;
- acompanhamento longitudinal;
- automações administrativas;
- futura camada de IA com limites éticos e supervisão profissional.

## Estrutura da documentação

1. `01_VISAO_PRODUTO.md`
2. `02_PRD_REQUISITOS.md`
3. `03_PERSONAS_JORNADAS_FLUXOS.md`
4. `04_REGRAS_NEGOCIO_PERMISSOES.md`
5. `05_ARQUITETURA_TECNICA.md`
6. `06_BANCO_DE_DADOS.md`
7. `07_API_CONTRATOS.md`
8. `08_SEGURANCA_LGPD_COMPLIANCE.md`
9. `09_UX_UI_DESIGN_SYSTEM.md`
10. `10_IA_AUTOMACOES.md`
11. `11_BACKLOG_ROADMAP.md`
12. `12_QA_CRITERIOS_ACEITE.md`
13. `13_DEVOPS_OBSERVABILIDADE.md`
14. `14_METRICAS_ANALYTICS.md`
15. `15_RISCOS_DECISOES_ABERTAS.md`
16. `16_GLOSSARIO.md`
17. `DOCUMENTACAO_COMPLETA.md`

## Stack recomendada para o MVP

- Frontend: Next.js + React + TypeScript
- UI: Tailwind CSS
- Backend/BaaS: Supabase
- Banco: PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Segurança de linha: PostgreSQL Row Level Security
- Gráficos: Recharts
- Monitoramento: Sentry ou equivalente
- Deploy frontend: Vercel
- Mobile futuro: Expo / React Native

## Princípios do produto

1. Privacidade por padrão.
2. Menor privilégio.
3. Separação rígida entre dados do profissional e dados compartilháveis.
4. O paciente controla o compartilhamento dos registros pessoais que não integrem prontuário formal.
5. IA é apoio, não substituição do psicólogo.
6. Não fazer diagnóstico automatizado.
7. Não prometer atendimento emergencial.
8. Todo registro clínico relevante deve possuir trilha de auditoria.
9. O MVP deve funcionar sem IA.
10. Segurança e compliance são requisitos de produto, não “melhorias futuras”.

## Nota regulatória

Este material é uma especificação de produto e tecnologia. Antes da operação comercial, os fluxos clínicos, termos, política de privacidade, contratos e tratamento de dados devem ser validados por profissional jurídico e por psicólogo responsável técnico, considerando as normas vigentes do CFP, CRP, LGPD e demais regras aplicáveis.
