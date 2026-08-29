## Why

O metadado “Arquivo analisado” pode expor o caminho interno retornado pelo backend, que não deve ser mostrado na interface. A lista de documentos também precisa indicar de forma imediata quais versões já receberam análise ABNT.

## What Changes

- Substituir o caminho completo de “Arquivo analisado” no relatório ABNT por um badge com ícone de documento e somente o nome do arquivo.
- Não expor o caminho do backend no texto visível, título ou atributos acessíveis do badge.
- Exibir na lista de documentos da Conformidade ABNT um badge “Analisado” para cada versão cujo histórico ABNT tenha sido consultado e já possua uma execução.
- Preservar os outros metadados, o relatório, o indicador “Em análise” e as regras de uma execução por versão.

## Capabilities

### New Capabilities

<!-- Nenhuma. -->

### Modified Capabilities

- `conformity-checks`: o relatório ABNT deixa de revelar caminhos internos de arquivo e o seletor comunica versões já analisadas.

## Impact

- Afeta a normalização e a apresentação de metadados, além da lista de seleção, em `ConformidadeAbntWorkspace`.
- Não altera endpoints, conteúdo do relatório retornado, persistência ou o fluxo de envio de PDF.
