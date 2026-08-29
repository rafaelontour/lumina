## 1. Dados de evidência da análise

- [x] 1.1 Revisar a documentação local relevante do Next.js 16 e os contratos de release/referência do backend antes de editar componentes clientes.
- [x] 1.2 Definir tipos de frontend para citações, referências de documento e retângulos de evidência dentro da avaliação de cada ramo.
- [x] 1.3 Normalizar `evaluation.citations` e `evaluation.references` da release, preservando somente página e coordenadas válidas e mantendo referências navegáveis sem retângulos.

## 2. Navegação da evidência no workspace Oiac IA

- [x] 2.1 Adicionar o estado da referência selecionada ao workspace Oiac IA e limpá-lo adequadamente quando conversa, release ou arquivo PDF mudar.
- [x] 2.2 Exibir controles de evidência, identificados pela página, junto ao feedback dos critérios da análise inicial sem alterar critérios que não tenham referências.
- [x] 2.3 Passar a evidência selecionada ao leitor de PDF e manter a conversa, a análise e os controles de busca atuais funcionais.

## 3. Destaque geométrico no leitor PDF

- [x] 3.1 Estender o leitor PDF para converter a página de base zero e os retângulos da referência em sobreposições alinhadas a cada página renderizada.
- [x] 3.2 Rolar para a evidência selecionada, substituir destaques anteriores, aplicar realce visual temporário e manter os destaques alinhados após mudanças de zoom.
- [x] 3.3 Exibir feedback não bloqueante para evidência sem retângulos, página inválida ou página ainda indisponível, preservando a leitura e a busca textual.

## 4. Verificação

- [x] 4.1 Verificar com um `documentId` listado em `/doc` cuja release contenha referências que os controles navegam para a página e destacam todos os retângulos corretos.
- [x] 4.2 Verificar PDF de múltiplas páginas, zoom, pesquisa textual ativa, troca de evidência, ausência de referências, ausência de retângulos e troca de conversa/release.
- [x] 4.3 Executar `pnpm lint`, `pnpm build` e `openspec validate add-pdf-citation-tracking --type change`.
