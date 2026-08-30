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

## 2. Casos de uso permitidos — fase futura

### Assistente do psicólogo
- estruturar texto ditado;
- resumir registros selecionados;
- sugerir tópicos para revisão;
- encontrar exercícios relevantes;
- melhorar organização de notas;
- busca semântica.

### Administrativo
- mensagens;
- lembretes;
- organização de agenda;
- FAQ do sistema.

### Paciente
- ajudar a estruturar um diário;
- transformar texto livre em categorias escolhidas pelo usuário;
- perguntas reflexivas de baixa criticidade;
- navegação.

## 3. Casos proibidos ou de alto risco

Não lançar sem governança específica:
- diagnóstico;
- score de risco clínico apresentado como verdade;
- recomendação de medicamento;
- recomendação de interrupção de tratamento;
- decisão clínica automática;
- avaliação psicológica automática;
- “terapia autônoma”;
- intervenção de crise baseada apenas em LLM.

## 4. Arquitetura

```text
App
 |
 v
AI Gateway
 |
 +-- policy
 +-- redaction
 +-- consent/context checks
 +-- provider routing
 +-- prompt version
 +-- output validation
 |
 v
LLM Provider
```

## 5. AI Gateway

Responsável por:
- impedir chamada direta do frontend;
- selecionar contexto mínimo;
- mascarar identificadores;
- versionar prompt;
- registrar uso;
- aplicar limites;
- validar saída.

## 6. Dados

Nunca enviar banco inteiro.

Usar:
- seleção explícita;
- contexto mínimo;
- janela temporal;
- campos necessários.

## 7. Human in the loop

Toda sugestão clínica ao profissional deve exigir:
- revisão;
- edição;
- aceite explícito.

Nunca gravar sugestão diretamente no prontuário como se fosse do psicólogo.

## 8. Automações sem IA

Priorizar primeiro:
- lembrete de sessão;
- atividade pendente;
- aviso de exercício entregue;
- follow-up administrativo;
- expiração de convite;
- limpeza de arquivos.

## 9. Versionamento

Tabela futura:
`ai_runs`

Campos:
- id
- user_id
- feature
- provider
- model
- prompt_version
- input_classification
- output_status
- latency
- tokens
- created_at

Não persistir prompt clínico integral por padrão.
