Leia o AGENTS.md e execute exclusivamente a Task 004 (autenticação social via Google OAuth 2.0 e módulo restrito de foto de perfil do usuário).

Regras e escopo:
- Implemente o fluxo de login, callback e logout com Google OAuth 2.0 vinculando `users` e `authAccounts`, mantendo segredos e tokens exclusivamente no servidor.
- Implemente o módulo de perfil (`userProfiles`) restrito à foto de perfil, expondo apenas os 4 métodos previstos, retornando exclusivamente a `publicUrl` e removendo arquivos antigos do storage ao substituir/excluir.
- Respeite a arquitetura modular (`domain`, `application`, `infrastructure`), schemas Zod puros, checagem de sessão e posse (`userId`), e o retorno padronizado `{ success, error?, data? }` nas Server Actions.
- Trabalhe em passos pequenos, rode o lint e não avance para a Task 005.