## Why

Na avaliação detalhada do Oiac IA, uma taxonomia pode conter vários ramos avaliados. Exibir suas contagens junto ao título oferece uma noção imediata do resultado sem esconder os pareceres individuais.

## What Changes

- Exibir no título de cada taxonomia as contagens de ramos “Atendidos”, “Parcialmente atendidos” e “Não atendidos”.
- Classificar os ramos pela nota: abaixo de 5, não atendido; de 5 até 7, parcialmente atendido; acima de 7, atendido.
- Preservar o resultado booleano `fulfilled` apenas como compatibilidade para avaliações antigas que não tenham nota.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `oiac-ia-chat`: A análise estruturada passa a apresentar contagens de ramos atendidos, parcialmente atendidos e não atendidos junto ao título de cada taxonomia.

## Impact

Afeta somente a apresentação da análise inicial da release no Oiac IA. Usa os resultados já recebidos em `check_tree`, sem novos endpoints, persistência ou cálculos no backend.
