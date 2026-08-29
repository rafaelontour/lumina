## ADDED Requirements

### Requirement: Grouped Conversation Source Structure
The Documentos workspace SHALL provide enough backend-backed structure for Oiac IA to show grouped conversations, including components that do not yet have uploaded PDFs.

#### Scenario: Oiac IA reconstructs grouped conversations
- **WHEN** Oiac IA needs to show grouped conversations
- **THEN** the backend-backed project, document group, project document, backend document, and release data from Documentos-compatible endpoints can be used to reconstruct the grouped conversation structure

#### Scenario: Component has no backend document
- **WHEN** a project document component has no linked backend document or release
- **THEN** the component remains part of the grouped structure even though it is unavailable for chat selection
