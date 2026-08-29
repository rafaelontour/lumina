## ADDED Requirements

### Requirement: Avulsa Conversation Rename
Oiac IA SHALL allow the user to rename an avulsa conversation using the backend document title/name field.

#### Scenario: User renames an avulsa conversation
- **WHEN** the user edits the selected avulsa conversation name and saves a non-empty value
- **THEN** Oiac IA persists the new name to the backend document
- **AND** the avulsa conversation list displays the updated name
- **AND** the selected chat header displays the updated name
- **AND** message loading and sending continue to use the same backend document id

#### Scenario: User cancels avulsa rename
- **WHEN** the user starts editing an avulsa conversation name and cancels
- **THEN** Oiac IA keeps the previous conversation name visible
- **AND** no backend update is sent

### Requirement: Grouped Project Rename From Oiac IA
Oiac IA SHALL allow the user to rename the project label shown for grouped conversations without changing component conversation ids.

#### Scenario: User renames a grouped project
- **WHEN** the user edits a grouped project name and saves a non-empty value
- **THEN** Oiac IA persists the new name to the backend project
- **AND** grouped conversation entries display the updated project name
- **AND** selecting an available component still uses that component's backend document id for messages

#### Scenario: Grouped project rename does not rename components
- **WHEN** a grouped project name is updated
- **THEN** Oiac IA keeps each project document component label unchanged
