## 1. Dados de acompanhamento de orientandos

- [x] 1.1 Criar ou estender os tipos e o serviço de documentos para consultar os documentos de um orientando por `GET /advisorship/advisees/{advisee_id}/documents`, preservando os campos necessários de projeto, grupo, estado, arquivamento e atualização.
- [x] 1.2 Carregar os orientandos ativos do administrador por `GET /advisorship/my-advisees` e seus documentos sem recorrer à lista global de projetos nem a filtragem de autorização no navegador.
- [x] 1.3 Tratar falhas parciais de carregamento de orientandos sem descartar os resultados já obtidos e sem persistir os dados no armazenamento do navegador.

## 2. Área de Documentos

- [x] 2.1 Consultar a documentação local aplicável do Next.js 16 antes de alterar componentes ou rotas Next.js.
- [x] 2.2 Disponibilizar para ADMIN somente a página compacta “Meus orientandos” ao abrir `/documentos`, sem acesso à área pessoal; contas não administrativas devem manter a experiência atual e não consultar os endpoints de orientação nessa tela.
- [x] 2.3 Exibir os documentos em modo somente leitura, identificando o orientando e agrupando-os por projeto e grupo, com nome, tipo, estado de processamento, arquivamento e última atualização.
- [x] 2.4 Remover dessa página todos os controles da experiência de dono: criar projeto/grupo, enviar PDF, editar, analisar, gerar release, arquivar ou excluir.
- [x] 2.5 Buscar dados atualizados ao entrar na visão e por meio de atualização manual, com estados claros de carregamento, vazio e erro; em falha de atualização, manter na tela os dados carregados anteriormente.
- [x] 2.6 Adicionar filtro por aluno ativo, incluindo “Todos os alunos”, e barra de pesquisa por nome de projeto, aplicados somente aos documentos já retornados para o orientador autenticado.
- [x] 2.7 Ajustar a navegação do ADMIN para exibir “Meus orientandos” em vez de Documentos e remover qualquer atalho para a área pessoal.

## 3. Verificação

- [x] 3.1 Confirmar, com uma conta ADMIN e vínculos ativos, que a visão mostra somente os orientandos daquele administrador e os documentos retornados pelo backend para cada um.
- [x] 3.2 Confirmar que a página compacta do orientador não contém controles de criação, upload, edição, análise, release, arquivamento ou exclusão e que `/documentos` do ADMIN não exibe a área pessoal.
- [x] 3.3 Confirmar que o filtro por aluno e a pesquisa por projeto não exibem documentos de outros orientadores e funcionam em conjunto.
- [x] 3.4 Executar `pnpm lint`, `pnpm build` e `openspec validate show-advisee-documents-in-workspace --type change`.
