## 1. Normalização dos resultados

- [x] 1.1 Atualizar a normalização do relatório ABNT para preservar o booleano `match` de cada critério, sem inferir resultado quando ele estiver ausente.
- [x] 1.2 Ajustar a normalização do relatório Template para ler `checks` somente em critérios determinísticos (`is_visual: false`) e `criteria` somente em critérios visuais (`is_visual: true`).

## 2. Apresentação dos relatórios

- [x] 2.1 Exibir, em cada critério ABNT, um indicador acessível verde de conformidade para `match: true` e vermelho de não conformidade para `match: false`.
- [x] 2.2 Manter a apresentação atual de Template e garantir que cada tipo de critério renderize exclusivamente os detalhes de sua fonte de dados correspondente.
- [x] 2.3 Organizar o resumo ABNT com os indicadores de conformidade geral e critérios atendidos acima da descrição da análise.
- [x] 2.4 Exibir os critérios ABNT recolhidos por padrão, com expansão individual para norma e justificativa.
- [x] 2.5 Organizar o resumo de Template com os indicadores de conformidade geral e seções atendidas acima da descrição da análise.
- [x] 2.6 Alinhar os indicadores de conformidade de critérios ABNT e seções de Template no lado oposto aos seus nomes.
- [x] 2.7 Manter o conteúdo completo de critérios e seções expansíveis acessível no painel independente de resultados.
- [x] 2.8 Manter a lista esquerda de documentos do Template rolável quando seus itens ultrapassarem a altura disponível.
- [x] 2.9 Destacar visualmente cada grupo de documentos na lista esquerda de Template.

## 3. Verificação

- [x] 3.1 Validar manualmente um relatório ABNT com critérios conformes e não conformes, e um relatório Template com critérios determinísticos e visuais conforme a estrutura documentada pela API.
- [x] 3.2 Executar `pnpm lint`, `pnpm build` e `openspec validate clarify-template-and-abnt-result-indicators --type change`.
