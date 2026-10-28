## ADDED Requirements

### Requirement: Personal project study guide
The personal Documentos workspace SHALL offer the study guide for each backend project with a document group. It SHALL show the guide shared by that group and project-specific progress, allowing marking only when the authenticated user is the project's `created_by` owner.

#### Scenario: Project owner opens study guide
- **WHEN** the owner opens a project guide
- **THEN** the application loads the guide for that backend project id
- **AND** presents study controls and backend progress

#### Scenario: Administrator has personal project guide
- **WHEN** an administrator accesses a personal project guide from an available personal-project surface
- **THEN** the guide is read-only unless the administrator is the returned project owner

#### Scenario: Project has no group
- **WHEN** the project has no document group
- **THEN** the application presents an empty guide state without requesting group-specific configuration
