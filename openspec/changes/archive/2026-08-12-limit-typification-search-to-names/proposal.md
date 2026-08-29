## Why

A busca que também considera taxonomias e ramos torna o resultado difícil de interpretar. A navegação da árvore já torna esses itens acessíveis depois que a tipificação é encontrada.

## What Changes

- Restringir a busca da rota de Tipificações ao nome da tipificação.
- Atualizar a dica do campo de busca para comunicar esse escopo.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `typification-browser`: A busca de tipificações passa a considerar apenas o nome da tipificação.

## Impact

- Interface afetada: campo de busca e lista filtrada na rota `/tipificacoes`.
- Nenhuma alteração no backend, serviços ou persistência.
