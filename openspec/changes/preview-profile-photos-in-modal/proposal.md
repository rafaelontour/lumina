## Why

Fotos pequenas de perfil dificultam reconhecer o usuário e seus orientandos. Permitir ampliá-las sem sair do contexto torna a identificação mais fácil e mantém a navegação fluida.

## What Changes

- Permitir abrir a foto do próprio perfil em um modal, incluindo a prévia temporária selecionada antes de salvar.
- Permitir abrir em um modal as fotos de orientandos exibidas na lista e no cabeçalho do perfil detalhado.
- Reutilizar a imagem autenticada existente e manter o fallback de iniciais quando não houver foto.

## Capabilities

### New Capabilities

### Modified Capabilities
- `user-profile-management`: a foto de perfil pode ser ampliada em um modal.
- `advisee-document-monitoring`: fotos dos orientandos podem ser ampliadas em um modal na lista e no perfil detalhado.

## Impact

- Componentes compartilhados de avatar e as áreas de perfil pessoal e monitoramento de orientandos.
- Nenhuma alteração de API ou dependência; a foto continua sendo carregada pela URL autenticada já usada pelo frontend.
