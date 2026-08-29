## Why

Depois de criar uma tipificação, a equipe não consegue corrigir ou evoluir sua árvore pelo Lumina. A tela precisa permitir manter o nome da tipificação, suas taxonomias e seus ramos sem depender de uma operação externa.

## What Changes

- Adicionar ao cartão da tipificação uma ação para editar somente seu nome e outra para excluí-la.
- Colocar as ações de editar e remover uma taxonomia no próprio cartão da taxonomia, sem abrir um editor da árvore inteira.
- Manter os ramos no modal aberto ao selecionar uma taxonomia; cada cartão de ramo terá ações para editar seus dados e removê-lo.
- Permitir adicionar taxonomias no cartão da tipificação e ramos no modal da taxonomia.
- Validar a árvore antes de salvar, persistir as atualizações pelos endpoints existentes e refletir o estado canônico recarregado do backend.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `typification-browser`: A página de Tipificações passa a permitir editar uma árvore existente, inclusive seus elementos aninhados.

## Impact

- Interface afetada: cartões de tipificação e novo formulário de edição na rota `/tipificacoes`.
- Serviços e tipos afetados: operações autenticadas de criação, atualização e remoção e tipos de rascunho para tipificações, taxonomias e ramos.
- Backend: usa `POST`, `PUT` e `DELETE` de tipificações, taxonomias e ramos via proxy `/api/backend/*`.
- Persistência: nenhuma persistência no navegador; ao concluir ou falhar, a árvore exibida é recarregada do backend.
