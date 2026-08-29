## Purpose

Permitir que as explicações das taxonomias de uma resposta da Oiac IA sejam consultadas de forma compacta e acessível dentro do chat.

## ADDED Requirements

### Requirement: Explicações de taxonomia expansíveis na resposta da IA
O detalhamento de avaliação de uma resposta da Oiac IA SHALL manter cada tipificação como agrupador visível e apresentar cada uma de suas taxonomias como um item independente que o usuário pode expandir e recolher. O cabeçalho do item SHALL manter o título da taxonomia visível e indicar claramente se sua explicação está aberta ou fechada.

#### Scenario: Usuário abre uma taxonomia
- **WHEN** o usuário aciona o cabeçalho de uma taxonomia recolhida
- **THEN** a interface exibe a explicação, as fontes, os critérios e as avaliações daquela taxonomia

#### Scenario: Usuário recolhe uma taxonomia
- **WHEN** o usuário aciona o cabeçalho de uma taxonomia aberta
- **THEN** a interface oculta a explicação e os detalhes daquela taxonomia e mantém seu título visível

#### Scenario: Tipificação contém várias taxonomias
- **WHEN** o detalhamento de uma tipificação contém mais de uma taxonomia
- **THEN** cada taxonomia pode ser aberta ou recolhida independentemente das demais

### Requirement: Preservação do conteúdo da avaliação
Quando uma taxonomia estiver aberta, a interface SHALL preservar a ordem e o conteúdo retornado para sua explicação, fontes, critérios, status de atendimento, notas e feedback da Oiac IA.

#### Scenario: Usuário consulta uma taxonomia expandida
- **WHEN** o usuário expande uma taxonomia com critérios avaliados
- **THEN** a interface apresenta os mesmos dados de avaliação exibidos antes da introdução do recolhimento

### Requirement: Interação acessível de expansão
Os itens de taxonomia SHALL oferecer uma interação de expansão e recolhimento disponível por teclado e comunicada por semântica acessível.

#### Scenario: Usuário navega pelo teclado
- **WHEN** o foco está no cabeçalho de uma taxonomia
- **THEN** o usuário consegue alternar entre os estados aberto e fechado por uma interação de teclado suportada pelo navegador

### Requirement: Transição curta do conteúdo da taxonomia
A abertura e o recolhimento do conteúdo de uma taxonomia SHALL usar uma transição visual curta que evite o aparecimento ou desaparecimento abrupto do conteúdo.

#### Scenario: Usuário alterna uma taxonomia
- **WHEN** o usuário abre ou recolhe uma taxonomia
- **THEN** a interface anima brevemente a altura e a visibilidade do conteúdo antes de concluir a transição
