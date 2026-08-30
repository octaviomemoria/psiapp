# PsiApp — SaaS de Acompanhamento Psicológico & Evolução Terapêutica

> **Plataforma web moderna, responsiva e profissional para psicólogos e pacientes.**  
> Gerenciamento clínico, registro de sessões, segregação de sigilo, exercícios terapêuticos interativos entre consultas, diário emocional e acompanhamento longitudinal de humor e metas.

---

## 🌟 Funcionalidades Principais

### 👩‍⚕️ Área do Psicólogo
- **Dashboard Clínico:** KPIs em tempo real (pacientes ativos, sessões no mês, pendências de exercícios, respostas recebidas para feedback).
- **Meus Pacientes (Visão 360°):**
  - *Visão Geral*: Dados cadastrais, demanda principal, próxima/última sessão, metas e atividades ativas.
  - *Sessões & Timeline*: Registro cronológico de sessões, técnicas aplicadas, tarefas de casa e **Anotações Privadas do Terapeuta** (sigilo rigoroso, isoladas de qualquer visualização pelo paciente).
  - *Objetivos Terapêuticos*: Gestão de metas com status (Não iniciado, Em andamento, Evoluindo, Concluído) e barra de progresso interativa.
  - *Exercícios*: Atribuição de tarefas da biblioteca e módulo de avaliação de respostas com envio de feedback clínico.
  - *Diário Compartilhado*: Acesso às reflexões que o paciente optou voluntariamente por compartilhar.
  - *Humor & Gráficos*: Gráficos de evolução temporal de humor e intensidade emocional (Recharts).
  - *Conteúdos*: Envio de artigos, áudios e vídeos com notas personalizadas.
- **Construtor de Exercícios:** Criação de formulários dinâmicos com múltiplos tipos de campo (texto longo/curto, escalas 0-10, humor, checkboxes, radio, checklists).
- **Biblioteca Psicoeducativa:** Repositório categorizado de exercícios clínicos e materiais informativos.
- **Agenda Interativa:** Agendamento de consultas presenciais e teleatendimentos (TDICs).

### 🧘‍♂️ Área do Paciente (Mobile-First & Responsivo)
- **Home Acolhedora:** Saudação personalizada, check-in "Como você está hoje?", card da próxima consulta, tarefas pendentes ("Para você fazer") e resumo de metas.
- **Central "Entre Sessões":** Hub consolidado para realizar exercícios, escrever no diário, monitorar metas e ler conteúdos.
- **Meu Diário:** Espaço seguro de escrita com **controle estrito de privacidade** (as entradas nascem privadas por padrão e só são compartilhadas com o terapeuta se o paciente marcar o switch).
- **Check-in de Humor Diário:** Seleção de estado emocional (Muito bem a Muito mal), tags de sentimentos, intensidade de 0 a 10 e notas de contexto.
- **Evolução:** Gráficos interativos de oscilação emocional ao longo do tempo (com disclaimer ético/não-diagnóstico).
- **Suporte a Crises:** Banner com canais de apoio emergencial (CVV 188, CAPS, SAMU 192).

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### Passo a Passo

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo de desenvolvimento
npm run dev

# 3. Acessar a aplicação no navegador
# http://localhost:3000
```

---

## 🔀 Alternador de Perfis (Modo Demonstração)

No topo da aplicação (Header), você encontrará o **Seletor de Perfil**:
- **Psicóloga:** Visualizar como a **Dra. Ana Martins** (acesso a todos os pacientes, prontuários, notas privadas e agenda).
- **Paciente:** Alternar instantaneamente para a visão de qualquer um dos 5 pacientes demonstrativos (**Mariana Costa**, **Pedro Almeida**, **Fernanda Lima**, **Carlos Oliveira**, **Juliana Rocha**) para testar a resolução de exercícios, check-in de humor e diário.

---

## 🗄️ Banco de Dados & Supabase

O projeto já inclui todos os scripts SQL prontos para deploy no **Supabase / PostgreSQL**:
- `supabase/schema.sql`: Definição de todas as tabelas relacionais com UUIDs, constraints, triggers e **Row Level Security (RLS)** para segregação de sigilo.
- `supabase/seed.sql`: Carga inicial dos dados da Dra. Ana Martins e dos 5 pacientes com histórico clínico realista.

### Variáveis de Ambiente (Opcional para conectar ao Supabase Cloud):
Crie um arquivo `.env.local` na raiz com:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```
*Nota: Sem as variáveis, o PsiApp funciona 100% perfeitamente no navegador utilizando a camada reativa persistente em memória e LocalStorage.*

---

## 🛡️ Segurança & Conformidade (LGPD & CFP)

1. **Segregação de Dados:** Anotações privativas de sessões (`session_private_notes`) nunca trafegam para o frontend do paciente.
2. **Privacidade do Diário:** Registros pessoais nascem privados por padrão.
3. **Não-Diagnóstico Automatizado:** Gráficos e acompanhamentos são ferramentas de suporte ao diálogo terapêutico.
4. **Canais de Emergência:** O app orienta prontamente a busca de serviços de emergência (188 / 192) em situações de risco.
