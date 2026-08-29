## Why

A conformidade com template permite reenviar a mesma versão do arquivo para análise, diferentemente da conformidade ABNT. Isso gera execuções duplicadas e torna incerto qual resultado representa a versão atual; além disso, a conclusão nem sempre gera uma confirmação visual para a pessoa usuária.

## What Changes

- Limitar a conformidade com template a uma execução por versão enviada do arquivo.
- Habilitar uma nova análise com template quando a nova versão enviada no workspace Documentos terminar sua análise principal, sem iniciá-la automaticamente.
- Identificar visualmente, na lista de documentos, as versões que já possuem análise de template.
- Carregar essa identificação já na abertura da página, sem exigir um clique no documento.
- Destacar no histórico a execução correspondente ao relatório exibido no workspace.
- Mostrar um popup de sucesso toda vez que uma análise iniciada na sessão alcançar a conclusão, inclusive quando a API a concluir sem uma etapa de polling intermediária.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `template-conformity-results`: a elegibilidade para iniciar a análise e a notificação de conclusão passam a ser determinadas por versão do arquivo.

## Impact

- Afeta os workspaces de Conformidade Template e ABNT, a seleção de resultados e os tipos/serviços de conformidade.
- Continua usando os mesmos endpoints autenticados, sem criar release, sem alterar resultados no backend e sem persistência no navegador.
