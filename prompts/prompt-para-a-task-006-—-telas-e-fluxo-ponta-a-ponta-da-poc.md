Leia o AGENTS.md e execute exclusivamente a Task 006 (telas e fluxo de interface essenciais da PoC conectando autenticação, perfil, listas, itens e visualização pública).

Regras e escopo:
- Implemente as telas e fluxos essenciais da PoC: login Google OAuth, área autenticada do organizador (foto de perfil, gerenciamento de listas, revelação do link compartilhável/`slug` apenas ao clicar em compartilhar e tela dedicada de itens sem expor campos internos ou de auditoria) e rota pública da lista compartilhada exibindo apenas registros ativos, não deletados e não expirados.
- Conecte os componentes físicos `.tsx` às Server Actions com o envelope `{ success, error?, data? }` e mensagens amigáveis sem expor detalhes internos.
- Mantenha o foco estrito na PoC (sem adicionar funcionalidades fora do escopo como reserva de presentes, RSVP, mural de recados ou PIX).
- Trabalhe em passos pequenos, teste o fluxo ponta a ponta, rode o lint e revise o resultado.