# 08 — Segurança, LGPD e Compliance

## 1. Classificação dos dados

Informações ligadas à saúde e ao acompanhamento psicológico devem ser tratadas com nível elevado de proteção.

A arquitetura deve assumir que boa parte do conteúdo clínico é dado pessoal sensível.

## 2. Referências regulatórias a validar

- Lei Geral de Proteção de Dados — Lei 13.709/2018.
- Normas e orientações da ANPD.
- Código de Ética Profissional do Psicólogo.
- Resolução CFP nº 01/2009 — registros documentais.
- Resolução CFP nº 13/2022 — psicoterapia.
- Resolução CFP nº 09/2024 — exercício profissional mediado por TDICs.
- Manual Orientativo de Registro e Elaboração de Documentos Psicológicos do CFP, publicado em 2025.
- Lei 13.787/2018, quando aplicável à guarda de prontuários em saúde.

**Observação:** a validação final deve ser feita antes da entrada em produção.

## 3. Mudança importante para atendimento digital

A regulamentação atual do CFP para TDICs exige atenção a contrato, recursos utilizados, proteção do sigilo e responsabilidades do profissional.

O produto deve permitir que o profissional configure e documente:
- modalidade;
- ferramentas;
- termos;
- consentimentos;
- orientações de privacidade.

## 4. Princípios LGPD

- finalidade;
- adequação;
- necessidade;
- livre acesso;
- qualidade;
- transparência;
- segurança;
- prevenção;
- não discriminação;
- responsabilização.

## 5. Bases legais

Não “fixar” uma única base legal no código.

Criar inventário de tratamento com:
- finalidade;
- categoria de dado;
- titular;
- operação;
- base legal validada;
- retenção;
- operador;
- compartilhamentos.

## 6. Privacy by design

### Minimização
Coletar somente dados necessários.

### Default privado
Diário nasce privado.

### Segregação
Registros clínicos e restritos separados.

### Controle
Permissões no banco.

### Transparência
Explicar ao usuário:
- quem vê;
- o que é compartilhado;
- para que serve;
- retenção;
- direitos.

## 7. Controles técnicos

- TLS;
- criptografia em repouso;
- RLS;
- MFA;
- sessão com expiração;
- reautenticação para exportação;
- secrets manager;
- rate limit;
- WAF/anti-abuso quando necessário;
- buckets privados;
- signed URLs curtas;
- logs;
- backup;
- restore test;
- SAST/DAST;
- dependency scanning.

## 8. Segurança de logs

Nunca enviar texto clínico integral para:
- Sentry;
- analytics;
- logs de aplicação;
- ferramentas de suporte;
- data warehouse.

Redigir/sanitizar payloads.

## 9. Analytics

Usar IDs pseudonimizados.

Eventos:
`exercise_submitted`
e não:
`exercise_anxiety_crisis_submitted`.

## 10. Incidente

Criar playbook:

1. detectar;
2. conter;
3. preservar evidências;
4. classificar impacto;
5. identificar titulares;
6. avaliar necessidade de comunicação;
7. corrigir;
8. documentar;
9. post-mortem.

## 11. Retenção

Não implementar prazo único global.

Criar política por classe:
- conta;
- prontuário;
- registro documental;
- auditoria;
- diário;
- exercício;
- arquivos.

A documentação atual do CFP diferencia prazos e regras para tipos de registro; a política final deve ser validada juridicamente e pelo responsável técnico.

## 12. Direitos do titular

Criar área/processo para:
- confirmação;
- acesso;
- correção;
- informação;
- portabilidade quando aplicável;
- revisão;
- eliminação quando aplicável;
- revogação de consentimento quando essa for a base;
- contato de privacidade.

## 13. Fornecedores

Antes de contratar:
- Supabase;
- Vercel;
- e-mail;
- analytics;
- IA;
- WhatsApp;
- storage;
- observabilidade;

avaliar:
- DPA;
- suboperadores;
- região;
- retenção;
- segurança;
- treinamento de modelos;
- transferência internacional;
- exclusão.

## 14. IA

Nenhum conteúdo clínico deve ser enviado a modelo externo sem:
- finalidade definida;
- fornecedor avaliado;
- contrato adequado;
- configuração de retenção;
- minimização;
- autorização/hipótese legal validada;
- supervisão;
- registro.

## 15. Checklist para produção

- [ ] ROPA/inventário de dados
- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] Contrato B2B
- [ ] DPA com fornecedores
- [ ] Política de retenção
- [ ] Processo de direitos do titular
- [ ] Processo de incidentes
- [ ] Revisão jurídica
- [ ] Revisão do responsável técnico
- [ ] Pentest
- [ ] Backup + teste de restore
- [ ] MFA
- [ ] RLS testada
- [ ] Logs sanitizados
- [ ] Monitoramento
