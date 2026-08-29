## 1. Criação contextual de taxonomia

- [x] 1.1 Estender o formulário de nova taxonomia de uma tipificação existente com os campos obrigatórios do primeiro ramo, preservando a edição de taxonomia existente.
- [x] 1.2 Validar título e descrição da taxonomia e do primeiro ramo antes de iniciar uma requisição ao backend, mantendo o formulário aberto com erro compreensível quando faltar dado.
- [x] 1.3 Persistir a nova taxonomia e seu primeiro ramo como uma única operação de serviço, com tentativa de remoção compensatória se o ramo não puder ser criado.

## 2. Verificação

- [x] 2.1 Confirmar que um envio sem ramo, título de ramo ou descrição de ramo não cria registros no backend e mostra o erro apropriado.
- [x] 2.2 Confirmar que uma taxonomia com primeiro ramo válido é criada e aparece após a atualização da lista, sem alterar os fluxos de edição de taxonomia e inclusão de ramos existentes.
- [x] 2.3 Executar `pnpm lint`, `pnpm build` e `openspec validate require-taxonomy-branches --type change`.
