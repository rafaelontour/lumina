## Why

Uma mesma versão de PDF pode hoje iniciar diversas análises ABNT, mesmo depois de já haver uma execução para ela. Limitar a análise a uma execução por versão evita reprocessamentos duplicados e orienta a pessoa a enviar uma nova versão antes de solicitar outra verificação.

## What Changes

- Permitir uma única análise de conformidade ABNT para cada versão mais recente de um documento do workspace.
- Bloquear a ação “Iniciar análise” assim que uma execução para a versão selecionada for aceita, inclusive após recarregar a página ou a execução alcançar um estado terminal.
- Explicar que é necessário enviar uma nova versão do PDF em Documentos para habilitar uma nova análise ABNT.
- Reabilitar a ação somente quando o workspace identificar uma versão de PDF posterior para o mesmo componente.
- Preservar o relatório e o histórico de resultados já existentes, sem iniciar uma análise durante o upload da nova versão.

## Capabilities

### New Capabilities

<!-- Nenhuma. -->

### Modified Capabilities

- `conformity-checks`: o fluxo ABNT passa a limitar execuções a uma por versão de PDF e comunica a necessidade de uma nova versão para nova análise.

## Impact

- Afeta a consulta de histórico ABNT e o estado/ação do workspace em `ConformidadeAbntWorkspace`.
- Usa os campos de versão já disponíveis no workspace e o histórico retornado por `GET /abnt/{docId}/conformidade`; não altera endpoints, autenticação ou o upload de Documentos.
