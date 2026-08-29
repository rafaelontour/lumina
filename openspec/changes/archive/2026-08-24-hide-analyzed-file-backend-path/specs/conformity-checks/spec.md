## ADDED Requirements

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

## MODIFIED Requirements

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
