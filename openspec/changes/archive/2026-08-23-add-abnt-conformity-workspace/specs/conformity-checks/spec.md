## MODIFIED Requirements

### Requirement: ABNT Conformity Request

The frontend SHALL NOT submit a PDF for ABNT conformity as a side effect of an upload. It SHALL allow the authenticated user to explicitly select one of their eligible stored workspace PDFs on the Conformidade ABNT route and start an ABNT analysis. On an explicit start, the frontend SHALL obtain the selected stored release PDF without creating another release and send it to `POST /abnt/{docId}/conformidade` through the authenticated backend proxy.

#### Scenario: PDF upload completes

- **WHEN** a PDF upload completes backend document and release creation
- **THEN** the application does not send the PDF to `/abnt/{docId}/conformidade` automatically

#### Scenario: User chooses one of their uploaded documents

- **WHEN** the authenticated user opens the Conformidade ABNT route
- **THEN** the route presents only eligible document PDFs available in that user's workspace
- **AND** lets the user select one document for analysis

#### Scenario: User starts ABNT checking

- **WHEN** the user selects a stored PDF and activates the ABNT analysis action
- **THEN** the frontend sends that PDF to `POST /abnt/{docId}/conformidade`
- **AND** presents the accepted processing state

#### Scenario: Stored PDF is unavailable

- **WHEN** the selected target has no retrievable stored PDF
- **THEN** the route disables the start action and explains that the source is unavailable

### Requirement: Placeholder Conformity Pages

The Conformidade Template route SHALL provide the template conformity result workspace for articles whose completed template result is available from Documentos, and the Conformidade ABNT route SHALL provide an ABNT analysis workspace rather than an under-construction placeholder.

#### Scenario: User opens a conformity route

- **WHEN** the user visits `/conformidade-template`
- **THEN** the application displays the template conformity result workspace
- **WHEN** the user visits `/conformidade-abnt`
- **THEN** the application displays the ABNT analysis workspace with its document selector and result panel

## ADDED Requirements

### Requirement: ABNT result lifecycle

The Conformidade ABNT route SHALL retrieve the selected document's ABNT result collection from `GET /abnt/{docId}/conformidade` through the authenticated backend proxy. On an ordinary selection, it SHALL use the most recently updated terminal result for the primary view so an older `processing` execution does not hide an available completed report. A `processing` result SHALL take precedence only for an execution explicitly started during the current page visit. The route SHALL treat HTTP 404 and an empty collection as an absent result, and distinguish absent, processing, failed, and completed states.

#### Scenario: User-started result is being processed

- **WHEN** the selected document has an ABNT execution started during the current page visit whose result reports `status` as `processing`
- **THEN** the route presents an animated processing state and refreshes that target until it reaches a terminal state or the user leaves it
- **AND** the animation respects the user's reduced-motion preference

#### Scenario: Completed report is available with an older processing execution

- **WHEN** a selected document has no ABNT analysis started during the current page visit, its most recently updated execution reports `processing`, and an earlier execution is `completed` or `error`
- **THEN** the route presents the most recently updated terminal execution instead of the stale processing state
- **AND** displays its persisted report or error when available

#### Scenario: Accepted result has not been materialized

- **WHEN** the result endpoint returns HTTP 404 or an empty collection after the user received an accepted processing response for that target
- **THEN** the route retains its processing state and continues to poll that target

#### Scenario: Result is absent

- **WHEN** the result endpoint returns HTTP 404 or an empty collection
- **AND** no accepted ABNT analysis is awaiting that result
- **THEN** the route presents a non-error state explaining that no ABNT analysis has been started

#### Scenario: Result reaches a terminal state

- **WHEN** a processing result becomes `completed` or `error`
- **THEN** polling for that target stops
- **AND** the route presents either the completed report or a readable error state
- **AND** shows one corresponding user notification without repeating it on subsequent renders

#### Scenario: Analysis lifecycle notifications

- **WHEN** the ABNT analysis is accepted, completes, reports a backend error, or fails to start or refresh
- **THEN** the route presents one contextual Sonner notification for that event
- **AND** does not repeat the notification during polling or rerendering

#### Scenario: User changes the selected PDF

- **WHEN** the user selects another PDF or leaves the route
- **THEN** pending refresh activity for the previous target stops
- **AND** its result is not displayed for the new selection

### Requirement: Fixed ABNT reference

The Conformidade ABNT route SHALL NOT present a template catalog or require a template selection. It SHALL start the selected document's analysis using the fixed ABNT reference maintained by the backend.

#### Scenario: User starts an ABNT analysis

- **WHEN** the user has selected an eligible document PDF
- **THEN** the route keeps the analysis action available without requiring any template choice
- **AND** does not send a template identifier with the ABNT request

### Requirement: ABNT in-memory result restoration and history

The Conformidade ABNT route SHALL retain each observed absent, completed, or error result only for the current page visit. Returning to an observed target SHALL restore that state immediately while the route revalidates it in the background; only processing targets SHALL continue polling. The route SHALL also provide a History action that presents all returned executions for the selected PDF from most recently updated to least recently updated.

#### Scenario: User reselects a previously consulted PDF

- **WHEN** the user returns to a target whose absent, completed, or error result was observed during the current page visit
- **THEN** the route restores its in-memory state immediately
- **AND** refreshes the latest result in the background
- **AND** discards that cached state when the page is reloaded

#### Scenario: User opens ABNT history

- **WHEN** the user activates History for a selected PDF
- **THEN** the route presents every returned ABNT execution ordered by latest update first
- **AND** includes its status, creation time, update time, and available error detail
- **AND** does not replace the primary result view

#### Scenario: Empty or failed history lookup

- **WHEN** history has no executions or its request fails
- **THEN** the route presents a readable empty or error state in the history view
- **AND** preserves the selected PDF and its primary result

### Requirement: ABNT report presentation

The Conformidade ABNT route SHALL present a completed ABNT report in Brazilian Portuguese with its available summary and findings in a readable, scrollable result panel. When the report contains `metadata`, `summary`, and `criteria`, the route SHALL align metadata and summary blocks at their top and bottom edges on desktop, and present every criterion at the full available result width with translated labels. It SHALL preserve backend-provided content rather than report a successful detailed assessment when the completed result contains no structured report.

#### Scenario: Completed result has a report

- **WHEN** a completed ABNT result contains a report
- **THEN** the route presents its available summary and findings with readable labels

#### Scenario: Completed report contains ABNT criteria

- **WHEN** a completed ABNT report contains `metadata`, `summary`, and a `criteria` collection
- **THEN** the route presents translated metadata and summary labels in same-height top-level blocks on desktop
- **AND** presents each criterion's item, normative reference, and justification in a full-width row below them

#### Scenario: Completed result lacks a structured report

- **WHEN** a completed ABNT result has no report or a report that cannot be structured for display
- **THEN** the route explains that the analysis completed without detailed findings
- **AND** keeps the execution metadata available
