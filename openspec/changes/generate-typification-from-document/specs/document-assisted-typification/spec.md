## Purpose

Permitir que administradores transformem documentos normativos em sugestões revisáveis de fontes, tipificações, taxonomias e ramos antes de aplicá-las à árvore de verificação.

## ADDED Requirements

### Requirement: Document-assisted suggestion session creation
The application SHALL allow an administrator to create a document-assisted suggestion session by selecting one PDF and choosing whether to create a new typification or enrich an existing typification. Creating a new typification SHALL omit a target typification, while enrichment SHALL require and submit the selected existing typification as the target. The application MUST NOT create, update, or confirm any tree item merely because the PDF was uploaded.

#### Scenario: Administrator starts a new typification from a PDF
- **WHEN** an administrator selects one valid PDF, chooses to create a new typification, and submits the document
- **THEN** the application creates a suggestion session without a target typification
- **AND** presents the returned processing or review state

#### Scenario: Administrator enriches an existing typification
- **WHEN** an administrator selects one valid PDF, chooses to enrich an existing typification, selects the target, and submits the document
- **THEN** the application creates a suggestion session with that persistent typification identifier
- **AND** identifies the target typification in the session experience

#### Scenario: Required document input is missing
- **WHEN** the administrator submits without a PDF or chooses enrichment without selecting a target typification
- **THEN** the application identifies the missing input
- **AND** does not create a suggestion session

#### Scenario: Session creation fails
- **WHEN** the backend rejects the document or the session request fails
- **THEN** the application presents a normalized error
- **AND** keeps the administrator able to correct the input and retry without a duplicate automatic submission

### Requirement: Suggestion session lifecycle
The application SHALL list the authenticated administrator's backend suggestion sessions and SHALL load a selected session's canonical detail. It SHALL poll only a selected session whose status is `processing`; `ready`, `failed`, and `completed` SHALL be terminal for polling. Session state MUST NOT be persisted in browser storage.

#### Scenario: Administrator opens document-assisted creation
- **WHEN** the document-assisted experience becomes available
- **THEN** the application loads the backend session list
- **AND** presents each session with its document name, mode, creation time, and status

#### Scenario: Selected session is processing
- **WHEN** the selected session has status `processing`
- **THEN** the application presents a readable processing state
- **AND** periodically reloads that session until a terminal state or request failure is observed

#### Scenario: Processing completes
- **WHEN** polling observes `ready`, `failed`, or `completed`
- **THEN** the application stops polling that session
- **AND** presents its latest canonical detail

#### Scenario: Existing session is reopened
- **WHEN** the administrator selects a previously created session
- **THEN** the application obtains its current detail from the backend
- **AND** does not reconstruct confirmation or discard state from browser storage

#### Scenario: Session list or detail is unavailable
- **WHEN** loading the session list or a selected detail fails
- **THEN** the application presents a readable retryable error without modifying the tree

### Requirement: Hierarchical suggestion review
The application SHALL present a ready or completed session's suggestions as a hierarchy derived from the returned parent relationships. Each suggestion SHALL identify its kind, create-or-update operation, current status, proposed content, rationale, similarity warning when present, and PDF evidence with page references. Rules returned outside the tree scope SHALL be presented separately and SHALL NOT offer confirmation actions.

#### Scenario: Ready session contains suggestions
- **WHEN** a selected session has suggestions available for review
- **THEN** the application groups and nests sources, typifications, taxonomies, and branches according to the returned hierarchy
- **AND** distinguishes pending, confirmed, and discarded items

#### Scenario: Suggestion contains evidence
- **WHEN** a suggestion includes one or more evidence entries
- **THEN** the application presents each quote and its available page numbers in that suggestion's context

#### Scenario: Suggestion may duplicate an existing entity
- **WHEN** a suggestion includes similarity information or an update target snapshot
- **THEN** the application visibly identifies the possible match or existing value before confirmation

#### Scenario: Document contains out-of-scope rules
- **WHEN** the session returns excluded rules
- **THEN** the application presents their titles, quotations, and available pages in a separate read-only section
- **AND** does not represent them as pending tree items

### Requirement: Human confirmation before tree mutation
The application MUST require an explicit administrator action for every suggestion applied to the real tree. A pending item SHALL be confirmable with its proposed content or with administrator-edited title and description values supported by that item. After a successful confirmation, the application SHALL reload the session detail and the canonical typification list. It MUST NOT describe the complete session as an atomic transaction because confirmed items may already be applied while other items remain pending or are later discarded.

#### Scenario: Administrator confirms proposed content
- **WHEN** the administrator explicitly confirms a pending item without editing it
- **THEN** the application requests confirmation of that item
- **AND** after success shows the backend-confirmed state and applied entity
- **AND** refreshes the canonical typification list

#### Scenario: Administrator confirms edited content
- **WHEN** the administrator edits an allowed title or description and confirms the pending item
- **THEN** the application validates the editable values and submits those adjustments with the confirmation
- **AND** after success presents the canonical confirmed item

#### Scenario: Parent suggestion remains pending
- **WHEN** a pending suggestion depends on another session item that is not confirmed
- **THEN** the application prevents confirmation of the dependent item
- **AND** explains that its parent must be confirmed first

#### Scenario: Confirmation fails
- **WHEN** the confirmation request fails
- **THEN** the application keeps the item unconfirmed in the interface
- **AND** presents a normalized error
- **AND** reloads canonical session detail before another confirmation attempt

#### Scenario: Previously confirmed items coexist with pending items
- **WHEN** at least one suggestion has been confirmed while others remain pending
- **THEN** the application identifies which changes have already entered the real tree
- **AND** does not imply that abandoning the remaining review rolls those changes back

### Requirement: Suggestion discard controls
The application SHALL allow an administrator to discard one pending suggestion or all remaining pending suggestions after explicit confirmation. It SHALL reflect backend-propagated discards of pending descendants and MUST NOT present discard as a rollback of items already confirmed.

#### Scenario: Administrator discards one suggestion
- **WHEN** the administrator confirms the discard action for a pending item
- **THEN** the application requests its discard
- **AND** reloads the session detail showing that item and any backend-discarded descendants as discarded

#### Scenario: Administrator discards all remaining suggestions
- **WHEN** the administrator confirms the action to discard every remaining pending item
- **THEN** the application requests the session-level discard
- **AND** presents the resulting canonical session state

#### Scenario: Discard fails
- **WHEN** an item or session discard request fails
- **THEN** the application presents a normalized error
- **AND** reloads canonical session detail without assuming the discard succeeded

### Requirement: Processing and review boundaries
The application SHALL prevent duplicate session creation and concurrent duplicate review actions while their respective requests are pending. It SHALL provide no control that claims to cancel backend generation while no processing-cancellation operation exists.

#### Scenario: Session upload is in progress
- **WHEN** a create-session request is pending
- **THEN** the application disables duplicate submission of the same form

#### Scenario: Review mutation is in progress
- **WHEN** an item confirmation or discard request is pending
- **THEN** the application disables another mutation for that same item or session until the response is resolved

#### Scenario: Session remains processing
- **WHEN** a generation session is still processing
- **THEN** the application offers status monitoring and navigation away
- **AND** does not label any local action as cancellation of that backend process
