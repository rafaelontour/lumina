## MODIFIED Requirements

### Requirement: Local Document Project Creation
The Documentos page SHALL let the user create a backend project from backend document groups.

#### Scenario: User creates a document
- **WHEN** the user chooses a document group and enters a title
- **THEN** the application creates a backend project associated with the selected document group and creates backend project documents mirroring the selected group items

### Requirement: Browser Persistence
The Documentos page SHALL NOT persist document project, component, version, release, or analysis state in localStorage or IndexedDB.

#### Scenario: User returns to Documentos
- **WHEN** the page loads
- **THEN** it restores project state from backend project, project document, backend document, and release endpoints

#### Scenario: Browser storage is used by Documentos
- **WHEN** Documentos stores browser-side data
- **THEN** it stores only backend document ids in the pending analysis id queue and does not store project data

### Requirement: Component PDF Upload
The Documentos page SHALL allow a PDF to be uploaded for each required backend project document component.

#### Scenario: User uploads a component PDF
- **WHEN** the user selects a PDF for a component
- **THEN** the application creates or reuses the backend document linked to that project document, uploads the file as a release, and derives the displayed component version from backend document and release data

#### Scenario: Uploaded PDF is displayed
- **WHEN** a user uploads a PDF for a component
- **THEN** the component displays the original uploaded filename and does not use generated ids or date-prefixed labels as the document title

#### Scenario: Component upload is in progress
- **WHEN** a PDF is being uploaded for one component
- **THEN** only that component hides its action buttons and shows a local progress animation, while other components remain interactive

#### Scenario: Component analysis is pending
- **WHEN** the latest release for a component has not yet produced analysis
- **THEN** that component hides its action buttons and shows a local progress animation until analysis becomes ready

### Requirement: Analysis Readiness Tracking
The Documentos page SHALL mark a component as ready when a backend release for its backend document contains a non-empty `check_tree`.

#### Scenario: Release analysis exists
- **WHEN** backend release data contains a non-empty `check_tree`
- **THEN** the displayed component status becomes OK without relying on locally persisted version state and the component action buttons become available again

### Requirement: Pending Analysis Expiration
The Documentos page SHALL NOT mark backend analysis unavailable solely because a browser-local timeout expires.

#### Scenario: Analysis does not become available during the current session
- **WHEN** polling does not find a release with a non-empty `check_tree`
- **THEN** the backend document id remains pending until analysis becomes ready, the backend reports an unrecoverable absence, or the pending id is removed by explicit queue policy

### Requirement: Oiac IA Handoff
The Documentos page SHALL link analyzed component versions to Oiac IA using the backend document id as the canonical conversation identifier.

#### Scenario: User chooses to analyze with IA
- **WHEN** a component has a backend document id
- **THEN** the page offers a link to Oiac IA carrying that backend document id and may include project, project document, and release identifiers as supporting context

## ADDED Requirements

### Requirement: Backend Project Restoration
The Documentos page SHALL reconstruct its workspace from backend projects, project documents, backend documents, and releases.

#### Scenario: Documentos page loads
- **WHEN** the user opens Documentos
- **THEN** the application requests backend projects, their project documents, linked backend documents, and each linked document's releases to render the workspace

### Requirement: Partial Workspace Refresh
The Documentos page SHALL refresh backend-backed data after initial load without replacing the whole page with a loading state.

#### Scenario: Upload triggers workspace refresh
- **WHEN** a component upload completes and Documentos reloads backend data
- **THEN** the page keeps the existing workspace visible and updates the affected rendered state in place

#### Scenario: Analysis-ready event triggers workspace refresh
- **WHEN** the global polling provider reports that analysis is ready
- **THEN** Documentos refreshes backend data without showing the page-level loading placeholder

### Requirement: No localStorage for Documentos
The Documentos page SHALL NOT read from or write to localStorage.

#### Scenario: Documentos state changes
- **WHEN** projects, project documents, uploads, releases, filters, or analysis status change
- **THEN** no Documentos state is persisted to localStorage
