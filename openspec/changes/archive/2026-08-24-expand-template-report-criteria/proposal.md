## Why

Os critérios do relatório de template são apresentados em duas colunas mesmo quando um cartão não possui conteúdo complementar, desperdiçando largura e tornando a leitura de tabelas e justificativas mais difícil. Os blocos de metadados e resumo também precisam compartilhar um alinhamento superior consistente.

## What Changes

- Exibir cada critério de uma seção expandida usando toda a largura disponível do painel de resultado.
- Organizar os blocos superiores de metadados e resumo na mesma linha, alinhados pelo topo quando ambos estiverem disponíveis.
- Dar aos blocos superiores a mesma altura no desktop e traduzir rótulos e valores técnicos retornados pelo relatório.
- Preservar o conteúdo, a ordem, o recolhimento inicial das seções e o comportamento responsivo atual.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `template-conformity-results`: A apresentação do relatório concluído passa a aproveitar a largura total para critérios e alinha visualmente seus blocos informativos superiores.

## Impact

- Afeta o normalizador de apresentação e o layout de relatório em `ConformidadeTemplateWorkspace`.
- Não altera chamadas à API, status, seleção de documento ou conteúdo retornado pelo backend.
