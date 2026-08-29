## Why

Uma tipificação já criada pode receber uma taxonomia sem ramos, resultando em uma árvore de verificação estruturalmente incompleta. A interface deve impedir essa gravação para preservar a regra de que toda taxonomia contém pelo menos um ramo.

## What Changes

- Validar a inclusão de taxonomias em tipificações existentes antes de qualquer gravação no backend.
- Exigir título e descrição válidos para a taxonomia e ao menos um ramo válido, com título e descrição, no mesmo fluxo de criação.
- Manter o usuário no formulário com uma mensagem clara quando a estrutura estiver incompleta, sem criar uma taxonomia órfã.

## Capabilities

### New Capabilities

<!-- Nenhuma. -->

### Modified Capabilities

- `typification-browser`: reforçar que taxonomias adicionadas a tipificações já persistidas só podem ser salvas junto de pelo menos um ramo válido.

## Impact

- Afeta o formulário contextual de inclusão de taxonomia em `app/(paginas)/tipificacoes/page.tsx`.
- Pode reutilizar as validações e operações de serviço de tipificação existentes; não altera a API nem dependências.
