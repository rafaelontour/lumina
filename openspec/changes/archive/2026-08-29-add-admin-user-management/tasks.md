## 1. Dados e integração administrativa

- [x] 1.1 Modelar a lista de usuários e implementar no serviço a consulta autenticada de `GET /api/backend/user`, incluindo busca e erros normalizados.
- [x] 1.2 Implementar no serviço a exclusão autenticada por `DELETE /api/backend/user/{userId}`, preservando o padrão de tupla e sem repetição automática.
- [x] 1.3 Implementar a atualização administrativa por `PUT /api/backend/user`, preservando os dados obrigatórios do usuário e alterando somente `DEFAULT` ou `ADMIN`.

## 2. Workspace de gerenciamento

- [x] 2.1 Criar a rota e o workspace `/usuarios` com estados de carregamento, vazio, erro e nova tentativa.
- [x] 2.2 Exibir os dados de cada usuário, aplicar busca por texto e identificar a conta administrativa atual.
- [x] 2.3 Implementar a confirmação acessível de remoção, impedindo a ação para a própria conta e atualizando a lista apenas após confirmação da API.
- [x] 2.4 Exibir notificações únicas de sucesso ou erro para a remoção, sem remover visualmente contas cuja solicitação falhou.
- [x] 2.5 Exibir a ação de alteração de acesso para outras contas, somente com `DEFAULT` (orientando) e `ADMIN` (orientador), e sem ação para a própria conta.
- [x] 2.6 Implementar confirmação acessível, atualização confirmada da lista e notificações únicas para a alteração de nível de acesso.

## 3. Acesso e navegação

- [x] 3.1 Adicionar a entrada de gerenciamento de usuários ao menu exclusivamente para administradores.
- [x] 3.2 Proteger a rota `/usuarios` no shell para que contas não administrativas não renderizem nem consultem o workspace.

## 4. Verificação

- [x] 4.1 Validar manualmente a busca, o cancelamento, a remoção confirmada de uma conta de teste e os estados de erro como administrador.
- [x] 4.2 Validar manualmente a alteração confirmada entre `DEFAULT` e `ADMIN`, seu cancelamento e erro de atualização como administrador.
- [x] 4.3 Validar que conta não administrativa não vê nem acessa a área e que a própria conta não pode ser removida ou ter a permissão alterada.
- [x] 4.4 Executar `pnpm lint`, `pnpm build` e `openspec validate add-admin-user-management --type change`.
