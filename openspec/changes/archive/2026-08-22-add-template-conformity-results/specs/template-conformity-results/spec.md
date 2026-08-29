## Purpose

Permitir que usuários escolham explicitamente um PDF já enviado no workspace e um template institucional para iniciar, acompanhar e compreender sua conformidade.

## ADDED Requirements

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

The Conformidade Template route SHALL load the available template names and start an analysis only after the user selects a target and a template and explicitly activates the start action.

#### Scenario: User starts an analysis

- **WHEN** the user selects an uploaded PDF and a template and activates “Iniciar análise”
- **THEN** the frontend obtains the stored release PDF without creating another release
- **AND** sends that PDF and the selected `template_name` to `POST /templates/{docId}/conformidade`
- **AND** presents the accepted processing state

#### Scenario: User has not started an analysis

- **WHEN** the selected PDF has no template result
- **THEN** the route explains that no analysis has been started and keeps the start action available

#### Scenario: Stored PDF is unavailable

- **WHEN** the selected target has no retrievable stored PDF
- **THEN** the route disables the start action and explains the unavailable source

### Requirement: Template conformity result lifecycle

The frontend SHALL obtain the selected PDF's template conformity result from `GET /templates/{docId}/conformidade` through the authenticated backend proxy and SHALL distinguish absent, processing, failed, and completed results.

#### Scenario: Result is being processed

- **WHEN** the selected document's result reports `status` as `processing`
- **THEN** the route presents a processing state and refreshes only that selected document's result until it reaches a terminal state or the selection changes

#### Scenario: Result is absent

- **WHEN** the result endpoint returns HTTP 404 for the selected document
- **AND** no accepted analysis start is awaiting that result
- **THEN** the route presents a non-error state explaining that no analysis has been started

#### Scenario: Accepted result has not been materialized

- **WHEN** the result endpoint returns HTTP 404 after the user received an accepted `processing` response for that target
- **THEN** the route retains its processing state and continues to poll that target

#### Scenario: Result fails

- **WHEN** the backend reports `status` as `error` or the result request fails
- **THEN** the route presents a readable failure state and preserves the selected PDF and start action

#### Scenario: User changes the selected PDF

- **WHEN** the user selects another PDF or leaves the route
- **THEN** pending refresh activity for the previous PDF stops and its result is not displayed for the new selection

#### Scenario: User reselects a previously consulted PDF

- **WHEN** the user returns to a target whose absent, completed, or error result was already observed during the current page visit
- **THEN** the route restores that in-memory state without a new loading transition or result request
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

The route SHALL render a completed template conformity report in backend order, including the summary and every reported section and criterion, without rendering report content as HTML.

#### Scenario: Completed report includes deterministic checks

- **WHEN** a completed report contains a section criterion with field comparisons
- **THEN** the route shows the criterion status and each field's template value, article value, and match status

#### Scenario: Completed report includes visual checks

- **WHEN** a completed report contains a visual criterion with evaluation items
- **THEN** the route shows the criterion status and each evaluation item's criterion and justification

#### Scenario: Completed report contains divergent sections

- **WHEN** a completed report contains one or more sections or criteria that do not match
- **THEN** the route makes their divergent status clearly distinguishable from compatible content while keeping all report content available for review

#### Scenario: User opens a completed report

- **WHEN** the route renders the report sections for the first time
- **THEN** every section is collapsed initially
- **AND** the user can independently expand the section they want to inspect

### Requirement: Fixed document selector with scrollable report

On desktop, the template workspace SHALL keep its selected-document list stationary while a long analysis report scrolls only inside the adjacent result panel.

#### Scenario: User reads a long completed report

- **WHEN** the selected template result is taller than the visible workspace
- **THEN** the user scrolls the result panel independently
- **AND** the document selector remains visible and stationary on the left
