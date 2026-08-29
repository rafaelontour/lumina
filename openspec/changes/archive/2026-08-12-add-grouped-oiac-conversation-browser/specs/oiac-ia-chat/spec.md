## ADDED Requirements

### Requirement: Tabbed Conversation Browser
Oiac IA SHALL separate conversation browsing into standalone and grouped conversation views.

#### Scenario: User opens Oiac IA
- **WHEN** the user opens Oiac IA
- **THEN** the conversation sidebar offers separate views for avulsa conversations and grouped conversations

#### Scenario: User selects standalone view
- **WHEN** the user selects the avulsa conversation view
- **THEN** Oiac IA lists non-archived standalone conversations created directly in Oiac IA

#### Scenario: User selects grouped view
- **WHEN** the user selects the grouped conversation view
- **THEN** Oiac IA lists grouped conversation entries derived from backend projects, document groups, project documents, backend documents, and releases

### Requirement: Grouped Conversation Entries
Oiac IA SHALL show grouped conversation entries by project and document group, including project document components with and without uploaded PDFs.

#### Scenario: Grouped component has uploaded PDF
- **WHEN** a grouped component has a backend document with an uploaded PDF release
- **THEN** Oiac IA shows the component as selectable
- **AND** selecting the component opens the conversation using that backend document id
- **AND** Oiac IA uses the release PDF file path to render the PDF preview when available

#### Scenario: Grouped component has no uploaded PDF
- **WHEN** a grouped component has no backend document or no uploaded PDF release
- **THEN** Oiac IA keeps the component visible in its project and group position
- **AND** Oiac IA disables the component for chat selection

#### Scenario: Grouped component has unavailable preview file path
- **WHEN** a grouped component has a backend document but no available release PDF file path
- **THEN** Oiac IA keeps the component visible
- **AND** Oiac IA does not allow the component to open a PDF-backed chat until a file path is available

### Requirement: Grouped Conversation Message Continuity
Oiac IA SHALL resume grouped document conversations using the same backend document id used by Documentos handoff.

#### Scenario: User selects available grouped component
- **WHEN** the user selects an available grouped component
- **THEN** Oiac IA loads messages for that component's backend document id
- **AND** Oiac IA sends new AI messages to `/doc/{id}/message/ai` for that backend document id
