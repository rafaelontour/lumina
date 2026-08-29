## Why

Tipificações, taxonomias e ramos formam a base de conhecimento compartilhada da plataforma. Permitir que orientandos alterem essa estrutura compromete a consistência das revisões e do contexto acadêmico.

## What Changes

- Restringir a criação, edição e exclusão de tipificações, taxonomias e ramos a contas `ADMIN`, que atualmente representam professores/orientadores.
- Manter contas `DEFAULT` com acesso de consulta à árvore de conhecimento, sem controles de mutação ou chamadas de escrita.
- Proteger a interface de Tipificações contra acesso direto a formulários e ações de gestão por contas não administrativas.

## Capabilities

### New Capabilities

- `typification-management-access`: controle de acesso por perfil para a gestão da base de conhecimento de tipificações.

### Modified Capabilities

- `typification-browser`: a página passa a expor ações de criação, edição e exclusão apenas para contas `ADMIN`.

## Impact

- Afeta a rota `/tipificacoes`, seus controles de gestão e a navegação contextual de formulários.
- Preserva as operações existentes do backend; o frontend deixa de oferecer chamadas de escrita a contas `DEFAULT`.
- Não altera a disponibilidade de leitura da base de conhecimento.
