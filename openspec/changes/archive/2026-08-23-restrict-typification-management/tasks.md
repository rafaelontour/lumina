## 1. Controle de acesso à base de conhecimento

- [x] 1.1 Consultar a documentação local aplicável do Next.js 16 antes de alterar a página interativa de Tipificações.
- [x] 1.2 Derivar o perfil autenticado na página Tipificações e centralizar a verificação de permissão de gestão para `ADMIN`.
- [x] 1.3 Ocultar para contas não ADMIN os controles de criar, editar, adicionar, remover e excluir tipificações, taxonomias e ramos, preservando a navegação de leitura e o modal de detalhes.
- [x] 1.4 Proteger os manipuladores de abertura e envio dos formulários para que contas não ADMIN não possam disparar operações de escrita por estado obsoleto ou interação direta.

## 2. Verificação

- [x] 2.1 Confirmar que uma conta DEFAULT visualiza a árvore e os detalhes de taxonomias sem controles de mutação nem chamadas de escrita.
- [x] 2.2 Confirmar que uma conta ADMIN mantém os controles de criação, edição e exclusão da árvore.
- [x] 2.3 Executar `pnpm lint`, `pnpm build` e `openspec validate restrict-typification-management --type change`.
