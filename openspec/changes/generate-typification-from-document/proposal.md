## Why

Administradores precisam cadastrar árvores de verificação extensas a partir de documentos normativos, mas hoje toda tipificação, taxonomia e ramo deve ser digitada manualmente. O backend já oferece sessões assíncronas de sugestão baseadas em PDF, permitindo acrescentar um fluxo assistido sem retirar o controle humano nem substituir a criação manual existente.

## What Changes

- Manter “Criar manualmente” como modo completo de cadastro de tipificação.
- Ao iniciar uma nova tipificação, permitir que o administrador escolha entre criação manual e geração a partir de documento.
- Adicionar um fluxo administrativo para enviar um PDF e criar uma sessão de sugestão pelo backend.
- Permitir que o modo por documento crie uma tipificação nova ou enriqueça uma tipificação existente.
- Acompanhar sessões assíncronas e apresentar estados de processamento, revisão, falha e conclusão.
- Apresentar hierarquicamente fontes, tipificações, taxonomias e ramos sugeridos, incluindo operação proposta, justificativa, similaridade e evidências do PDF.
- Exigir revisão humana antes de qualquer sugestão entrar na árvore real, permitindo confirmar com ou sem ajustes ou descartar itens pendentes.
- Respeitar dependências hierárquicas durante a confirmação e deixar explícito que cada confirmação pode modificar imediatamente a árvore real.
- Restaurar sessões armazenadas pelo backend e atualizar a listagem canônica de tipificações após confirmações.
- Manter todo o fluxo de geração e revisão disponível somente para contas `ADMIN`, assim como a gestão manual existente.

## Capabilities

### New Capabilities

- `document-assisted-typification`: envio de PDF, acompanhamento de sessões e revisão humana das sugestões antes de aplicá-las à árvore de verificação.

### Modified Capabilities

- `typification-browser`: oferecer os modos manual e por documento na entrada de criação e reconciliar a listagem após alterações aplicadas por uma sessão.
- `typification-management-access`: restringir upload, sessões de sugestão e ações de revisão a contas administrativas na interface.

## Impact

- Página de Tipificações e seus formulários em `app/(paginas)/tipificacoes/page.tsx`.
- Novos componentes de seleção de modo, upload, acompanhamento e revisão de sugestões.
- Tipos e serviços frontend para `POST/GET /tree-suggestion` e suas operações de confirmação e descarte, sempre através de `/api/backend/*`.
- Integração com a listagem existente de tipificações para o modo de enriquecimento e para restauração do estado canônico após confirmações.
- Nenhuma remoção do fluxo manual e nenhuma nova dependência prevista.
