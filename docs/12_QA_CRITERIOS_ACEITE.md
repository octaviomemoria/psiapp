# 12 — QA e Critérios de Aceite

## Estratégia

- unit tests;
- integration tests;
- E2E;
- security tests;
- RLS tests;
- accessibility;
- backup restore.

## Critérios globais

### CA-01
Usuário não autenticado não acessa área interna.

### CA-02
Paciente A nunca lê dado do paciente B.

### CA-03
Psicólogo A nunca lê paciente do psicólogo B fora de relação autorizada.

### CA-04
Paciente nunca lê `restricted_records`.

### CA-05
Frontend manipulado não contorna RLS.

### CA-06
URL assinada expira.

### CA-07
Exportação gera auditoria.

### CA-08
Alteração de registro mantém versão.

### CA-09
Diário privado não aparece em API do psicólogo.

### CA-10
Notificação não contém conteúdo clínico sensível.

## Cenários E2E

### Psicólogo cadastra paciente
Given psicólogo autenticado  
When cadastra paciente válido  
Then paciente aparece na carteira  
And audit log é criado.

### Paciente aceita convite
Given convite válido  
When paciente cria conta  
Then conta é vinculada  
And token não pode ser reutilizado.

### Exercício
Given exercício atribuído  
When paciente envia  
Then resposta fica disponível ao psicólogo responsável  
And outro profissional não relacionado recebe 403/404.

### Diário privado
Given entrada privada  
When psicólogo consulta feed  
Then entrada não é retornada.

### Diário compartilhado
Given entrada compartilhada  
When psicólogo responsável consulta  
Then entrada é retornada.

## Segurança

Testar:
- IDOR;
- auth bypass;
- SQL injection;
- XSS;
- CSRF quando aplicável;
- upload malicioso;
- signed URLs;
- rate limiting;
- session fixation;
- privilege escalation;
- enumeration.

## Definition of Done

Uma feature só está concluída quando:
- requisito atendido;
- UX implementada;
- validação;
- tratamento de erro;
- loading;
- autorização;
- testes;
- auditoria quando aplicável;
- analytics seguro;
- documentação atualizada.
