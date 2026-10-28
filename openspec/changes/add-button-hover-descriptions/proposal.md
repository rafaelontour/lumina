## Why

Alguns botões dependem apenas do texto curto ou de um ícone para comunicar sua ação, deixando a intenção pouco clara antes do clique. Descrições nativas ao passar o mouse tornam a interface mais explícita sem alterar os fluxos existentes.

## What Changes

- Adicionar `title` descritivo a todos os botões da interface, incluindo controles apenas com ícone e ações condicionais.
- Descrever a ação que será executada ou o estado para o qual um controle alternável mudará.
- Manter rótulos visíveis e acessíveis existentes; `title` complementa, não substitui, o nome acessível.

## Capabilities

### New Capabilities
- `button-action-descriptions`: títulos nativos claros e específicos em todos os botões interativos da aplicação.

### Modified Capabilities

## Impact

- Componentes de interface em `app/`, incluindo navegação, formulários, modais, visualizadores e workspaces.
- Nenhuma API, dependência ou fluxo funcional será alterado.
