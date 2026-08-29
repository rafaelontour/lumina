## 1. Integração do catálogo

- [x] 1.1 Criar operações autenticadas para listar, criar, atualizar e excluir templates pelo contrato multipart da API.
- [x] 1.2 Completar os tipos de template usados pelo catálogo administrativo.

## 2. Workspace administrativo

- [x] 2.1 Criar a rota `/templates` e o workspace para listagem, criação, edição e exclusão confirmada.
- [x] 2.2 Exibir estados de carregamento, catálogo vazio e erros de mutação sem perder o contexto do formulário.
- [x] 2.3 Manter o atalho de nome e o controle de limpeza alinhados ao campo, além de destacar a seleção de PDF com “Escolher arquivo”.
- [x] 2.4 Manter o cabeçalho da rota Templates visível durante a rolagem do catálogo.

## 3. Controle de acesso e navegação

- [x] 3.1 Adicionar a entrada exclusiva de administrador “Templates” na barra lateral.
- [x] 3.2 Redirecionar contas não ADMIN que acessem diretamente `/templates` e impedir a consulta do catálogo.

## 4. Verificação

- [x] 4.1 Executar lint, build e validação do OpenSpec.
- [x] 4.2 Confirmar manualmente, com uma conta ADMIN, criação, edição e exclusão de um template PDF.
- [x] 4.3 Confirmar manualmente que uma conta DEFAULT não vê nem acessa a rota de templates.
