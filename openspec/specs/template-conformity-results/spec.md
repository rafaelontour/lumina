# template-conformity-results Specification

## Purpose
Permitir que usuários escolham explicitamente um PDF já enviado no workspace e um template institucional para iniciar, acompanhar e compreender sua conformidade.
## Requirements
### Requirement: Backend-backed document selection

The Conformidade Template route SHALL list every workspace component from the backend-backed Documentos workspace and use its persistent project-document UUID as the template-conformity `docId`. Each option SHALL identify its project title, component label, uploaded file name, and upload date when available.

#### Scenario: User opens the route with uploaded PDFs

- **WHEN** the backend-backed workspace contains project components
- **THEN** the route presents them as selectable conformity targets without reading project or version state from browser persistence
- **AND** groups each project's components below that project's visible label

#### Scenario: Route receives an available document id

- **WHEN** the route is opened with a `documentId` query parameter matching a listed PDF
- **THEN** that PDF is selected

#### Scenario: No project component is available

- **WHEN** the backend-backed workspace has no project component
- **THEN** the route explains that a component must be created in Documentos before template analysis can begin

#### Scenario: Component has no uploaded PDF

- **WHEN** the user selects a project component without an uploaded PDF
- **THEN** the route identifies that no PDF is available and keeps the analysis start action disabled

### Requirement: User-initiated template conformity

The Conformidade Template route SHALL load the available template objects from `GET /templates`, present each object's `name` as a selectable label, and start an analysis only after the user selects a target and a template and explicitly activates the start action. The selected template's UUID SHALL be sent as `template_id` to the conformity endpoint.

#### Scenario: User selects an available template

- **WHEN** the template catalog returns one or more template objects
- **THEN** the selector presents each object's `name`
- **AND** the chosen template's UUID is sent as `template_id` when the user starts the analysis

#### Scenario: Template catalog is empty

- **WHEN** the template catalog returns an empty `templates` collection
- **THEN** the selector explains that no template is available
- **AND** keeps the start action disabled

#### Scenario: User starts an analysis

- **WHEN** the user selects an uploaded PDF and a template and activates “Iniciar análise”
- **THEN** the frontend obtains the stored release PDF without creating another release
- **AND** sends that PDF and the selected `template_id` to `POST /templates/{docId}/conformidade`
- **AND** presents the accepted processing state

#### Scenario: User has not started an analysis

- **WHEN** the selected PDF has no template result
- **THEN** the route explains that no analysis has been started and keeps the start action available

#### Scenario: Stored PDF is unavailable

- **WHEN** the selected target has no retrievable stored PDF
- **THEN** the route disables the start action and explains the unavailable source

### Requirement: Template conformity result lifecycle

The frontend SHALL obtain the selected PDF's template conformity result from `GET /templates/{docId}/conformidade` through the authenticated backend proxy and SHALL distinguish absent, processing, failed, and completed results. When the endpoint returns a collection of results, the frontend SHALL use the result most recently updated for that document; an empty collection SHALL be treated as an absent result.

#### Scenario: Result is being processed

- **WHEN** the selected document's most recently updated result reports `status` as `processing`
- **THEN** the route presents a processing state and refreshes only that selected document's result until it reaches a terminal state or the selection changes

#### Scenario: Result is absent

- **WHEN** the result endpoint returns HTTP 404 or an empty collection for the selected document
- **AND** no accepted analysis start is awaiting that result
- **THEN** the route presents a non-error state explaining that no analysis has been started

#### Scenario: Accepted result has not been materialized

- **WHEN** the result endpoint returns HTTP 404 or an empty collection after the user received an accepted `processing` response for that target
- **THEN** the route retains its processing state and continues to poll that target

#### Scenario: Result fails

- **WHEN** the backend reports `status` as `error` or the result request fails
- **THEN** the route presents a readable failure state and preserves the selected PDF and start action

#### Scenario: User changes the selected PDF

- **WHEN** the user selects another PDF or leaves the route
- **THEN** pending refresh activity for the previous PDF stops and its result is not displayed for the new selection

#### Scenario: User reselects a previously consulted PDF

- **WHEN** the user returns to a target whose absent, completed, or error result was already observed during the current page visit
- **THEN** the route immediately restores that in-memory state without a new loading transition
- **AND** requests the target's latest result in the background
- **AND** replaces the displayed state when the backend returns a newer result
- **AND** the cached state is discarded when the page is reloaded

### Requirement: Template conformity status notifications

The route SHALL show a single transient Sonner notification when a user-started template analysis completes or when its start, result request, or backend processing fails.

#### Scenario: Processing result completes

- **WHEN** polling observes a selected analysis transition from `processing` to `completed`
- **THEN** the application presents one success notification
- **AND** presents the completed report without further polling

#### Scenario: Analysis start or processing fails

- **WHEN** starting the analysis, requesting its result, or a returned result fails
- **THEN** the application presents one error notification for that failure
- **AND** retains the contextual error state and selected PDF

### Requirement: Upload workflow isolation

The Documentos page SHALL create backend documents, releases, and main analysis state without automatically starting template conformity or ABNT conformity.

#### Scenario: User uploads a PDF in Documentos

- **WHEN** document and release creation are accepted
- **THEN** the existing release and `check_tree` analysis workflow continues
- **AND** the application does not submit the file to template or ABNT conformity endpoints

### Requirement: Completed template report presentation

The route SHALL render a completed template conformity report in backend order, including its available metadata, summary, and every reported section and criterion, without rendering report content as HTML. On desktop, the metadata and summary blocks SHALL share the same top and bottom alignment when presented together, and each criterion inside an expanded section SHALL use the full available horizontal report width. Report labels and known status values SHALL be presented in Brazilian Portuguese.

#### Scenario: Completed report includes deterministic checks

- **WHEN** a completed report contains a section criterion with field comparisons
- **THEN** the route shows the criterion status and each field's template value, article value, and match status
- **AND** the criterion uses the full available report width

#### Scenario: Completed report includes visual checks

- **WHEN** a completed report contains a visual criterion with evaluation items
- **THEN** the route shows the criterion status and each evaluation item's criterion and justification
- **AND** the criterion uses the full available report width

#### Scenario: Completed report contains divergent sections

- **WHEN** a completed report contains one or more sections or criteria that do not match
- **THEN** the route makes their divergent status clearly distinguishable from compatible content while keeping all report content available for review

#### Scenario: User opens a completed report

- **WHEN** the route renders the report sections for the first time
- **THEN** every section is collapsed initially
- **AND** the user can independently expand the section they want to inspect

#### Scenario: Report includes metadata and summary

- **WHEN** a completed report provides both metadata and summary content
- **THEN** the route presents their top-level blocks aligned at the top of the report area
- **AND** gives both blocks the same height on desktop
- **AND** preserves readable presentation when only one block is available or on a narrow viewport

#### Scenario: Report contains technical labels and status values

- **WHEN** metadata or summary contains fields such as `approach` or `is_compliant`
- **THEN** the route presents a Brazilian Portuguese label and a readable Portuguese value for that field

### Requirement: Fixed document selector with scrollable report

On desktop, the template workspace SHALL keep its selected-document list stationary while a long analysis report scrolls only inside the adjacent result panel.

#### Scenario: User reads a long completed report

- **WHEN** the selected template result is taller than the visible workspace
- **THEN** the user scrolls the result panel independently
- **AND** the document selector remains visible and stationary on the left

### Requirement: Template conformity result history

The route SHALL provide a “Histórico” action for the selected PDF. When activated, it SHALL obtain the result collection from `GET /templates/{docId}/conformidade` and present every returned execution in a popup, ordered from most recently updated to least recently updated, with its status, creation time, update time, and available error detail. The popup SHALL make clear when no execution exists and SHALL be dismissible without changing the currently displayed result.

#### Scenario: User opens a populated history

- **WHEN** the selected PDF has one or more returned template conformity results and the user activates “Histórico”
- **THEN** the route presents a popup listing every returned execution in descending update order
- **AND** keeps the latest result displayed in the main workspace unchanged

#### Scenario: User opens an empty history

- **WHEN** the selected PDF has no returned template conformity result and the user activates “Histórico”
- **THEN** the popup explains that no analysis has been recorded

#### Scenario: History request fails

- **WHEN** the history request fails
- **THEN** the popup presents a readable failure state
- **AND** preserves the currently displayed result and selected PDF

### Requirement: Human-friendly conformity presentation

The route SHALL present the template conformity outcome in language appropriate for a non-technical user. It SHALL replace the known technical method summary with an explanation focused on what the person can review and use plain labels for comparison types and metadata.

#### Scenario: Backend returns the technical method summary

- **WHEN** a completed report contains the known technical description of the hybrid visual and deterministic approach
- **THEN** the route replaces it with a concise explanation that the document was compared section by section with the selected template
- **AND** does not expose implementation names or internal libraries

#### Scenario: User views analysis metadata

- **WHEN** the user views an item in the analysis history
- **THEN** the route presents its creation and update metadata with clear labels
- **AND** preserves the original values returned by the backend

### Requirement: Template target fallback during main document analysis

The Conformidade Template route SHALL retain the most recent release with completed main document analysis as the displayed target while a newer release of that component is pending main analysis. It SHALL identify that a newer version is being analyzed and disable the template conformity start action until the newer release becomes available. If no prior analyzed release exists, it SHALL keep the start action disabled and explain that the source is not ready.

#### Scenario: Prior analyzed release remains available

- **WHEN** a component has a newer release with pending main analysis and an earlier release with completed main analysis
- **THEN** the Template route displays the earlier release as the selected target
- **AND** identifies that the newer version is still being analyzed
- **AND** keeps the template conformity start action disabled

#### Scenario: Newest release becomes available

- **WHEN** the newer release completes its main document analysis
- **THEN** the Template route uses that newer release as the target
- **AND** evaluates template-conformity start eligibility for that release

#### Scenario: No analyzed prior release exists

- **WHEN** the newest release is pending main analysis and the component has no earlier analyzed release
- **THEN** the Template route keeps the start action disabled
- **AND** explains that the document source is still being prepared

