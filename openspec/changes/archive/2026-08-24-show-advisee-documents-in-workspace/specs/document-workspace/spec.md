## MODIFIED Requirements

### Requirement: Backend Project Restoration
The Documentos page SHALL reconstruct its personal workspace from backend projects, project documents, backend documents, and releases for authenticated accounts without `access_level: ADMIN`. For authenticated administrators, `/documentos` SHALL direct to the compact, read-only “Meus orientandos” page, whose records are restored only from the backend's authenticated advisory endpoints and which does not expose the personal workspace or its owner controls.

#### Scenario: Documentos page loads
- **WHEN** a non-administrator user opens Documentos
- **THEN** the application requests backend projects, their project documents, linked backend documents, and each linked document's releases to render the personal workspace

#### Scenario: Non-administrator opens Documentos
- **WHEN** an authenticated account without `access_level: ADMIN` opens Documentos
- **THEN** the application requests backend projects, their project documents, linked backend documents, and each linked document's releases to render the personal workspace

#### Scenario: Administrator opens orientation monitoring
- **WHEN** an authenticated administrator opens the orientation view in Documentos
- **THEN** the application obtains the administrator's active advisees and their returned documents through advisory endpoints
- **AND** does not request or render the personal project workspace
- **AND** does not render creation, upload, edit, archive, deletion, release, or analysis controls in the orientation page
