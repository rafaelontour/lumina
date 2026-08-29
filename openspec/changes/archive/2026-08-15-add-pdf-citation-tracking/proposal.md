## Why

Os pareceres da Oiac IA indicam se um critério foi atendido, mas o usuário ainda precisa procurar manualmente no PDF o trecho que fundamentou a avaliação. O backend já entrega as referências de chunks, páginas e retângulos de evidência no `check_tree`, permitindo ligar cada parecer à sua localização exata no documento.

## What Changes

- Normalizar as citações e referências retornadas na avaliação de cada ramo, incluindo identificador de chunk, trecho, página e retângulos de localização.
- Exibir, junto ao parecer de cada critério que tiver evidências, controles de citação que indiquem a página e permitam localizar o trecho no PDF.
- Fazer com que a seleção de uma evidência navegue o leitor de PDF para a página referenciada, desenhe os destaques correspondentes e realce temporariamente a evidência selecionada.
- Manter a pesquisa textual, zoom, fluxo de chat, arquivo PDF autenticado e apresentação atual da análise funcionando quando não houver referências ou quando uma referência estiver incompleta.

## Capabilities

### New Capabilities

- `pdf-evidence-navigation`: localização visual de referências de chunks no leitor de PDF a partir de página e retângulos retornados pelo backend.

### Modified Capabilities

- `oiac-ia-chat`: expor evidências navegáveis nos critérios da análise inicial da release.
- `searchable-pdf-viewer`: receber uma evidência selecionada, navegar até sua página e apresentar os destaques geométricos sem afetar a pesquisa existente.

## Impact

- Afeta `app/types/Documento.ts`, a normalização em `app/services/documento.ts`, `app/components/OiacIaChat.tsx` e `app/components/PdfDocumentViewer.tsx`.
- Reutiliza o `GET /doc/{docId}/release` já consumido pelo workspace; a resposta de release contém referências em `check_tree[*].taxonomies[*].branches[*].evaluation.references`.
- Não requer endpoint novo, persistência em navegador ou dependência adicional; o PDF permanece obtido pelo caminho autenticado atual.
