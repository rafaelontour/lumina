## Why

O orientador consegue acompanhar seus orientandos ativos, mas não consegue encerrar um vínculo pela própria página “Meus orientandos”. A interface deve expor com segurança a remoção de vínculo já suportada pelo backend, sem confundir essa ação com exclusão da conta ou dos documentos do orientando.

## What Changes

- Adicionar a ação “Remover orientando” em cada cartão da página “Meus orientandos”.
- Exigir confirmação explícita que informe que somente o vínculo acadêmico será removido.
- Enviar `DELETE /advisorship/{advisorship_id}` usando o identificador do vínculo retornado no cartão.
- Desabilitar ações conflitantes durante a remoção e apresentar progresso no cartão afetado.
- Remover o cartão e atualizar os totais somente depois da confirmação bem-sucedida do backend.
- Preservar o cartão e apresentar erro legível quando a remoção falhar.
- Não excluir a conta, os projetos, os documentos, as releases ou as análises do orientando.
- Adicionar busca local por nome ou e-mail dos orientandos.
- Posicionar a busca ao lado dos resumos “Orientandos ativos” e “Total de documentos” na mesma faixa horizontal em telas largas, sem criar uma seção própria.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `advisee-document-monitoring`: permitir que o orientador autenticado remova um vínculo ativo diretamente do cartão e filtre a listagem por nome ou e-mail na mesma faixa dos resumos.

## Impact

- `app/components/DocumentosOrientandosWorkspace.tsx` para a ação, confirmação, progresso, reconciliação local da listagem e busca junto aos resumos.
- `app/services/orientacao.ts` para uma operação em tupla que chama o endpoint autenticado de remoção.
- Tipos existentes de orientação, que já expõem `advisorship_id`, sem alteração esperada no contrato de dados.
- Integração com `DELETE /advisorship/{advisorship_id}` por `/api/backend/*` e sessão em cookie `HttpOnly`.
- Nenhuma nova dependência e nenhuma exclusão de usuário ou conteúdo acadêmico.
