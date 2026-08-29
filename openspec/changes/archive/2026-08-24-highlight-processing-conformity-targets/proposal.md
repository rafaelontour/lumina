## Why

Uma análise de conformidade pode continuar no backend depois que a pessoa sai ou atualiza a página. Ao retornar, ela precisa identificar de imediato qual documento ainda está sendo analisado, sem depender de abrir o painel de resultado ou lembrar a seleção anterior.

## What Changes

- Destacar, nos seletores de documento de Conformidade Template e Conformidade ABNT, cada alvo cujo resultado mais recente esteja em processamento.
- Combinar uma cor de superfície sutilmente distinta com um badge e pequena animação indicativos, coerentes com os tokens visuais e a preferência por menos movimento.
- Ativar o destaque somente depois que a pessoa iniciar explicitamente uma análise na visita atual da página.
- Remover o destaque assim que a execução se tornar concluída, falhar ou não existir mais como o resultado mais recente.
- Descartar o destaque ao recarregar, sair ou retornar à rota, sem consultar o backend para restaurá-lo.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `conformity-checks`: Os seletores de alvo dos dois workspaces de conformidade passam a comunicar visualmente as análises em processamento, inclusive após recarregar ou revisitar a rota.

## Impact

- Afeta `ConformidadeTemplateWorkspace` e `ConformidadeAbntWorkspace`, reutilizando suas consultas de resultado e polling existentes.
- Não altera o contrato da API, o envio de PDFs, o cache em memória nem o conteúdo dos relatórios.
