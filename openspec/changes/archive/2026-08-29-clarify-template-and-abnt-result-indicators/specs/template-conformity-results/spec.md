## MODIFIED Requirements

### Requirement: Completed template report presentation

The route SHALL render a completed template conformity report in backend order, including its available metadata, summary, and every reported section and criterion, without rendering report content as HTML. On desktop, the metadata and summary blocks SHALL share the same top and bottom alignment when presented together. The summary's conformity-general and sections-attended indicators SHALL be displayed together above its available description, which SHALL occupy a separate full-width line below them. Each criterion inside an expanded section SHALL use the full available horizontal report width. For a criterion with `is_visual: false`, the route SHALL obtain and show only its deterministic field comparisons from `criteria[].checks`; for a criterion with `is_visual: true`, it SHALL obtain and show only its IA evaluation items from `criteria[].criteria`. Report labels and known status values SHALL be presented in Brazilian Portuguese.

#### Scenario: Completed report includes deterministic checks

- **WHEN** a completed report contains a section criterion with `is_visual: false` and field comparisons in `criteria[].checks`
- **THEN** the route shows the criterion status and each field's template value, article value, and match status
- **AND** the criterion uses the full available report width

#### Scenario: Completed report includes visual checks

- **WHEN** a completed report contains a section criterion with `is_visual: true` and evaluation items in `criteria[].criteria`
- **THEN** the route shows the criterion status and each evaluation item's criterion and justification
- **AND** the criterion uses the full available report width

#### Scenario: Criterion source is selected by its kind

- **WHEN** a report criterion is normalized for presentation
- **THEN** the route does not use `criteria[].criteria` for a deterministic criterion
- **AND** does not use `criteria[].checks` for a visual criterion

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
- **AND** preserves readable presentation when only one block is available or on a narrow viewport

#### Scenario: Report contains technical labels and status values

- **WHEN** metadata or summary contains fields such as `approach` or `is_compliant`
- **THEN** the route presents a Brazilian Portuguese label and a readable Portuguese value for that field
