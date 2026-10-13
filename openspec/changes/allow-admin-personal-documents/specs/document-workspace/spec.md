## MODIFIED Requirements

### Requirement: Backend Project Restoration
The Documentos page SHALL reconstruct its personal workspace from backend projects, project documents, backend documents, and releases for every authenticated account, including accounts with `access_level: ADMIN`. The personal workspace SHALL expose the same owner controls and behavior for `ADMIN` and non-administrator accounts, SHALL restore only projects and documents belonging to the authenticated account, and MUST NOT require an advisee relationship or association with an advisee.

#### Scenario: Documentos page loads
- **WHEN** any authenticated user opens `/documentos`
- **THEN** the application requests that user's backend projects, their project documents, linked backend documents, and each linked document's releases to render the personal workspace

#### Scenario: Administrator opens personal documents
- **WHEN** an authenticated administrator opens `/documentos`
- **THEN** the application renders the same personal document workspace and owner controls available to an authenticated non-administrator
- **AND** does not redirect the administrator to orientation monitoring
- **AND** does not mix advisee projects or documents into the administrator's personal workspace

#### Scenario: Administrator reviews an independent document
- **WHEN** an authenticated administrator creates or uploads a document of personal interest that is not associated with an advisee
- **THEN** the application permits the same creation, upload, analysis, editing, and deletion workflow available to a non-administrator
- **AND** does not require the administrator to select or possess an active advisee relationship

#### Scenario: Administrator opens orientation monitoring
- **WHEN** an authenticated administrator opens `/documentos/orientandos`
- **THEN** the application obtains the administrator's active advisees and their returned documents through advisory endpoints
- **AND** does not render the administrator's personal projects in the orientation page
- **AND** does not render creation, upload, edit, archive, deletion, release, or analysis controls for advisee records
