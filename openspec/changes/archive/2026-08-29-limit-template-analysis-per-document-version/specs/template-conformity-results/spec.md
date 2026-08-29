## MODIFIED Requirements

### Requirement: User-initiated template conformity

The Conformidade Template route SHALL load the available template objects from `GET /templates`, present each object's `name` as a selectable label, and start an analysis only after the user selects a target and a template and explicitly activates the start action. The selected template's UUID SHALL be sent as `template_id` to the conformity endpoint. The route MUST permit at most one template-conformity execution for each uploaded PDF version and MUST enable another execution only after Documentos provides a newer PDF version whose main analysis is ready for that component; the upload itself MUST NOT start template conformity.

#### Scenario: User selects an available template

- **WHEN** the template catalog returns one or more template objects
- **THEN** the selector presents each object's `name`
- **AND** the chosen template's UUID is sent as `template_id` when the user starts the analysis

#### Scenario: Template catalog is empty

- **WHEN** the template catalog returns an empty `templates` collection
- **THEN** the selector explains that no template is available
- **AND** keeps the start action disabled

#### Scenario: User starts an analysis

- **WHEN** the user selects an uploaded PDF version without a template-conformity execution and a template and activates “Iniciar análise”
- **THEN** the frontend obtains the stored release PDF without creating another release
- **AND** sends that PDF and the selected `template_id` to `POST /templates/{docId}/conformidade`
- **AND** presents the accepted processing state

#### Scenario: Template analysis already exists for the current version

- **WHEN** the selected uploaded PDF version already has a returned template-conformity execution
- **THEN** the route keeps the start action disabled
- **AND** explains that another analysis requires a new PDF version in Documentos

#### Scenario: Document list identifies an analyzed version

- **WHEN** an uploaded PDF version already has a returned template-conformity execution
- **THEN** its item in the document selector displays the “Analisado” badge
- **AND** the badge uses the same visual treatment as the equivalent ABNT status

#### Scenario: Analyzed badges load with the document list

- **WHEN** the route finishes loading its available document targets
- **THEN** it obtains the eligibility state for each target before presenting the document list
- **AND** shows the “Analisado” badge immediately for every version that already has an execution
- **AND** keeps the report panel inactive until the user selects a target

#### Scenario: A new PDF version becomes ready

- **WHEN** Documentos provides a newer PDF version whose main analysis has completed for a component whose earlier version has a template-conformity execution
- **THEN** the new version becomes eligible for one template-conformity execution
- **AND** the earlier version's execution does not keep the start action disabled
- **AND** no template-conformity execution starts until the user activates “Iniciar análise”

#### Scenario: Pending main analysis completes while the workspace is open

- **WHEN** the selected target is marked as having a new version under main analysis
- **THEN** the route refreshes its document targets while that state persists
- **AND** removes the “Nova versão em análise” badge when the main analysis completes
- **AND** recalculates the start-action eligibility without requiring a page reload

#### Scenario: User has not started an analysis

- **WHEN** the selected PDF version has no template result
- **THEN** the route explains that no analysis has been started and keeps the start action available

#### Scenario: Stored PDF is unavailable

- **WHEN** the selected target has no retrievable stored PDF
- **THEN** the route disables the start action and explains the unavailable source

### Requirement: Template conformity result lifecycle

The frontend SHALL obtain the selected PDF's template conformity result from `GET /templates/{docId}/conformidade` through the authenticated backend proxy and SHALL distinguish absent, processing, failed, and completed results. When the endpoint returns a collection of results, the frontend SHALL use current-version executions to determine start eligibility and the primary view. If none is associated with the selected uploaded PDF version, the primary view SHALL fall back to the most recently updated historic execution while preserving the current-version eligibility decision.

#### Scenario: Result is being processed

- **WHEN** the selected document's most recently updated result for its current PDF version reports `status` as `processing`
- **THEN** the route presents a processing state and refreshes only that selected document's result until it reaches a terminal state or the selection changes

#### Scenario: New result replaces a visible historic report

- **WHEN** a historic completed report is visible and the user starts analysis for a newer eligible version
- **THEN** the route keeps the historic report visible while the newer execution is processing
- **AND** replaces it with the newer report as soon as that execution reaches `completed`

#### Scenario: Result is absent

- **WHEN** the result endpoint returns HTTP 404 or no result associated with the selected PDF version
- **AND** no historic execution is available for that target
- **AND** no accepted analysis start is awaiting that result
- **THEN** the route presents a non-error state explaining that no analysis has been started

#### Scenario: Current version has no matching result but history exists

- **WHEN** no returned execution matches the selected uploaded PDF version
- **AND** the target has a historic completed execution
- **THEN** the primary view presents the most recently updated historic report
- **AND** the start eligibility remains based on the selected version rather than the historic execution

#### Scenario: Accepted result has not been materialized

- **WHEN** the result endpoint returns HTTP 404 or no result associated with the selected PDF version after the user received an accepted `processing` response for that target
- **THEN** the route retains its processing state and continues to poll that target

#### Scenario: Result fails

- **WHEN** the backend reports `status` as `error` or the result request fails
- **THEN** the route presents a readable failure state and preserves the selected PDF and disables another analysis for that PDF version

#### Scenario: User changes the selected PDF

- **WHEN** the user selects another PDF or leaves the route
- **THEN** pending refresh activity for the previous PDF stops and its result is not displayed for the new selection

#### Scenario: User reselects a previously consulted PDF

- **WHEN** the user returns to a target whose absent, completed, or error result was already observed during the current page visit
- **THEN** the route immediately restores that in-memory state without a new loading transition
- **AND** requests the target's latest result in the background
- **AND** replaces the displayed state when the backend returns a newer result
- **AND** the cached state is discarded when the page is reloaded

### Requirement: Template conformity result history

The route SHALL provide a “Histórico” action for the selected PDF. When activated, it SHALL obtain the result collection from `GET /templates/{docId}/conformidade` and present every returned execution in a popup, ordered from most recently updated to least recently updated, with its status, creation time, update time, and available error detail. The popup SHALL make clear when no execution exists and SHALL be dismissible without changing the currently displayed result. It SHALL identify in that popup the execution whose report is currently displayed in the main workspace.

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

#### Scenario: History identifies the displayed result

- **WHEN** the user opens a history that contains the result currently visible in the main workspace
- **THEN** that execution is visually highlighted in the popup
- **AND** it displays an “Em visualização” badge

### Requirement: Template conformity status notifications

The route SHALL show one transient Sonner notification for each user-started template analysis that completes and one for each distinct start, result request, or backend processing failure. A successfully accepted analysis that is already completed and a processing analysis that later reaches completion MUST both show the completion notification exactly once.

#### Scenario: Processing result completes

- **WHEN** a user-started processing analysis reaches `completed` during polling
- **THEN** the application presents one success notification for that completed execution
- **AND** presents the completed report without further polling

#### Scenario: Analysis is completed in the accepted response

- **WHEN** the start response for a user-started analysis reports `completed`
- **THEN** the application presents one success notification for that completed execution
- **AND** presents or refreshes the completed report

#### Scenario: Analysis start or processing fails

- **WHEN** starting the analysis, requesting its result, or a returned result fails
- **THEN** the application presents one error notification for that failure
- **AND** retains the contextual error state and selected PDF
