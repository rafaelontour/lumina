## MODIFIED Requirements

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
