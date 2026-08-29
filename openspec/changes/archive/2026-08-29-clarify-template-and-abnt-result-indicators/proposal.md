## Why

Os relatórios de ABNT não evidenciam, em cada item, se a regra foi atendida. Já o relatório de template reúne verificações determinísticas e avaliações por IA, mas a apresentação precisa usar a fonte correta para cada tipo de critério.

## What Changes

- Exibir para cada critério do relatório ABNT um indicativo visual verde ou vermelho de conformidade, derivado exclusivamente de `match`.
- Organizar o resumo ABNT com os indicadores de conformidade geral e critérios atendidos no topo, e sua descrição em uma linha abaixo.
- Organizar o resumo de Template com os indicadores de conformidade geral e seções atendidas no topo, e sua descrição em uma linha abaixo.
- Manter cada critério ABNT recolhido inicialmente e permitir expandir individualmente sua norma e justificativa.
- Interpretar os detalhes de cada critério de Template pela flag `is_visual`: verificações determinísticas vêm de `criteria[].checks`; avaliações conduzidas por IA vêm de `criteria[].criteria`.
- Manter os dados e a ordem retornados pelo backend, sem misturar os dois tipos de evidência nem inferir resultados ausentes.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `conformity-checks`: O relatório ABNT passa a comunicar a conformidade individual de cada item pelo campo `match`.
- `template-conformity-results`: O relatório de template passa a selecionar e apresentar o detalhe do critério conforme sua origem determinística ou visual/IA.

## Impact

Afeta os tipos normalizados de conformidade e os workspaces de Conformidade ABNT e Conformidade Template. Não altera endpoints, autenticação, persistência ou a execução das análises no backend.
