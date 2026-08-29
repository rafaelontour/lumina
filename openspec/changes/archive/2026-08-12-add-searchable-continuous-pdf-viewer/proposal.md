## Why

O visualizador atual da Oiac IA mostra apenas uma página do PDF por vez, o que fragmenta a leitura e dificulta localizar trechos do documento. A pessoa usuária precisa visualizar o documento completo em fluxo contínuo e encontrar termos exatos diretamente no painel de leitura.

## What Changes

- Substituir a visualização paginada do PDF da Oiac IA por uma visualização contínua que mantém todas as páginas disponíveis no painel rolável.
- Adicionar uma caixa de busca ao visualizador para localizar ocorrências exatas de texto no PDF.
- Destacar as ocorrências encontradas e permitir avançar e retroceder entre elas, com indicação da ocorrência atual e do total.
- Manter controles de zoom, o carregamento de PDFs por conversa e os estados existentes de carregamento, indisponibilidade e falha.

## Capabilities

### New Capabilities

- `searchable-pdf-viewer`: Visualização contínua de PDFs com pesquisa textual exata, destaque e navegação entre ocorrências.

### Modified Capabilities

- `oiac-ia-chat`: O painel de documento da Oiac IA passa a usar o novo visualizador contínuo pesquisável sem alterar o contrato da conversa ou do PDF selecionado.

## Impact

- Componentes afetados: `PdfDocumentViewer` e a área de pré-visualização em `OiacIaChat`.
- Dependências: reutiliza `react-pdf` e `pdfjs-dist`; nenhuma nova API ou persistência é necessária.
- Experiência: a leitura passa a ocorrer por rolagem contínua, e o usuário pode pesquisar texto no PDF dentro da Oiac IA.
