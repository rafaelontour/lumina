## Purpose

Permitir que evidências de chunks retornadas pela análise sejam localizadas visualmente no PDF da conversa, mantendo a rastreabilidade entre parecer e documento fonte.

## Requirements

### Requirement: Localização de referência no PDF
O leitor de PDF SHALL aceitar uma referência de documento com página e retângulos de evidência e navegar para a localização referenciada no documento carregado.

#### Scenario: Referência possui página e retângulos válidos
- **WHEN** o usuário seleciona uma referência que possui uma página e um ou mais retângulos válidos
- **THEN** o leitor rola até a página indicada
- **AND** desenha um destaque sobre cada retângulo daquela referência
- **AND** realça temporariamente a evidência selecionada sem alterar o conteúdo do PDF

#### Scenario: Referência possui somente página
- **WHEN** o usuário seleciona uma referência que possui página, mas não possui retângulos válidos
- **THEN** o leitor rola até a página indicada
- **AND** informa visualmente que não há área precisa disponível para destacar

#### Scenario: Referência não pode ser localizada
- **WHEN** uma referência possui página inválida ou não correspondente ao PDF carregado
- **THEN** o leitor permanece utilizável
- **AND** apresenta uma indicação de que a evidência não pôde ser localizada

### Requirement: Isolamento da evidência selecionada
O leitor de PDF SHALL manter o destaque da referência selecionada separado dos resultados da pesquisa textual.

#### Scenario: Pesquisa textual permanece ativa
- **WHEN** uma pesquisa textual está ativa e o usuário seleciona uma evidência
- **THEN** o leitor navega e destaca a evidência
- **AND** preserva o termo, os destaques e a navegação da pesquisa textual
