## Why

Quando uma nova versão de um documento ainda está na análise principal de Documentos, ela substitui temporariamente a versão já utilizável como alvo nas páginas de Conformidade. Isso interrompe a consulta da versão anterior e pode induzir o início de uma conformidade para uma release que ainda não está pronta.

## What Changes

- Exibir temporariamente a última versão com análise principal concluída como alvo de Conformidade quando a versão mais nova estiver pendente.
- Sinalizar que existe uma nova versão em análise e manter desabilitado o início de análises de Conformidade Template e ABNT até ela ficar disponível.
- Exibir somente o estado de processamento durante uma análise ABNT em andamento, sem apresentar simultaneamente o selo terminal “Analisado”.

## Capabilities

### New Capabilities

<!-- Nenhuma. -->

### Modified Capabilities

- `conformity-checks`: ajustar a seleção e os estados visuais de alvos ABNT enquanto a análise principal de uma nova versão está pendente.
- `template-conformity-results`: ajustar a seleção e a disponibilidade do início de análise enquanto a análise principal de uma nova versão está pendente.

## Impact

- `app/services/documento.ts`, `app/services/conformidade.ts` e os tipos de documento/conformidade.
- Workspaces de Conformidade ABNT e Conformidade Template.
- Não altera endpoints, nem cria conformidade automaticamente durante o upload.
