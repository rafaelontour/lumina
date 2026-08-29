## Context

Os diálogos modais existentes usam diversos backdrops locais com semântica e opacidade já definidas. Eles abrangem Documentos, Tipificações, gestão de templates e os históricos de Conformidade.

## Goals / Non-Goals

**Goals:**

- Criar uma separação visual leve e uniforme entre diálogo e conteúdo inativo.
- Manter a aparência atual dos diálogos e seus comportamentos de interação.

**Non-Goals:**

- Transformar toasts ou avisos fixos em modais.
- Alterar o onboarding de orientação, que substitui a tela inteira em vez de sobrepor uma página visível.

## Decisions

- Adicionar a mesma utilidade de desfoque leve do backdrop aos elementos de overlay que já cobrem o viewport e contêm um diálogo modal. Isso preserva os tokens de cor e evita criar uma nova abstração para poucos locais existentes.
- Não alterar o painel do diálogo, apenas seu irmão de overlay; assim o conteúdo do diálogo permanece nítido.
- Preservar opacidade e z-index de cada overlay para não alterar hierarquia ou legibilidade.

## Risks / Trade-offs

- [Suporte parcial de `backdrop-filter`] → o escurecimento atual continua funcionando onde o desfoque não estiver disponível.
- [Diferenças visuais entre overlays] → aplicar uma única intensidade leve em todos os backdrops modais identificados.
