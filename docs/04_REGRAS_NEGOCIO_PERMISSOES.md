# 04 — Regras de Negócio e Permissões

## 1. Modelo de acesso

Papéis:

- `platform_admin`
- `organization_owner`
- `psychologist`
- `clinic_staff` — futuro, acesso administrativo limitado
- `patient`

## 2. Matriz resumida

| Recurso | Psicólogo responsável | Paciente | Staff futuro | Admin plataforma |
|---|---:|---:|---:|---:|
| Dados cadastrais | Sim | Próprios | Limitado | Suporte controlado |
| Agenda | Sim | Própria | Sim, sem clínico | Suporte controlado |
| Prontuário | Sim | Conforme direito/processo | Não | Não por padrão |
| Registro restrito | Sim | Não | Não | Não por padrão |
| Diário privado | Não | Sim | Não | Não |
| Diário compartilhado | Sim | Sim | Não | Não |
| Exercícios | Sim | Responde | Não | Não |
| Objetivos | Sim | Conforme visibilidade | Não | Não |
| Auditoria | Leitura limitada | Eventos próprios quando cabível | Não | Segurança autorizada |

## 3. Regra de relacionamento

Um psicólogo só acessa dados clínicos se existir relacionamento ativo ou histórico autorizado entre o profissional e o paciente.

## 4. Multi-tenant

Toda entidade operacional deve conter `organization_id` quando fizer sentido.

As políticas RLS devem validar:

- organização;
- papel;
- relacionamento;
- propriedade;
- visibilidade;
- status.

## 5. Prontuário x registro restrito

O sistema deve modelar ambos separadamente.

### Prontuário
Registro clínico estruturado, sujeito às regras de acesso aplicáveis.

### Registro documental/restrito
Informação de acesso técnico restrito quando a natureza do dado exigir restrição.

### Proibição
Não utilizar um simples booleano `private_note=true` dentro da mesma tabela sem controles de autorização separados. O risco de vazamento por erro de frontend é alto.

## 6. Diário

- padrão inicial: privado;
- paciente escolhe compartilhar;
- psicólogo não pode alterar privacidade do diário do paciente;
- compartilhamento não implica automaticamente incorporação ao prontuário.

## 7. Exclusão

A ação “excluir conta” não pode executar `DELETE CASCADE` indiscriminado.

Fluxo:
1. receber solicitação;
2. classificar dados;
3. eliminar o que puder ser eliminado;
4. reter o que deva ser retido;
5. anonimizar quando aplicável;
6. registrar justificativa.

## 8. Alteração de registro clínico

- manter versão;
- registrar autor;
- timestamp;
- motivo opcional/obrigatório conforme política;
- impedir alteração silenciosa.

## 9. Convite

- token de uso único;
- expiração;
- hash do token no banco;
- revogação;
- não expor dados clínicos na URL.

## 10. Notificações

Não incluir detalhes clínicos sensíveis no corpo de push/e-mail por padrão.

Preferir:
“Você tem uma nova atividade no aplicativo.”

Evitar:
“Seu psicólogo enviou exercício sobre crise de ansiedade.”

## 11. Exportação

Exportações clínicas devem:

- exigir reautenticação;
- registrar auditoria;
- possuir expiração;
- evitar links públicos;
- incluir apenas escopo autorizado.

## 12. Menores de idade

Não implementar no MVP sem desenho específico de:

- responsáveis;
- consentimentos;
- representação;
- visibilidade;
- sigilo;
- regras profissionais;
- incidentes.

Recomendação de produto: MVP inicialmente para maiores de 18 anos.
