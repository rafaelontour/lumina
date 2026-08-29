## Purpose
Document the Documentos workspace for backend-backed document projects, PDF uploads by project document component, and backend release analysis readiness tracking.
## Requirements
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
The Documentos page SHALL allow a PDF to be uploaded for each required backend project document component. Before it creates the external backend document and uploads the file as a release, it SHALL require the user to select one available typification for that component analysis.

#### Scenario: User uploads a component PDF
- **WHEN** the user selects a PDF for a component
- **THEN** the route presents the available typifications before starting the upload
- **AND** after the user confirms one typification, the application creates the backend document using that selected typification, uploads the file as a release, and derives the displayed component version from backend document and release data

#### Scenario: User has not selected a typification
- **WHEN** a PDF is selected but no typification is selected
- **THEN** the route keeps upload confirmation unavailable
- **AND** does not create a backend document or release

#### Scenario: No typification is available
- **WHEN** the typification catalog is empty or cannot be loaded for an upload
- **THEN** the route explains that a typification is required before analysis can begin
- **AND** does not create a backend document or release

#### Scenario: User cancels typification selection
- **WHEN** the user dismisses typification selection before confirming the upload
- **THEN** the route does not create a backend document or release
- **AND** keeps the component available for another file selection

#### Scenario: Uploaded PDF is displayed
- **WHEN** a user uploads a PDF for a component
- **THEN** the component displays the original uploaded filename and does not use generated ids or date-prefixed labels as the document title

#### Scenario: Component upload is in progress
- **WHEN** a PDF is being uploaded for one component
- **THEN** only that component hides its action buttons and shows a local progress animation, while other components remain interactive

#### Scenario: Component analysis is pending
- **WHEN** the latest release for a component has not yet produced analysis
- **THEN** that component hides its action buttons and shows a local progress animation until analysis becomes ready

### Requirement: Typification Selection
The component PDF upload flow SHALL use exactly the available typification explicitly selected by the user when it creates the external backend document for analysis. It SHALL NOT replace that selected typification with a group, item, or first-list automatic fallback.

#### Scenario: User confirms a typification
- **WHEN** the user selects an available typification and confirms a component upload
- **THEN** the backend document is created with that typification as its sole analysis typification

#### Scenario: Different component uploads use different typifications
- **WHEN** the user selects distinct typifications for separate component uploads
- **THEN** each backend document is created with the typification chosen for its own upload

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

### Requirement: Stable Component Ordering
The Documentos page SHALL keep document components in their document group order regardless of upload, release, or analysis state.

#### Scenario: Component receives a PDF
- **WHEN** a component receives a PDF release
- **THEN** the component remains in its original position relative to the other components in the same document

#### Scenario: Component analysis becomes ready
- **WHEN** a component's backend release transitions from pending analysis to ready analysis
- **THEN** the component remains in its original position relative to the other components in the same document

### Requirement: PDF File Path Handoff Context
The Documentos page SHALL include the selected release PDF file path as supporting context when linking a component version to Oiac IA, when that file path is available.

#### Scenario: User opens Oiac IA from a component with a PDF file path
- **WHEN** the user chooses to analyze a component version with Oiac IA
- **THEN** the link carries the backend document id as the canonical conversation identifier
- **AND** the link carries the release id and PDF file path as supporting context when available

### Requirement: Conformity Dispatch Isolation

The upload flow SHALL NOT trigger template or ABNT conformity checks after backend document and release creation.

#### Scenario: Component PDF is uploaded

- **WHEN** a component PDF upload completes backend document and release creation
- **THEN** the application continues its main analysis readiness tracking
- **AND** does not send the PDF to either conformity endpoint automatically

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

### Requirement: Grouped Conversation Source Structure
The Documentos workspace SHALL provide enough backend-backed structure for Oiac IA to show grouped conversations, including components that do not yet have uploaded PDFs.

#### Scenario: Oiac IA reconstructs grouped conversations
- **WHEN** Oiac IA needs to show grouped conversations
- **THEN** the backend-backed project, document group, project document, backend document, and release data from Documentos-compatible endpoints can be used to reconstruct the grouped conversation structure

#### Scenario: Component has no backend document
- **WHEN** a project document component has no linked backend document or release
- **THEN** the component remains part of the grouped structure even though it is unavailable for chat selection

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

### Requirement: Prominent Document Creation Action
The Documentos page SHALL present its action for adding documents with the same primary-action visual hierarchy as the “Nova tipificação” action on the Tipificações page.

#### Scenario: User views the Documentos header
- **WHEN** the user opens the Documentos page
- **THEN** the action for adding documents is clearly visible in the page header
- **AND** it has the same primary-action prominence, sizing, and visual style as “Nova tipificação”
