# Log de Progresso — PsiApp

## Sessão: 24-25/08/2026

- [x] Leitura e análise dos documentos de especificação em `docs/`.
- [x] Verificação do ambiente (Node v22.20.0, npm 10.9.3).
- [x] Inicialização dos arquivos de planejamento (`task_plan.md`, `findings.md`, `progress.md`).
- [x] Configuração completa do Next.js 14, Tailwind CSS, TypeScript, Lucide React e Recharts.
- [x] Criação do `supabase/schema.sql` (PostgreSQL com RLS) e `supabase/seed.sql`.
- [x] Criação do `PsiStore` com contexto reativo e persistência local.
- [x] Implementação do Módulo do Psicólogo (Dashboard, Meus Pacientes 360°, Timeline de Sessões com Notas Privadas de Sigilo, Construtor de Exercícios, Biblioteca e Agenda).
- [x] Implementação do Módulo do Paciente (Home acolhedora, Central Entre Sessões, Meu Diário com controle de privacidade, Check-in de Humor, Resolução de Exercícios e Gráficos de Evolução).
- [x] Implementação do Banner de Apoio Emocional e Suporte a Crises (CVV 188, CAPS, SAMU 192).
- [x] Criação da Central de Notificações In-App reativa com badge e histórico.
- [x] Implementação do Módulo de Emissão e Impressão de Relatórios Clínicos e Declarações de Comparecimento (CFP compliant).
- [x] Implementação do Módulo Financeiro & Emissão de Recibos de Honorários Psicológicos.
- [x] Implementação do Assistente de IA Ética Supervisionada com governança humana.
- [x] **Expansão do Arsenal Clínico de Ferramentas Psicológicas (16 Protocolos)**:
  - TCC: RPD, Descatastrofização, Ativação Comportamental, Hierarquia de Exposição SUDS.
  - ACT: Bússola de Valores, Desfusão Cognitiva "Notando a Mente".
  - DBT: Protocolo TIPP de Emergência, Chain Analysis, Habilidade STOP, DEAR MAN.
  - CFT & Esquema: Carta de Autocompaixão, Crítico Interno x Adulto Saudável.
  - Neuro & Sensorial: Ancoragem 5-4-3-2-1, Diário do Sono, Respiração 4-7-8, Gratidão.
- [x] **Módulos de Bolso Especializados**:
  - `SensoryGroundingModal.tsx` (5-4-3-2-1 interativo com confete)
  - `TippEmergencyModal.tsx` (TIPP & STOP para crise)
  - `CopingCardsModal.tsx` (Cartões de enfrentamento rápidos)
  - `SleepDiaryModal.tsx` (Diário matinal de sono)
- [x] Testes de build de produção (`npm run build`) executados com sucesso absoluto (Exit Code 0).
- [x] Criação do `README.md` e `walkthrough.md`.

## Sessão: 07/09/2026 — Expurgamento Total de Dados Mockados & Conexão Supabase Live
- [x] Eliminação completa de todos os dados fictícios e coleções mockadas em `initial-data.ts`.
- [x] Remoção da seção e botões de login rápido (1-clique com credenciais de teste) do `AuthModal.tsx`.
- [x] Remoção de desvios e atalhos de e-mails fake em `AuthModal.tsx` — autenticação 100% via Supabase Auth real.
- [x] Atualização de `psi-context.tsx` para operar por padrão em `supabase_live` com armazenamento limpo `v4`.
- [x] Remoção do alternador "Modo Demo" e diálogo de restauração de dados fictícios do `Header.tsx`.
- [x] Varredura e substituição de strings hardcoded de demonstração ("Dra. Ana Martins", "Mariana Costa", "teste.com") em todos os 15 componentes do ecossistema.
- [x] Validação completa de compilação: `npm run build` executado com êxito absoluto (código 0).

