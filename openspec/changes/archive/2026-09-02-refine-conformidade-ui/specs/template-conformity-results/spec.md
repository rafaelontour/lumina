## MODIFIED Requirements

### Requirement: User-initiated template conformity

The Conformidade Template route SHALL load the available template objects from GET /templates, present each object's 
ame as a selectable label, and start an analysis only after the user selects a target and a template and explicitly activates the start action. The selected template's UUID SHALL be sent as 	emplate_id to the conformity endpoint. The route MUST permit at most one template-conformity execution for each uploaded PDF version and MUST enable another execution only after Documentos provides a newer PDF version whose main analysis is ready for that component; the upload itself MUST NOT start template conformity. When an uploaded PDF version already has an execution (the action displays “Análise já realizada”), the template selector MUST remain fixed on the template used for that execution and SHALL NOT permit selecting another template.

#### Scenario: User selects an available template

- **WHEN** the template catalog returns one or more template objects
- **THEN** the selector presents each object's 
ame
- **AND** the chosen template's UUID is sent as 	emplate_id when the user starts the analysis

#### Scenario: Template catalog is empty

- **WHEN** the template catalog returns an empty 	emplates collection
- **THEN** the selector explains that no template is available
- **AND** keeps the start action disabled

#### Scenario: User starts an analysis

- **WHEN** the user selects an uploaded PDF version without a template-conformity execution and a template and activates “Iniciar análise”
- **THEN** the frontend obtains the stored release PDF without creating another release
- **AND** sends that PDF and the selected 	emplate_id to POST /templates/{docId}/conformidade
- **AND** presents the accepted processing state

#### Scenario: Template analysis already exists for the current version

- **WHEN** the selected uploaded PDF version already has a returned template-conformity execution
- **THEN** the route keeps the start action disabled displaying “Análise já realizada”
- **AND** the template selector is disabled and fixed on the template used for that execution
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
- **AND** the template selector becomes editable for the new version
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

### Requirement: Completed template report presentation

The route SHALL render a completed template conformity report in backend order, including its available metadata (omitting technical approach details), summary, and every reported section and criterion, without rendering report content as HTML. On desktop, the metadata and summary blocks SHALL share the same top and bottom alignment when presented together. The summary's conformity-general and sections-attended indicators SHALL be displayed together above its available description, which SHALL occupy a separate full-width line below them. Each criterion inside an expanded section SHALL use the full available horizontal report width and display a conformity badge next to its title (“Em conformidade” in green with a check icon when match: true, and “Não conforme” in red with an x icon when match: false). For a criterion with is_visual: false, the route SHALL obtain and show only its deterministic field comparisons from criteria[].checks, rendering for each check item its field name, template value, article value, and a conformity badge (“Em conformidade” in green with a check icon when match: true, and “Não conforme” in red with an x icon when match: false). For a criterion with is_visual: true, it SHALL obtain and show only its IA evaluation items from criteria[].criteria. Report labels and known status values SHALL be presented in Brazilian Portuguese.

#### Scenario: Completed report includes deterministic checks

- **WHEN** a completed report contains a section criterion with is_visual: false and field comparisons in criteria[].checks
- **THEN** the route shows the criterion title with its conformity badge (“Em conformidade” or “Não conforme” with icon)
- **AND** renders each check item with its field name, template value, article value, and conformity badge (“Em conformidade” or “Não conforme” with icon)
- **AND** the criterion uses the full available report width

#### Scenario: Completed report includes visual checks

- **WHEN** a completed report contains a section criterion with is_visual: true and evaluation items in criteria[].criteria
- **THEN** the route shows the criterion title with its conformity badge (“Em conformidade” or “Não conforme” with icon)
- **AND** shows each evaluation item's criterion and justification
- **AND** the criterion uses the full available report width

#### Scenario: Criterion source is selected by its kind

- **WHEN** a report criterion is normalized for presentation
- **THEN** the route does not use criteria[].criteria for a deterministic criterion
- **AND** does not use criteria[].checks for a visual criterion

#### Scenario: Completed report contains divergent sections

- **WHEN** a completed report contains one or more sections or criteria that do not match
- **THEN** the route makes their divergent status clearly distinguishable from compatible content while keeping all report content available for review
- **AND** aligns each section's status indicator at the opposite right edge from its title

#### Scenario: User opens a completed report

- **WHEN** the route renders the report sections for the first time
- **THEN** every section is collapsed initially
- **AND** the user can independently expand the section they want to inspect

#### Scenario: Document selector has more targets than its visible height

- **WHEN** the Template document selector contains more grouped document targets than fit in the workspace
- **THEN** the selector remains stationary and offers internal vertical scrolling to every target
- **AND** no target is cut off below the workspace edge

#### Scenario: Document selector displays multiple groups

- **WHEN** the Template document selector renders document groups with one or more file targets
- **THEN** each group is visually enclosed in a subtle distinct container
- **AND** its group heading and file targets remain together within that container

#### Scenario: Report includes metadata and summary

- **WHEN** a completed report provides both metadata and summary content
- **THEN** the route presents their top-level blocks aligned at the top of the report area
- **AND** gives both blocks the same height on desktop
- **AND** presents the conformity-general and sections-attended indicators above the available summary description
- **AND** omits any approach metadata item from the metadata list
- **AND** preserves readable presentation when only one block is available or on a narrow viewport

#### Scenario: Report contains technical labels and status values

- **WHEN** metadata or summary contains fields such as model or is_compliant
- **THEN** the route presents a Brazilian Portuguese label and a readable Portuguese value for that field
- **AND** omits pproach from the metadata list
