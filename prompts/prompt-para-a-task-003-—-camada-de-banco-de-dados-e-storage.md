Leia o AGENTS.md e execute exclusivamente a Task 003 (camada de banco de dados com Drizzle ORM + PostgreSQL e camada de storage compatível com Garage localmente e Cloudflare R2 em produção).

Regras e escopo:
- Crie um arquivo de schema dedicado por tabela no Drizzle ORM para as 5 tabelas definidas na modelagem, com suporte a múltiplas conexões quando necessário e fluxo de migrações via Drizzle Kit CLI.
- Estruture a camada de storage via SDK S3 isolada no servidor, usando Garage no ambiente local e preparada para Cloudflare R2 sem vazar credenciais para o cliente.
- Mantenha a separação de camadas (`domain`, `application`, `infrastructure`) e siga kebab-case / camelCase / PascalCase.
- Trabalhe em passos pequenos, valide migrações/conexão e lint, e não avance para a Task 004.