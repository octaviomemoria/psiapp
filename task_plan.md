# Plano de Tarefas — Implementação de Ferramentas, Técnicas e Exercícios Psicológicos

## 🎯 Objetivo
Expandir o catálogo clínico do **PsiApp** com um arsenal completo de **13 ferramentas e exercícios práticos** baseados em evidências (TCC, ACT, DBT, Terapia do Esquema, Autocompaixão e Neuropsicologia), com formulários dinâmicos, módulos interativos especializados (Ancoragem 5-4-3-2-1, Protocolo TIPP, Cartões de Enfrentamento, Bússola de Valores e Diário do Sono) e categorização clínica por abordagem.

---

## 📋 Fases de Execução

### Fase 1: Arquitetura de Dados & Catálogo de Protocolos Clínicos
- [x] Mapear e estruturar os 13 novos templates em `src/lib/store/initial-data.ts` com categorias e esquemas de campos dinâmicos.

### Fase 2: Módulos e Ferramentas Interativas Especializadas (UI/UX)
- [x] `src/components/patient/tools/SensoryGroundingModal.tsx`: Guia tátil e visual passo a passo para a técnica 5-4-3-2-1 com animação de foco e respiração.
- [x] `src/components/patient/tools/TippEmergencyModal.tsx`: Guia rápido para momentos de crise fisiológica com temporizador e instruções acolhedoras.
- [x] `src/components/patient/tools/CopingCardsModal.tsx`: Visualizador e criador de cartões de enfrentamento favoritos do paciente.
- [x] `src/components/patient/tools/SleepDiaryModal.tsx`: Registro simplificado matinal de sono e fatores interferentes.

### Fase 3: Aprimoramento da Biblioteca Terapêutica da Psicóloga
- [x] Adicionar filtros por abordagem clínica na `LibraryView.tsx` (Todas, TCC, ACT, DBT, CFT/Esquema, Neuro/Sono).
- [x] Implementar visualização prévia detalhada com badges de tempo estimado e indicação clínica.
- [x] Facilitar atribuição direta com orientações padrão pré-preenchidas.

### Fase 4: Integração na Central do Paciente ("Entre Sessões")
- [x] Adicionar seção "Caixa de Ferramentas de Bolso" no `BetweenSessionsHub.tsx` com acesso instantâneo às ferramentas especializadas.

### Fase 5: Validação, Testes de Build & Walkthrough
- [x] Execução de `npm run build` com sucesso absoluto (Exit Code 0).
- [x] Atualização de `walkthrough.md` e `progress.md`.
