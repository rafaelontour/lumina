## Why

Os títulos e as ações principais das rotas deixam de estar acessíveis durante a rolagem do conteúdo. Além disso, a ação de adicionar documentos não possui a mesma hierarquia visual da ação de criar uma tipificação.

## What Changes

- Manter visíveis durante a rolagem os cabeçalhos das rotas de funcionalidades que possuem título e ações de página, inclusive `/documentos`, `/oiac-ia`, `/tipificacoes` e as rotas de conformidade.
- Preservar o shell fixo existente e aplicar o comportamento dentro da área rolável de cada rota, sem tornar a página inicial dependente de um cabeçalho inexistente.
- Dar à ação de adicionar documentos em `/documentos` o mesmo porte e estilo de ação primária usado por “Nova tipificação”.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `app-shell`: As rotas de funcionalidades passam a manter seus cabeçalhos de página visíveis dentro da área de conteúdo rolável.
- `document-workspace`: A ação para adicionar documentos passa a ter a mesma hierarquia visual da ação primária de criação em Tipificações.

## Impact

- Componentes de página nas rotas de funcionalidades e seus estilos de cabeçalho.
- Ação de adição de documentos na rota `/documentos`.
- Nenhuma alteração de backend, API, dependências ou persistência no navegador.
