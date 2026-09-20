## MODIFIED Requirements

### Requirement: Compact advisor monitoring in Documentos
The Documentos workspace SHALL provide `ADMIN` accounts only the “Meus orientandos” orientation page, visually distinct from the personal document workspace. It SHALL list the active advisees associated with the authenticated professor as a responsive collection of compact summary cards. Each card SHALL initially show only the advisee's circular profile image or readable initials fallback, name, email address, relationship creation date, and a “Ver perfil” control. The workspace SHALL label the aggregate document summary “Total de documentos”, calculate it as the sum of every loaded document belonging to every listed advisee, and visually count from zero through every consecutive integer until reaching that total. Activating “Ver perfil” SHALL open a wide, viewport-bounded modal that repeats the advisee's profile image, name, email address, and relationship date and separates the read-only detail into primary “OIAC IA” and “Grupo de documentos” tabs. “OIAC IA” SHALL expose the advisee's stored conversations for both standalone OIAC documents and group documents. “Grupo de documentos” SHALL present a searchable collection of projects derived only from group-associated documents. Selecting a project SHALL reveal its returned-file history in the same modal, partitioned into tabs for every document type required by the project's document group. Each returned document SHALL show the mean score of the newest file-bearing release and provide a control that opens that release's PDF and typification-analysis result in a second modal.

#### Scenario: Administrator opens advisee monitoring
- **WHEN** an authenticated administrator opens the orientation view in Documentos
- **THEN** the application lists only active advisees associated with that administrator
- **AND** presents each advisee as a compact card containing the advisee's circular profile image or initials fallback, name, email address, relationship creation date, and a “Ver perfil” control
- **AND** labels the aggregate document summary “Total de documentos”
- **AND** calculates that summary by summing the loaded document counts of all listed advisees
- **AND** keeps project information out of the initial list
- **AND** presents the results in the advisor-monitoring layout rather than the personal document workspace layout

#### Scenario: Administrator requests an advisee profile
- **WHEN** the administrator activates “Ver perfil” on an advisee card
- **THEN** the application opens a modal for that advisee
- **AND** uses an expanded horizontal width on wide viewports while keeping the modal bounded by the viewport
- **AND** repeats the advisee's profile image or initials fallback, name, email address, and relationship date in the modal header
- **AND** presents accessible primary tabs named “OIAC IA” and “Grupo de documentos”
- **AND** initially selects “OIAC IA”
- **AND** keeps all content in both tabs read-only

#### Scenario: Administrator opens OIAC IA conversations
- **WHEN** the administrator activates the “OIAC IA” tab
- **THEN** the modal lists conversation candidates derived from both standalone OIAC documents and documents associated with groups for that advisee
- **AND** does not attempt to resolve a standalone OIAC document against `GET /document-group`
- **AND** does not include documents belonging to another advisee

#### Scenario: Administrator selects an OIAC IA conversation
- **WHEN** the administrator selects a conversation candidate in the “OIAC IA” tab
- **THEN** the application requests that document's stored messages through `GET /doc/{id}/messages`
- **AND** presents the messages from oldest to newest
- **AND** identifies messages whose mentions contain type `AI` as IA messages and the other messages as orientando messages
- **AND** provides no message composer, send action, or other mutation

#### Scenario: OIAC IA conversation is loading, empty, or unavailable
- **WHEN** a selected conversation's messages are loading
- **THEN** the transcript presents a readable loading state
- **AND WHEN** the selected conversation has no stored messages
- **THEN** the transcript presents a readable empty state
- **AND WHEN** its request fails
- **THEN** the transcript presents a readable error state without hiding the other conversation candidates

#### Scenario: Administrator opens grouped documents
- **WHEN** the administrator activates the “Grupo de documentos” tab
- **THEN** the modal lists the distinct project names derived only from that advisee's group-associated returned documents
- **AND** excludes standalone documents whose `source` is `oiac-ia-avulsa` from project and document-group resolution
- **AND** retains legacy returned documents that have group or project metadata even when their `source` does not use the current group-document prefix
- **AND** provides a text field for searching those projects by name

#### Scenario: Aggregate document total becomes available or changes
- **WHEN** the loaded aggregate document total is established or changes
- **THEN** the visible “Total de documentos” value starts at zero
- **AND** advances through every consecutive integer without skipping until it reaches the calculated total
- **AND** leaves the calculated total displayed after the animation completes
- **AND** exposes the stable final total to assistive technology without announcing every intermediate value

#### Scenario: Administrator prefers reduced motion
- **WHEN** the loaded aggregate document total is established or changes while reduced motion is preferred
- **THEN** “Total de documentos” displays the calculated final total immediately
- **AND** does not run the intermediate visual count

#### Scenario: Administrator searches projects in the profile modal
- **WHEN** the administrator enters a project-name term in an open advisee profile modal
- **THEN** the modal shows only that advisee's project names matching the term without case or accent sensitivity
- **AND** does not search or display projects from another advisee

#### Scenario: Administrator selects a project
- **WHEN** the administrator activates a project in the profile modal
- **THEN** the modal identifies that project as selected
- **AND** resolves that project's document group against `GET /document-group`
- **AND** presents one tab for every required document type in that group, following the order returned by the backend
- **AND** initially selects the first required document type
- **AND** requests the releases of those documents through `GET /doc/{id}/release`
- **AND** keeps the project selector and document history readable together on wide viewports

#### Scenario: Administrator switches the required document type tab
- **WHEN** the administrator activates a document-type tab for the selected project
- **THEN** the panel presents only returned documents belonging to that project whose `tipo_documento` matches the selected required type without case or accent sensitivity
- **AND** orders those documents from the most recently sent or updated to the oldest
- **AND** does not display documents from another required type in that tab
- **AND** preserves the score and “Ver documento” behavior for every displayed document

#### Scenario: Required document type has no sent document
- **WHEN** a document type required by the selected project's group has no matching returned document
- **THEN** its tab remains visible and selectable
- **AND** its panel presents only “Nenhum arquivo enviado ainda”
- **AND** does not hide that required type or display a document from another type

#### Scenario: Document-group catalog is unavailable or cannot be matched
- **WHEN** `GET /document-group` fails or the selected project's returned group name cannot be matched to a catalog group
- **THEN** the modal keeps the history usable by deriving tabs from the distinct returned `tipo_documento` values for that project
- **AND** presents readable non-blocking feedback that the complete set of required document types could not be loaded
- **AND** does not mix documents from different derived types

#### Scenario: Administrator views a project's document history
- **WHEN** a selected project contains returned documents
- **THEN** each document entry shows its name, available group and document type, sent and last-updated dates, and archived state
- **AND** identifies the newest release containing a file
- **AND** labels and shows that release's arithmetic mean as “Nota média: N,N”, using all numeric criterion scores from `check_tree` and one decimal place
- **AND** offers a “Ver documento” control for that document
- **AND** visually connects multiple document entries in the active type through a vertical line and timeline markers
- **AND** ends that line at the first and last entries without drawing a trailing segment
- **AND** does not draw a connecting line for an empty or single-entry history
- **AND** does not present processing status or processing-history events
- **AND** offers no editing, upload, archive, analysis, or other mutation action

#### Scenario: Latest file-bearing release has no scored criterion
- **WHEN** a document's newest file-bearing release contains no numeric criterion score
- **THEN** its history card presents “Sem nota”
- **AND** does not derive a score from `fulfilled` or from another release

#### Scenario: Document release metadata is loading or unavailable
- **WHEN** the releases for a document in the selected project are still loading
- **THEN** that document card presents a compact loading state for the score
- **AND WHEN** its release request fails or no file-bearing release exists
- **THEN** that card presents “Nota indisponível” without hiding the other project documents

#### Scenario: Administrator opens a returned document
- **WHEN** the administrator activates “Ver documento” for a document in the selected project
- **THEN** the application opens a second modal above the profile modal
- **AND** uses the same newest file-bearing release represented by that document card
- **AND** loads that release's PDF through the authenticated backend proxy
- **AND** renders the PDF with the existing document viewer
- **AND** presents beside it the release `description` when non-empty and every available typification, taxonomy, criterion, score, status, feedback, and source from that release's `check_tree`
- **AND** stacks the PDF and analysis result on narrow viewports while keeping them side by side on wide viewports
- **AND** keeps the selected advisee and project available behind the document modal

#### Scenario: Displayed release has no typification analysis
- **WHEN** the newest file-bearing release has an empty or absent `check_tree`
- **THEN** the analysis panel presents a readable unavailable-analysis state
- **AND** does not substitute an analysis from an older or different release

#### Scenario: Returned document PDF is loading or unavailable
- **WHEN** the selected document's release or PDF is still loading
- **THEN** the document modal presents a readable loading state
- **AND WHEN** no release contains a file or the request fails
- **THEN** the document modal presents a readable error or unavailable state without closing the profile modal

#### Scenario: Administrator closes the document modal
- **WHEN** the administrator activates its close control, clicks its backdrop, or presses Escape
- **THEN** only the document modal closes
- **AND** focus returns to the originating “Ver documento” control when it remains available
- **AND** any temporary object URL created for the PDF is released

#### Scenario: Selected project has a long name
- **WHEN** the selected project's name exceeds the available document-panel width
- **THEN** the complete name wraps across lines inside the panel
- **AND** does not overflow the modal horizontally

#### Scenario: Advisee has no returned project
- **WHEN** the selected advisee's returned documents contain no project name
- **THEN** the modal presents a readable empty-project state
- **AND** keeps the advisee identity, email address, and relationship date visible

#### Scenario: Administrator closes the profile modal
- **WHEN** the administrator activates the close control, clicks the backdrop, or presses Escape
- **THEN** the profile modal closes
- **AND** the advisee-card list remains available

#### Scenario: Relationship date is unavailable
- **WHEN** an active advisee card cannot be matched to a valid relationship creation timestamp
- **THEN** the card presents a readable unavailable-date fallback
- **AND** does not substitute the advisee account creation date

#### Scenario: Administrator opens Documentos
- **WHEN** an authenticated `ADMIN` account opens `/documentos`
- **THEN** the application directs it to “Meus orientandos”
- **AND** does not render the personal document workspace

#### Scenario: Administrator has no advisees with documents
- **WHEN** an administrator has no active advisees or the active advisees have no returned documents
- **THEN** the application presents a readable empty state
- **AND** does not show document groups belonging to another advisor

## REMOVED Requirements

### Requirement: Advisor-specific project search and student filter
**Reason**: The student selector and project search consume space that is now reserved for the compact advisee-card list and are no longer part of this workspace presentation.

**Migration**: The workspace presents the authenticated advisor's returned cards directly. Filtering can be proposed later if the list size requires a more compact discovery mechanism.
