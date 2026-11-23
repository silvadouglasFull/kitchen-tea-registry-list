Leia o AGENTS.md e execute exclusivamente a Task 001 (infraestrutura local e bootstrap do projeto), seguindo as definições de ADR-013, SPEC-013 e os templates em docs/templates/.

Regras e escopo:
- Suba e valide o ambiente Docker local com PostgreSQL e Garage (substituindo MinIO). Não crie ou use imagens Docker para Node.js ou Nginx; o Node.js rodará nativamente no host.
- Configure as variáveis de ambiente no lado do servidor a partir dos templates em docs/templates/, sem expor segredos ou credenciais no cliente ou commitar valores sensíveis.
- Inicialize/verifique o projeto Next.js e instale apenas as dependências base necessárias para esta etapa.
- Trabalhe em passos pequenos, mostre o que foi alterado e valide se o banco e o Garage respondem antes de concluir.
- Não avance para a Task 002 nem adicione funcionalidades fora do escopo da Task 001.