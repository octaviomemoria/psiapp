# Descobertas e Levantamento Técnico — PsiApp

## 1. Arquitetura e Estrutura do Código
- **Next.js 14 App Router:** Aplicação SPA rica com componentes cliente interativos e renderização ultra-rápida.
- **Supabase PostgreSQL:**
  - 14 tabelas principais criadas com RLS ativado.
  - Chaves estrangeiras e índices otimizados para consultas por psicólogo e paciente.
- **Capacitor Integration:** Configuração pronta para compilação nativa em Android e iOS (`capacitor.config.ts`).
- **Design System:** Tailwind CSS com paleta clínica relaxante (Emerald/Slate/Teal), dark mode nativo e suporte a acessibilidade.

## 2. Conformidade Ética e Legal (CFP & LGPD)
- **Segregação de Sigilo:** A tabela `session_private_notes` possui política RLS estrita onde apenas o psicólogo criador tem permissão de leitura.
- **Diário Emocional:** Campo booleano `is_shared_with_psychologist` garante que relatos do paciente fiquem privados até que ele opte explicitamente por compartilhar.
- **Botão de Crise SOS:** Integrado em todas as telas com discagem direta para CVV (188) e SAMU (192).

## 3. Catálogo Atual de Protocolos (13 Ferramentas)
1. RPD - Registro de Pensamentos Disfuncionais (TCC)
2. Descatastrofização (TCC)
3. Desfusão Cognitiva "Folhas no Riacho" (ACT)
4. Bússola de Valores (ACT)
5. Protocolo TIPP de Regulação Rápida (DBT)
6. Cartão de Enfrentamento / Coping Card (TCC/DBT)
7. Modo Criança Vulnerável vs Adulto Saudável (Terapia do Esquema)
8. Carta de Autocompaixão (CFT)
9. Ancoragem Sensorial 5-4-3-2-1 (Mindfulness/Somatic)
10. Diário de Higiene do Sono (Neuropsicologia)
11. Roda das Emoções de Plutchik
12. Análise em Cadeia de Comportamento (DBT)
13. Técnica da Seta Descendente / Crenças Centrais (TCC)
