## Purpose
Document the current conformity-check baseline, including implemented service calls and placeholder pages.
## Requirements
### Requirement: Template Listing
The Conformidade Template page SHALL request available template names from `GET /templates`.

#### Scenario: Template conformity page loads
- **WHEN** the Conformidade Template page mounts
- **THEN** the application requests `/templates` and stores the returned template names when available

### Requirement: Explicit Template Conformity Selection
The Conformidade Template page SHALL let the user select an uploaded workspace PDF and an available template before starting template conformity.

#### Scenario: Uploaded PDFs are available
- **WHEN** the backend-backed Documentos workspace contains an uploaded PDF
- **THEN** the Conformidade Template page displays it as a selectable analysis target
- **AND** displays a template selector using the available template names

### Requirement: Template Conformity Request
The frontend SHALL obtain a selected stored PDF and submit it with its template name for template conformity only after an explicit user action on the Conformidade Template page.

#### Scenario: User starts template checking
- **WHEN** the user selects an uploaded PDF, chooses a template, and starts analysis
- **THEN** the frontend obtains the stored PDF and sends the PDF and `template_name` to `/templates/{docId}/conformidade`

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

The Conformidade ABNT route SHALL present a completed ABNT report in Brazilian Portuguese with its available summary and findings in a readable, scrollable result panel. When the report contains `metadata`, `summary`, and `criteria`, the route SHALL align metadata and summary blocks at their top and bottom edges on desktop, and present every criterion at the full available result width with translated labels. When `metadata.article_file` is available, the route SHALL render it as a document badge containing an icon and only the file name, without exposing its backend path in visible text, title, or accessible label. It SHALL preserve backend-provided content rather than report a successful detailed assessment when the completed result contains no structured report.

#### Scenario: Completed result has a report

- **WHEN** a completed ABNT result contains a report
- **THEN** the route presents its available summary and findings with readable labels

#### Scenario: Completed report contains ABNT criteria

- **WHEN** a completed ABNT report contains `metadata`, `summary`, and a `criteria` collection
- **THEN** the route presents translated metadata and summary labels in same-height top-level blocks on desktop
- **AND** presents each criterion's item, normative reference, and justification in a full-width row below them

#### Scenario: Completed report identifies the analyzed file

- **WHEN** a completed ABNT report contains `metadata.article_file` with a backend path
- **THEN** the route displays only the final file name in a document badge
- **AND** does not expose the backend path in the rendered metadata

#### Scenario: Completed result lacks a structured report

- **WHEN** a completed ABNT result has no report or a report that cannot be structured for display
- **THEN** the route explains that the analysis completed without detailed findings
- **AND** keeps the execution metadata available

### Requirement: Processing conformity target indicator

The Conformidade Template and Conformidade ABNT document selectors SHALL visibly distinguish a target whose analysis was explicitly started by the user during the current page visit and remains `processing`. The distinction SHALL combine a subtly different surface treatment with an “Em análise” indicator, and SHALL remain recognizable when that target is also the selected document.

#### Scenario: A listed target is processing

- **WHEN** the latest template or ABNT result for a listed document reports `status` as `processing`
- **THEN** that document's selector item displays the “Em análise” indicator
- **AND** its surface is visually distinct from idle, completed, absent, and errored targets

#### Scenario: Processing ends

- **WHEN** the latest result for a previously highlighted target becomes `completed`, `error`, or absent
- **THEN** the selector removes the processing indicator and treatment

#### Scenario: Selected target is processing

- **WHEN** the user selects a target that is currently processing
- **THEN** the selector preserves its selected state
- **AND** keeps the processing indicator visible

### Requirement: Session-only processing indicator

The processing indicator SHALL be kept only in the current in-memory page state. The route SHALL add it after the user receives an accepted start response, keep it while that user-started result is processing, and remove it when the result becomes terminal or the page is reloaded, left, or revisited. The route SHALL NOT query result endpoints solely to restore indicators on page load.

#### Scenario: User starts an analysis

- **WHEN** the user receives an accepted processing response after activating the start action
- **THEN** the route adds the processing indicator to that selected target

#### Scenario: User reloads or revisits a route

- **WHEN** the page is reloaded or the user leaves and later returns to a conformity route
- **THEN** no target shows a processing indicator until the user starts an analysis during that page visit

#### Scenario: User-started analysis ends

- **WHEN** the current page observes that the user-started result becomes `completed`, `error`, or absent without an accepted start awaiting it
- **THEN** the route removes the processing indicator from that target

### Requirement: Accessible processing motion

The “Em análise” indicator SHALL include a small nonessential motion cue while processing and SHALL remain understandable without motion.

#### Scenario: Reduced motion is preferred

- **WHEN** the user has enabled a reduced-motion preference
- **THEN** the motion cue is reduced or removed
- **AND** the static text and visual treatment still identify the target as processing

### Requirement: ABNT target fallback during main document analysis

The Conformidade ABNT route SHALL retain the most recent release with completed main document analysis as the displayed target while a newer release of that component is pending main analysis. It SHALL identify that a newer version is being analyzed and disable the ABNT start action until the newer release becomes available. If no prior analyzed release exists, it SHALL keep the start action disabled and explain that the source is not ready.

#### Scenario: Prior analyzed release remains available

- **WHEN** a component has a newer release with pending main analysis and an earlier release with completed main analysis
- **THEN** the ABNT route displays the earlier release as the selected target
- **AND** identifies that the newer version is still being analyzed
- **AND** keeps the ABNT start action disabled

#### Scenario: Newest release becomes available

- **WHEN** the newer release completes its main document analysis
- **THEN** the ABNT route uses that newer release as the target
- **AND** evaluates ABNT-start eligibility for that release

#### Scenario: No analyzed prior release exists

- **WHEN** the newest release is pending main analysis and the component has no earlier analyzed release
- **THEN** the ABNT route keeps the start action disabled
- **AND** explains that the document source is still being prepared

### Requirement: Mutually exclusive ABNT analysis status badges

The Conformidade ABNT selector SHALL present a processing badge instead of a terminal analyzed badge while an ABNT analysis for that target is actively processing.

#### Scenario: ABNT analysis is processing

- **WHEN** an ABNT analysis accepted during the current page visit is still processing
- **THEN** the selector displays only the processing status badge for that target
- **AND** does not display the terminal analyzed badge until processing reaches a terminal state

### Requirement: ABNT analyzed-version indicator

The Conformidade ABNT document selector SHALL show an “Analisado” badge for a PDF version whose ABNT history was observed during the current page visit and has an accepted execution. It SHALL preserve the existing processing indicator when applicable and SHALL not show the analyzed badge for an observed version without an accepted execution. It SHALL not perform an additional status sweep of every document solely to populate these badges.

#### Scenario: Version has an accepted ABNT analysis

- **WHEN** a selected document version has an accepted ABNT execution
- **THEN** its selector item displays an “Analisado” badge

#### Scenario: Version has not been analyzed

- **WHEN** an observed document version has no accepted ABNT execution
- **THEN** its selector item does not display the “Analisado” badge

#### Scenario: Page initially loads document selector

- **WHEN** the Conformidade ABNT page initially loads its document selector
- **THEN** it does not perform an additional status sweep of all documents merely to determine analyzed badges

### Requirement: One ABNT analysis per document version

The Conformidade ABNT route SHALL allow at most one accepted ABNT analysis for the selected current PDF version of a workspace document. Once an analysis for that version is accepted, the route SHALL disable the start action and explain that a new PDF version must be sent through Documentos before another ABNT analysis can be requested. The route SHALL retain this restriction after reload by consulting the document's ABNT result history. A later stored PDF version for the same document SHALL be eligible for one new ABNT analysis and SHALL NOT start it automatically.

#### Scenario: Selected PDF version already has an analysis

- **WHEN** the selected current PDF version has an accepted ABNT execution, regardless of whether it is processing, completed, or errored
- **THEN** the route disables “Iniciar análise” for that version
- **AND** explains that the user must send a new PDF version in Documentos to request another analysis

#### Scenario: New PDF version replaces an analyzed one

- **WHEN** Documentos has a newer stored PDF version for the same document and that version has no accepted ABNT execution
- **THEN** the Conformidade ABNT route enables one new analysis for the newer version
- **AND** does not create that analysis as a side effect of the upload

#### Scenario: ABNT start request is not accepted

- **WHEN** the route fails to receive an accepted response while starting ABNT analysis for the selected version
- **THEN** it keeps the start action available after presenting the failure

