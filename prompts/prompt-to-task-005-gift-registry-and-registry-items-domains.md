Leia o AGENTS.md e execute exclusivamente a Task 005 (módulos de domínio Gift Registry e Registry Items e integração com storage para fotos de itens).

Regras e escopo:
- Estruture os módulos de `Gift Registry` e `Registry Items` em `domain`, `application` e `infrastructure` (repositórios com Drizzle ORM sem regra de negócio, services com regras de negócio, Server Actions com `.safeParse()` e retorno `{ success, error?, data? }`).
- Inclua geração de `slug` único, validação com Zod puro, verificação de sessão e posse (`resource.userId === session.userId`), *soft delete* e projeções adequadas para organizador e convidado.
- Integre o upload/substituição/remoção de fotos opcionais dos itens ao módulo de storage (Garage localmente / Cloudflare R2), limpando objetos órfãos/antigos.
- Trabalhe em passos pequenos, rode o lint e não avance para a Task 006.