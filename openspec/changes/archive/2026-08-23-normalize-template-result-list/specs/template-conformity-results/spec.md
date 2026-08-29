## MODIFIED Requirements

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

## ADDED Requirements

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
