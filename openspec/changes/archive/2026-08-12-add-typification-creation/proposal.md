## Why

A rota de Tipificações hoje permite apenas consultar a árvore já cadastrada. Para que a equipe possa preparar critérios de análise sem sair do Lumina, ela precisa criar uma tipificação completa com suas taxonomias e ramos.

## What Changes

- Adicionar, no lado oposto ao título “Árvore de verificação”, o botão para criar uma nova tipificação.
- Abrir um formulário de criação que permita informar o nome da tipificação e montar sua estrutura de taxonomias e ramos.
- Permitir adicionar e remover taxonomias, e adicionar e remover ramos dentro de cada taxonomia antes do envio.
- Validar que a tipificação tenha nome, ao menos uma taxonomia e ao menos um ramo em cada taxonomia.
- Salvar a estrutura hierárquica pelas operações de tipificação, taxonomia e ramo do backend e atualizar a listagem, os totais e a pesquisa após o cadastro bem-sucedido.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `typification-browser`: A página de Tipificações passa de consulta para também permitir a criação de tipificações com taxonomias e ramos.

## Impact

- Interface afetada: cabeçalho e conteúdo da rota `/tipificacoes`.
- Serviços e tipos afetados: cliente de tipificações e DTOs de criação hierárquica.
- Backend: reutiliza as operações autenticadas `POST /typification`, `POST /taxonomy` e `POST /branch`, chamadas pelo proxy `/api/backend/*`.
- Persistência: nenhuma persistência no navegador; a listagem é atualizada a partir do resultado do backend.
