## ADDED Requirements

### Requirement: Scoped Rename Actions In Oiac IA
Oiac IA SHALL offer rename controls only for avulsa individual conversations. It SHALL NOT offer controls to rename Documentos-backed projects or documents in the grouped conversation browser.

#### Scenario: User views grouped document conversations
- **WHEN** the user opens the grouped conversation browser in Oiac IA
- **THEN** project and document labels are displayed without rename controls
- **AND** no project or document rename request can be initiated from that browser

#### Scenario: User views an avulsa conversation
- **WHEN** the user selects an avulsa individual conversation in Oiac IA
- **THEN** the user can edit that conversation name
- **AND** the edit continues to target the same backend conversation document id
