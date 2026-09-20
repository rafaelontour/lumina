## 1. Preparação e estado de apresentação

- [x] 1.1 Consultar a documentação local relevante do Next.js 16 e revisar o fluxo atual de dados e renderização de `DocumentosOrientandosWorkspace`.

## 2. Cartões de orientandos

- [x] 2.1 Substituir a pilha sempre expandida por uma grade responsiva de cartões compactos contendo avatar circular, nome do orientando e o botão “Ver perfil”, sem revelar outros dados nessa primeira entrega.
- [x] 2.2 Estender os tipos e o serviço de orientação para listar os vínculos ativos do orientador autenticado com `created_at` por meio de `GET /advisorship`.
- [x] 2.3 Cruzar os vínculos por `advisorship_id` e exibir abaixo do nome “Vínculo desde DD/MM/AAAA”, com fallback legível e erro não bloqueante quando a data não estiver disponível.
- [x] 2.4 Remover o seletor de aluno, a busca por projeto, seus estados e cálculos associados e o resumo “Exibidos”, renderizando diretamente os cartões retornados.
- [x] 2.5 Exibir o `advisee.email` no cartão compacto do orientando, preservando a leitura e o tamanho do cartão quando o endereço for longo.
- [x] 2.6 Renomear “Documentos retornados” para “Total de documentos” e manter seu valor como a soma de `documentos.length` de todos os orientandos listados.
- [x] 2.7 Implementar a contagem visual de “Total de documentos” de zero até o total, avançando por cada inteiro, cancelando ciclos obsoletos e exibindo imediatamente o resultado quando houver preferência por movimento reduzido.

## 3. Modal de perfil

- [x] 3.1 Adicionar estado local para um perfil selecionado, conectar “Ver perfil” à abertura do modal e reconciliar ou fechar a seleção após atualização dos dados.
- [x] 3.2 Implementar o modal acessível e responsivo com backdrop, fechamento por botão, clique externo e Escape, repetindo avatar, nome e data do vínculo.
- [x] 3.3 Derivar, deduplicar e ordenar os nomes dos projetos dos documentos do orientando selecionado e apresentá-los em uma seção somente leitura.
- [x] 3.4 Adicionar busca local por nome de projeto, sem sensibilidade a maiúsculas ou acentos, com estados para ausência de projetos e nenhum resultado.
- [x] 3.5 Ampliar o modal e organizar seu conteúdo em um layout responsivo de seletor de projetos e painel de histórico.
- [x] 3.6 Agrupar os documentos por projeto normalizado e permitir selecionar um projeto por meio de controles acessíveis.
- [x] 3.7 Exibir o histórico de documentos enviados do projeto selecionado em ordem cronológica inversa, incluindo metadados e arquivamento, sem status ou eventos de processamento.
- [x] 3.8 Apresentar estados legíveis antes da seleção e quando não houver projetos retornados.
- [x] 3.9 Garantir que nomes longos de projetos quebrem dentro do cabeçalho do painel de documentos sem ultrapassar o modal.
- [x] 3.10 Adicionar “Ver documento” a cada item do histórico e controlar localmente o documento selecionado para visualização.
- [x] 3.11 Consultar as releases do documento selecionado, escolher a versão mais recente com arquivo e baixar o PDF pelo proxy autenticado.
- [x] 3.12 Implementar um segundo modal responsivo com o `PdfDocumentViewer`, incluindo estados de carregamento, indisponibilidade e erro e limpeza da URL temporária.
- [x] 3.13 Isolar foco, Tab e Escape no modal de documento, fechar somente a camada superior e devolver o foco ao botão de origem.
- [x] 3.14 Carregar e manter em memória, por documento do projeto selecionado, a release mais recente com arquivo e estados independentes de carregamento ou falha.
- [x] 3.15 Calcular a média das notas numéricas dos critérios da release e exibir no cartão “Nota média: N,N”, com estados “Sem nota” e “Nota indisponível”.
- [x] 3.16 Implementar a apresentação somente leitura de `description` e `check_tree`, incluindo tipificações, taxonomias, critérios, classificações, notas, feedback e fontes.
- [x] 3.17 Dividir responsivamente o modal de documento entre o PDF e o resultado da análise da mesma release, empilhando os painéis em telas estreitas.
- [x] 3.18 Preservar estados independentes de PDF e análise indisponíveis sem buscar conteúdo de outra release.
- [x] 3.19 Carregar o catálogo de grupos por `listarGruposDocumento()`, associar o grupo do projeto por nome normalizado e manter um fallback não bloqueante baseado nos tipos retornados.
- [x] 3.20 Criar tabs acessíveis, na ordem dos itens obrigatórios do grupo, e filtrar cada painel exclusivamente pelos documentos cujo `tipo_documento` corresponda à tab ativa.
- [x] 3.21 Manter visível toda tab obrigatória sem envio e apresentar nela somente “Nenhum arquivo enviado ainda”.
- [x] 3.22 Ampliar o modal de perfil para aproveitar mais a largura horizontal disponível e manter a lista de tabs responsiva, com rolagem horizontal quando necessário.
- [x] 3.23 Exibir o e-mail do orientando no cabeçalho do modal de perfil junto ao nome e à data do vínculo.
- [x] 3.24 Adicionar as tabs principais acessíveis “OIAC IA” e “Grupo de documentos”, selecionando inicialmente “OIAC IA” e mantendo seus estados aninhados separados.
- [x] 3.25 Expor `source` em `DocumentoOrientando` e separar documentos avulsos `oiac-ia-avulsa` da resolução de projetos e grupos, preservando documentos de grupo atuais e legados.
- [x] 3.26 Listar em “OIAC IA” conversas candidatas de documentos avulsos e de grupo e carregar sob demanda as mensagens do documento selecionado por `listarMensagensDocumento`.
- [x] 3.27 Renderizar a conversa em ordem cronológica, distinguindo IA por menção `AI` e orientando nos demais casos, com estados de carregamento, vazio e erro e sem compositor ou mutação.
- [x] 3.28 Restringir busca, projetos, catálogo e tabs por tipo à área “Grupo de documentos”, evitando o aviso de catálogo para documentos avulsos do OIAC IA.
- [x] 3.29 Renderizar os cartões do tipo ativo como uma linha do tempo vertical em ordem cronológica inversa, conectando somente históricos com múltiplos arquivos e sem segmentos antes do primeiro ou após o último marcador.

## 4. Preservação de comportamento

- [x] 4.1 Verificar que atualização, reconciliação do modal, estados vazios e falhas totais e parciais continuam funcionando.
- [x] 4.2 Verificar que a tela permanece exclusiva para `ADMIN`, somente leitura e sem persistir o estado do modal no navegador.
- [x] 4.3 Verificar que busca, seleção de projeto e atualização dos dados não misturam documentos entre projetos ou orientandos.
- [x] 4.4 Verificar que a visualização carrega somente o PDF do documento acionado e não introduz download ou mutações.
- [x] 4.5 Verificar que a nota média, o PDF e a análise exibidos pertencem à mesma release mais recente com arquivo, inclusive quando uma versão anterior possui análise e a atual não.
- [x] 4.6 Verificar que as tabs não misturam tipos, continuam disponíveis sem documentos e preservam nota, release, PDF e análise do documento correto.
- [x] 4.7 Verificar que cartão e modal apresentam o e-mail do mesmo orientando e que “Total de documentos” soma todos os documentos carregados da coleção.
- [x] 4.8 Verificar que o contador não salta inteiros, termina no total calculado, reinicia sem sobrepor animações quando o total muda e não anuncia valores intermediários a tecnologias assistivas.
- [x] 4.9 Verificar que conversas e documentos de grupo não se misturam entre orientandos, que os atores da conversa são rotulados corretamente e que todos os novos estados permanecem somente leitura.

## 5. Verificação

- [ ] 5.1 Validar manualmente abertura e fechamento dos modais, nome e e-mail exibidos, total agregado e sua contagem animada, movimento reduzido, tabs principais, conversas avulsas e de grupo, atores e estados da conversa, separação por origem, seleção e busca de projetos, tabs por tipo obrigatório, tipos sem envio, linha do tempo, nota média, análise de tipificação, visualização de PDF, catálogo indisponível e adaptação responsiva do modal ampliado.
- [x] 5.2 Executar `pnpm lint` e `pnpm build` após implementar as tabs principais, conversas, separação por origem, estado vazio revisado e linha do tempo.
- [x] 5.3 Executar `openspec validate refine-advisee-list-cards --type change` após concluir a implementação revisada.
