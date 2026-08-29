## Why

O detalhamento de tipificações nas respostas da Oiac IA pode conter muitas taxonomias, critérios, fontes e avaliações, ocupando excessivamente a conversa. Tornar a explicação de cada taxonomia expansível permite consultar seu conteúdo sem perder a visão da estrutura de tipificação.

## What Changes

- Manter o nome da tipificação e sua estrutura principal sempre visíveis no detalhamento de uma resposta da Oiac IA.
- Transformar cada taxonomia em um controle expansível e recolhível, mantendo seu título visível e apresentando explicação, fontes, critérios, status, notas e feedback apenas quando ela estiver aberta.
- Usar um controle acessível de expansão e recolhimento, com indicação visual clara de estado aberto ou fechado, operação por teclado e uma animação curta para evitar transições abruptas.
- Preservar a ordem dos dados e o conteúdo atual das avaliações, sem alterar a resposta da IA, dados do backend ou o restante do chat.

## Capabilities

### New Capabilities

- `ai-response-taxonomy-explanation-disclosure`: apresentação expansível das explicações de taxonomias no detalhamento de respostas da Oiac IA.

### Modified Capabilities

<!-- Nenhuma. -->

## Impact

- Afeta o componente de detalhamento de análise em `app/components/OiacIaChat.tsx`.
- Não altera endpoints, contratos de dados, persistência, dependências ou os fluxos de análise e chat.
