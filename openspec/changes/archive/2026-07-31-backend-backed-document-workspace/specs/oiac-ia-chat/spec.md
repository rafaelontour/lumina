## ADDED Requirements

### Requirement: Backend Document Handoff
Oiac IA SHALL accept a backend document id from Documentos and use it as the selected conversation document id.

#### Scenario: User opens Oiac IA from Documentos
- **WHEN** the Oiac IA route receives a backend document id from a Documentos handoff
- **THEN** Oiac IA loads messages for that backend document id and sends AI messages to `/doc/{id}/message/ai`

#### Scenario: Supporting context is present
- **WHEN** the Oiac IA route also receives project, project document, or release identifiers
- **THEN** those identifiers are treated as supporting context and do not replace the backend document id for message loading
