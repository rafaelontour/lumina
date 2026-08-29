## Why

Os popups modais escurecem o conteúdo da plataforma, mas mantêm o fundo visualmente nítido. Um leve desfoque reforça a separação entre a tarefa modal e o conteúdo inativo.

## What Changes

- Aplicar um leve desfoque ao backdrop de todos os diálogos modais que sobrepõem uma página da plataforma.
- Preservar a transparência, o contraste, a ordem de empilhamento, as interações de fechamento e o conteúdo dos diálogos existentes.
- Não tratar toasts, avisos flutuantes ou a tela obrigatória de onboarding como popups com backdrop.

## Capabilities

### New Capabilities

<!-- Nenhuma. -->

### Modified Capabilities

- `app-shell`: os diálogos modais da aplicação passam a desfocar levemente o conteúdo inativo atrás de seus backdrops.

## Impact

- Afeta os backdrops de diálogos de Documentos, Tipificações, Templates e histórico de Conformidade.
- Não altera rotas, estado, chamadas de API ou regras de acessibilidade dos diálogos.
