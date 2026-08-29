## ADDED Requirements

### Requirement: Evidências navegáveis da análise inicial
Quando um critério da análise inicial de uma release possuir referências de documento, Oiac IA SHALL exibir controles de evidência junto ao parecer do critério.

#### Scenario: Critério possui referências localizáveis
- **WHEN** um critério da análise inicial possui uma ou mais referências com página
- **THEN** Oiac IA exibe um controle para cada referência na ordem retornada
- **AND** cada controle identifica sua página em uma contagem compreensível para o usuário

#### Scenario: Usuário seleciona uma evidência
- **WHEN** o usuário aciona o controle de uma evidência
- **THEN** Oiac IA envia aquela referência ao leitor do PDF exibido para navegação e destaque
- **AND** mantém a conversa e a análise inicial visíveis

#### Scenario: Critério não possui evidências
- **WHEN** um critério não possui referências retornadas pelo backend
- **THEN** Oiac IA mantém o parecer, status, nota e feedback atuais
- **AND** não exibe um controle de evidência vazio
