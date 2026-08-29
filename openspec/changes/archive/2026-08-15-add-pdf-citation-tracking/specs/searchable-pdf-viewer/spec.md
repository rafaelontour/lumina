## ADDED Requirements

### Requirement: Destaque de evidências geométricas
O leitor de PDF SHALL apresentar os retângulos de uma referência selecionada como sobreposições alinhadas à página renderizada, sem substituir a camada textual do documento.

#### Scenario: Leitor recebe uma evidência selecionada
- **WHEN** o leitor recebe uma referência com retângulos para uma página do PDF carregado
- **THEN** ele apresenta uma sobreposição de destaque para cada retângulo
- **AND** mantém os controles de zoom e pesquisa disponíveis

#### Scenario: Usuário altera o zoom após selecionar a evidência
- **WHEN** uma evidência estiver destacada e o usuário alterar o zoom
- **THEN** os destaques permanecem alinhados à página renderizada

#### Scenario: Usuário seleciona outra evidência
- **WHEN** o leitor já estiver mostrando uma evidência e receber outra referência
- **THEN** ele remove o destaque anterior e apresenta somente os destaques da nova referência
