## Why

Administradores são hoje redirecionados de `/documentos` para “Meus orientandos” e não conseguem manter documentos próprios, embora sejam também usuários autenticados da plataforma. Um orientador pode querer revisar um documento de interesse próprio, sem relação com qualquer orientando cadastrado, e por isso deve ter o mesmo workspace pessoal e as mesmas operações disponíveis ao usuário comum, sem comportamento especial dentro desse workspace.

## What Changes

- Disponibilizar o item “Meus documentos” no menu de administradores e usuários comuns, apontando para `/documentos`.
- Remover o redirecionamento de administradores de `/documentos` para `/documentos/orientandos`.
- Renderizar em `/documentos`, para administradores, o mesmo workspace pessoal, com as mesmas funcionalidades e regras usadas por contas `DEFAULT`.
- Permitir que o administrador crie e revise documentos próprios sem exigir orientando, vínculo de orientação ou associação do documento a um orientando.
- Manter “Meus orientandos” como item e rota separados, exclusivos de administradores e com comportamento somente leitura sobre documentos de orientandos.
- Garantir que os dados pessoais do administrador usem o escopo autenticado próprio (`mine`) e não se misturem aos dados dos orientandos.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `document-workspace`: ampliar o workspace pessoal completo de `/documentos` para qualquer usuário autenticado, inclusive `ADMIN`.
- `advisee-document-monitoring`: manter o monitoramento de orientandos como rota administrativa separada, sem substituir o workspace pessoal do administrador.
- `app-shell`: apresentar “Meus documentos” também a administradores, ao lado do acesso separado a “Meus orientandos”.

## Impact

- Navegação e filtros de itens em `app/data/constants/ItensMenu.tsx` e `app/components/MenuLateral.tsx`.
- Regras de redirecionamento protegido em `app/components/AppShell.tsx`.
- Rota existente `app/(paginas)/documentos/page.tsx`, reutilizada sem variante por perfil.
- Integração existente com `/project`, `/project-document`, `/document-group` e `/doc`; o OpenAPI publicado expõe essas operações a sessões autenticadas e oferece escopo pessoal, mas a equivalência real para uma sessão `ADMIN` deverá ser confirmada na verificação integrada.
