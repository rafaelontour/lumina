## ADDED Requirements

### Requirement: Editable Project Title
The Documentos workspace SHALL treat the backend project name/title as editable user-facing metadata.

#### Scenario: Project title changes
- **WHEN** a project title is updated successfully
- **THEN** Documentos displays the updated project title for that project
- **AND** the grouped Oiac IA conversation browser uses the updated project title as its project label

#### Scenario: Project title update fails
- **WHEN** the backend rejects a project title update
- **THEN** the previous project title remains visible
- **AND** the user receives an error message
