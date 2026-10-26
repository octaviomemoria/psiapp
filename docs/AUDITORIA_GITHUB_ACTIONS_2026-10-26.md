# Auditoria GitHub Actions — Psiapp

Data: 26/10/2026. Repositório: `octaviomemoria/psiapp`.
Base auditada: `97a8494871bf337082c7e2f60bb27b6b535c3e42` (`origin/main`).
Escopo: workflows, histórico de execuções, armazenamento e permissões; nenhuma alteração de produção.

## Custos e evidências

Consultas REST do GitHub e `gh repo view` confirmaram:

| Item | Resultado |
| --- | --- |
| Visibilidade atual | PUBLIC; `private: true` no package.json apenas impede publicação npm |
| Workflows | 2 ativos: CI e Supabase Keep-Alive |
| Runners declarados | `ubuntu-latest`, padrão hospedado pelo GitHub |
| Runners observados | Grupo GitHub Actions nos dois últimos jobs bem-sucedidos |
| Larger runners / self-hosted / matriz | Não utilizados nos workflows auditados |
| Artefatos | 0; nenhum upload-artifact nos workflows |
| Caches ativos | 0 entradas, 0 bytes no instante da consulta |
| Cache configurado | Somente download npm via setup-node; chave baseada no lockfile |
| Permissão padrão do token | read; sem aprovação de PR pelo workflow |
| Proteção de main | Endpoint retornou 404, “Branch not protected” |

**Estimativa atribuível aos workflows atuais: 0 minutos faturáveis e US$ 0/mês em execução.**
Runners padrão em repositórios públicos são gratuitos, conforme a
[documentação de cobrança do GitHub](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
Isso não confirma a fatura inteira da conta, visibilidade histórica, gastos de outros repositórios,
armazenamento já acumulado, GitHub Packages, nem a assinatura Supabase. Não foi acessada a fatura.

Armazenamento atual de artefatos/cache: zero. Cache possui franquia própria de 10 GB/repositório,
separada de artefatos e Packages. O snapshot atual não prova armazenamento zero durante todo o mês.
Não foram apagados logs, artefatos ou caches, nem modificadas configurações de faturamento/retenção da conta.

Comandos de evidência, todos somente leitura:

```powershell
gh repo view octaviomemoria/psiapp --json visibility,defaultBranchRef,url
gh api repos/octaviomemoria/psiapp/actions/workflows
gh api 'repos/octaviomemoria/psiapp/actions/runs?per_page=100'
gh api repos/octaviomemoria/psiapp/actions/artifacts
gh api repos/octaviomemoria/psiapp/actions/cache/usage
gh api repos/octaviomemoria/psiapp/actions/permissions/workflow
gh api repos/octaviomemoria/psiapp/branches/main/protection
# Para cada execução com falha:
gh api repos/octaviomemoria/psiapp/actions/runs/RUN_ID/jobs
gh api repos/octaviomemoria/psiapp/check-runs/JOB_ID/annotations
gh run view RUN_ID --repo octaviomemoria/psiapp --log-failed
```

## Histórico e falhas

A API retornou todas as 60 execuções disponíveis, de 07/09 a 25/10/2026; todas na primeira tentativa.

| Workflow | Sucesso | Falha | Eventos |
| --- | ---: | ---: | --- |
| CI | 5 | 8 | 13 push |
| Keepalive | 45 | 2 | 45 schedule, 2 workflow_dispatch |

Janela de 26/09 a 25/10: 31 execuções, sendo 30 keepalive (29 sucessos, 1 falha) e 1 CI bem-sucedido.
Não houve duplicação de workflow/evento/SHA em eventos não agendados. Pings diários sobre o mesmo
SHA são esperados. CI de PR e push de integração foram preservados: verificam contextos distintos.

| Evidência | Diagnóstico |
| --- | --- |
| [37367483020](https://github.com/octaviomemoria/psiapp/actions/runs/37367483020) | Falha de aquisição de runner hospedado, sem steps executados; não foi erro de banco. O job ficou aproximadamente 15 minutos aguardando infraestrutura. |
| [35540034725](https://github.com/octaviomemoria/psiapp/actions/runs/35540034725) | Build antigo: módulo FinancialModal ausente. O CI posterior de main passou; sem alteração clínica nesta auditoria. |
| [35529069477](https://github.com/octaviomemoria/psiapp/actions/runs/35529069477) | Teste antigo em Node sem WebSocket nativo; main já usa Node 22 e declara tsx. Mantidos. |
| 35524486728, 34514806134, 34514630107, 34180244464, 34168692691, 34163482087 | Seis falhas no step de lint. Configuração ESLint/dependências agora presentes em main; última execução passou. Mensagem “npm cache is not found” não prova falha de cache: cache miss é normal. |
| [34514661518](https://github.com/octaviomemoria/psiapp/actions/runs/34514661518) | Primeira versão do ping falhou; compatibilidade de credenciais foi alterada no commit subsequente. Secrets não foram lidos nem modificados nesta auditoria. |

Últimos jobs bem-sucedidos inspecionados:

- [CI 38166055593](https://github.com/octaviomemoria/psiapp/actions/runs/38166055593): 94 s de duração do job; instalação 25 s, lint 5 s, testes 12 s, build 42 s.
- [Keepalive 40206778316](https://github.com/octaviomemoria/psiapp/actions/runs/40206778316): job de 3 s; step HTTP de 1 s.

## Correções propostas neste PR

1. CI ignora alterações exclusivamente em `docs/**` e Markdown; alterações mistas, código,
   lockfile, configurações, SQL, public e workflows continuam disparando validação completa.
   Se futuramente houver check obrigatório em branch protection, reavaliar filtros: workflow
   ignorado pode deixar esse check pendente. Disparo manual permite validação excepcional.
2. CI cancela execução obsoleta do mesmo PR/ref e limita cada job a 15 minutos.
3. Lint estrito continua obrigatório antes dos testes. Build usa `--no-lint` para não repetir
   ESLint; compilação e verificação TypeScript permanecem. Scripts do aplicativo não mudaram.
4. Checkout/setup-node atualizados para v6, sem persistir credenciais Git; token com apenas
   contents:read no CI. Build utiliza placeholders, sem credenciais Supabase de produção.
5. Cache npm existente preservado, com lockfile explícito. Não foram adicionados caches
   node_modules/.next, uploads de builds ou artefatos clínicos. Sem artefatos, não há retenção
   adicional a reduzir; defaults do repositório não foram modificados.
6. Keepalive mantém frequência diária, às 12:17 UTC (09:17 Fortaleza), fora da hora cheia;
   horário é nominal, não SLA. Agendamentos anteriores tiveram atrasos de horas.
7. Ping termina após REST 2xx: Auth só é consultado para diagnóstico se REST falhar.
   Auth saudável não mascara REST indisponível; redirecionamentos não contam como sucesso.
8. Corrigida expressão shell ambígua com `&&`/`||`: além de mascarar REST com falha,
   podia reprovar REST saudável quando Auth falhava. Agora a decisão depende explicitamente de REST.
9. curl com conexão de 5 s, chamada de 15 s e até duas novas tentativas para falhas transitórias
   no REST. Job limitado a 2 minutos, sem checkout/cache e sem permissões de GITHUB_TOKEN.
   Nenhum corpo de resposta é impresso ou salvo. Execuções do ping não se cancelam mutuamente.
10. Chave anon preferida; service_role mantida apenas como fallback legado para evitar
    interromper instalações existentes. Secrets não foram alterados. Não há consulta a tabelas.

## Supabase: frequência e disponibilidade

O plano e a atividade real do projeto não foram consultados. Conforme a
[documentação Supabase](https://supabase.com/docs/guides/platform/free-project-pausing),
projetos Free podem pausar por pouca atividade de usuários no banco em sete dias;
projetos pagos não estão sujeitos à pausa automática por inatividade.

REST raiz acessível e Auth saudável não comprovam consultas suficientes ao banco nem impedimento
de pausa. O workflow agora informa essa limitação. Reduzir frequência ou remover o ping exigiria
confirmar plano e atividade; não foi feito para preservar a disponibilidade existente.
Não foram criados RPCs, tabelas, registros artificiais ou chamadas ao Supabase nesta auditoria.

## Economia potencial

| Medida | Potencial, sem prometer medição pós-merge |
| --- | --- |
| HTTP no caminho saudável | De 2 para 1 chamada/dia: cerca de 60 para 30 por mês de 30 dias, redução de 50%. Retries podem aumentar chamadas durante incidentes. |
| Commit somente de documentação | Evita um job completo; referência histórica de 94 s por job, variável conforme runner/cache. |
| Atualizações rápidas do mesmo PR/ref | Cancela trabalho obsoleto; não foi observada duplicação histórica para quantificar economia mensal. |
| Lint duplicado | Remove segunda passagem de ESLint; ganho incremental não medido. |
| Execuções travadas | Limites de 15 min/CI e 2 min/ping, em lugar do timeout padrão. Não corrigem indisponibilidade da infraestrutura GitHub. |
| Armazenamento | Nenhuma nova classe de cache/artefato; economia financeira adicional atual: zero. |

Com o volume recente de 30 pings e 1 CI/mês e durações amostradas, a referência aproximada seria
3,1 minutos efetivos de jobs, ou 32 minutos se arredondados individualmente para minutos inteiros.
Não é soma dos tempos reais de todas as execuções: fila e falha de aquisição de runner não foram
contadas como processamento. Ambos os cenários custam US$ 0 nos runners públicos padrão atuais.

## Validação e limites

- `actionlint v1.7.12`: workflows válidos; binário oficial com SHA-256 verificado.
  ShellCheck/Pyflakes não disponíveis nessa execução; desativados no actionlint.
- Teste offline da expressão antiga reproduziu REST 503 + Auth 200 retornando sucesso indevido.
- `python .github/tests/test_keepalive.py`: quatro testes, oito cenários com curl simulado
  (200, 204, 302, 401, 503, falha de transporte, ambos indisponíveis e chave ausente).
  Verifica também que REST saudável não chama Auth. Integrado ao CI; nenhuma conexão externa.
- `git diff --check`: sem erros de whitespace.
- CI do PR executa lint, toda a suíte existente e build com placeholders; resultado deve ser
  consultado nos checks do PR antes do merge. O keepalive não foi disparado contra produção.

Sem merge, mudança de visibilidade, configuração de serviço externo ou alteração de dados de usuários.
