# 15 — Riscos e Decisões em Aberto

## Riscos

### R1 — Vazamento de conteúdo clínico
Impacto: crítico.  
Mitigação: RLS, segregação, testes, logs sanitizados, pentest.

### R2 — Confusão entre prontuário e nota privada
Impacto: alto.  
Mitigação: modelos de dados separados e validação profissional/jurídica.

### R3 — IA interpretada como terapia
Impacto: alto.  
Mitigação: escopo, linguagem, human-in-the-loop, feature flags.

### R4 — Notificação revelar informação
Impacto: alto.  
Mitigação: push genérico.

### R5 — Analytics capturar dados sensíveis
Impacto: alto.  
Mitigação: taxonomia segura.

### R6 — Exclusão apagar registro obrigatório
Impacto: alto.  
Mitigação: política de retenção por classe.

### R7 — Multi-tenant mal implementado
Impacto: crítico.  
Mitigação: RLS + testes de isolamento.

### R8 — Promessa de alerta de crise
Impacto: crítico.  
Mitigação: não prometer monitoramento 24/7 sem operação real.

## Decisões abertas

### D1 — Nome do produto
A definir.

### D2 — Público do MVP
Recomendação: profissionais individuais + pacientes adultos.

### D3 — Prontuário formal
Decidir nível de profundidade e validação regulatória.

### D4 — Modelo de monetização
Sugestões:
- Basic;
- Pro;
- Clínica.

### D5 — Região de dados
Validar fornecedores e transferência internacional.

### D6 — Canal de notificações
- push;
- e-mail;
- WhatsApp.

### D7 — Videoconferência
Integrar serviço externo ou não.

### D8 — Menores
Deixar bloqueado até versão posterior.

### D9 — IA
Só após MVP e governança.

## ADRs recomendadas

Criar:
- ADR-001 Multi-tenancy
- ADR-002 RLS
- ADR-003 Separação de registros
- ADR-004 Storage privado
- ADR-005 Analytics sem PHI
- ADR-006 AI Gateway
