Leia o AGENTS.md e execute exclusivamente a Task 002 (padrões de código, contratos Zod puros e automação com Plop.js e shadcn-zod-form).

Regras e escopo:
- Instale e configure zod, plop (-D) e o uso do shadcn-zod-form (formulários físicos .tsx com React Hook Form, zodResolver, shadcn/ui e Tailwind CSS).
- Garanta que o ESLint esteja configurado e passando sem erros ou avisos (`npm run lint`).
- Aplique rigorosamente as convenções de nomenclatura: kebab-case para arquivos, camelCase para variáveis/funções/objetos/classes/schemas Zod, e PascalCase para tipos inferidos (`z.infer`) e componentes React.
- Use schemas Zod puros (separando criação, atualização e saída/domínio quando aplicável) e Server Actions validando entradas com `.safeParse()`.
- Nunca use `drizzle-zod` para contratos de aplicação, decoradores customizados de validação ou `AutoForm`/geração em tempo de execução.
- Faça em passos pequenos, rode o lint ao final e não avance para a Task 003.