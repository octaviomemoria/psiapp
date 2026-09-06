# 10 — IA e Automações

## 1. Princípio

A IA entra depois que o produto básico for confiável.

O sistema não deve depender de IA para:
- autenticação;
- autorização;
- prontuário;
- agenda;
- execução de exercícios;
- privacidade.

## 2. Casos de Uso Implementados & Homologados

### 1. Copiloto Clínico de IA para Minuta SOAP (`AIService.generateSOAPDraft`)
- **Funcionamento:** Durante a sessão ao vivo (`LiveSessionModal`), o psicólogo clica em *"Gerar Rascunho IA"*. O serviço sintetiza as anotações brutas e o diagrama de conceituação cognitiva em uma minuta estruturada nos 4 quadrantes SOAP ([S] Subjetivo, [O] Objetivo, [A] Avaliação Clínica, [P] Plano Terapêutico);
- **Contextualização Teórica:** O prompt adapta o vocabulário e a estrutura à abordagem teórica do terapeuta (ex: TCC, ACT, Psicanálise, Humanismo);
- **Human-in-the-Loop Estrito:** A minuta gerada pela IA é inserida nos campos de texto da tela como sugestão editável. **Nenhum dado é gravado no prontuário sem a revisão, edição e clique explícito de finalização pelo psicólogo**.

### 2. Prescrição Dinâmica de Múltiplas Tarefas de Casa
- Na finalização da sessão clínica, o psicólogo define múltiplas tarefas com botão dinâmico de adição/remoção;
- As tarefas são formatadas de maneira clara (`\n• Tarefa 1\n• Tarefa 2`) e salvas no campo `homework_assigned` da sessão, gerando as atividades na central *"Entre Sessões"* do paciente.

### 3. Automação de Lembretes & Mensagens WhatsApp
- Geração de templates com links dinâmicos para WhatsApp (`wa.me`):
  - **Lembrete de 24 Horas:** Data/hora formatadas, solicitação de confirmação (`SIM` ou `REMARCAR`) e **link direto de 1 clique para o paciente salvar no Google Agenda**;
  - **Lembrete de 2 Horas:** Aviso prévio com link direto da sala de teleatendimento criptografada (Google Meet / WebRTC);
  - **Reagendamento:** Mensagem cordial para alinhamento de novos horários.

---

## 3. Casos Proibidos ou de Alto Risco (Limites Éticos)

Não são permitidos sob nenhuma hipótese:
- Diagnósticos ou laudos gerados automaticamente por IA;
- Prescrição ou recomendação de psicofármacos;
- Bloqueio ou alta clínica automática;
- Substituição da escuta clínica por chatbots autônomos;
- Intervenção exclusiva por IA em casos de ideação suicida ou emergências psiquiátricas.

---

## 4. Arquitetura do Gateway de IA

```text
[Cliente Web / LiveSessionModal]
              │
              ▼
    [AIService (Client/Edge)]
              │
       (Anonimização & Mínimo Privilégio)
              │
              ▼
   [LLM Provider (Google Gemini)]
              │
              ▼
 [Minuta SOAP Sugerida no Formulário]
              │
   (Revisão & Edição pelo Psicólogo)
              │
              ▼
[Prontuário Oficial do Supabase (therapy_sessions)]
```

---

## 5. Governança de Dados & LGPD

- **Minimização:** O payload enviado para o modelo de IA contém exclusivamente as notas clínicas pontuais da sessão e o primeiro nome do paciente. Nenhum documento de identificação (CPF, telefone, e-mail) é compartilhado;
- **Não-Treinamento:** As chaves de API utilizadas possuem cláusula contratual de não utilização dos dados clínicos para retreinamento de modelos de IA;
- **Logs de Auditoria:** O registro da sessão armazena a data/hora e o autor humano que homologou e assinou o prontuário.
