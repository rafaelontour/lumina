# advisee-document-monitoring Specification

## Purpose
Permitir que administradores que atuam como orientadores acompanhem, na página Documentos, o estado atualizado dos trabalhos de seus orientandos ativos.
## Requirements
### Requirement: Compact advisor monitoring in Documentos
The Documentos workspace SHALL provide `ADMIN` accounts only the “Meus orientandos” orientation page, visually distinct from the personal document workspace. It SHALL use a compact monitoring presentation to list the active advisees associated with the authenticated professor and their accessible document work grouped by academic project and document group.

#### Scenario: Administrator opens advisee monitoring
- **WHEN** an authenticated administrator opens the orientation view in Documentos
- **THEN** the application lists only active advisees associated with that administrator
- **AND** presents each advisee's returned documents within that advisee's own project and group structure
- **AND** presents the results in the compact advisor-monitoring layout rather than the personal document workspace layout

#### Scenario: Administrator opens Documentos
- **WHEN** an authenticated `ADMIN` account opens `/documentos`
- **THEN** the application directs it to “Meus orientandos”
- **AND** does not render the personal document workspace

#### Scenario: Administrator has no advisees with documents
- **WHEN** an administrator has no active advisees or the active advisees have no returned documents
- **THEN** the application presents a readable empty state
- **AND** does not show document groups belonging to another advisor

### Requirement: Advisor-specific project search and student filter
The orientation view SHALL provide a student filter containing the authenticated advisor's active advisees and an option for all active advisees. It SHALL provide a text search that filters the displayed monitoring records by the returned project name. Both controls MUST operate only on the authenticated advisor's currently returned advisory data.

#### Scenario: Advisor filters by student
- **WHEN** an administrator selects one active advisee in the orientation view
- **THEN** the application shows only that advisee's returned document groups
- **AND** preserves the selected advisor's current project-search criterion

#### Scenario: Advisor searches projects across advisees
- **WHEN** an administrator enters a project name in the orientation-view search field while all advisees are selected
- **THEN** the application displays only returned groups whose project name matches the search text
- **AND** does not include projects or documents outside that administrator's advisory data

### Requirement: Fresh advisee document state
The orientation view SHALL request the current document data from the backend when opened and when the administrator explicitly refreshes it. It MUST display the processing status, archival state, and latest update information returned by the backend and MUST NOT persist advisee documents in browser storage.

#### Scenario: Administrator refreshes advisee documents
- **WHEN** an administrator requests an update in the orientation view
- **THEN** the application reloads the active advisees and their accessible documents from the backend
- **AND** replaces the displayed status information with the latest returned state

#### Scenario: Backend document request fails
- **WHEN** the backend cannot return an advisee's document data
- **THEN** the application preserves any previously rendered monitoring data where available
- **AND** presents readable retry feedback scoped to the failed monitoring view

### Requirement: Monitoring is read-only and administrator-scoped
The orientation page SHALL be available only to `ADMIN` accounts and SHALL use the backend's authenticated advisory endpoints to determine both the professor and each advisee's documents. It MUST NOT expose any control for creating projects or groups, uploading PDFs, editing metadata, triggering analyses or conformity, generating releases, archiving, deleting, or otherwise mutating an advisee's project, group, document, release, or analysis.

#### Scenario: Non-administrator opens Documentos
- **WHEN** an authenticated account without `access_level: ADMIN` opens Documentos
- **THEN** the orientation monitoring view is unavailable
- **AND** the personal document workspace remains unchanged

#### Scenario: Administrator views advisee work
- **WHEN** an administrator opens an advisee's document group
- **THEN** the application presents the returned records as read-only monitoring data
- **AND** does not offer project/group creation, PDF upload, editing, analysis, release, archive, deletion, or other mutation actions for those records

