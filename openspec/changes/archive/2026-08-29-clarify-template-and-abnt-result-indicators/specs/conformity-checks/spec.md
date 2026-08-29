## MODIFIED Requirements

### Requirement: ABNT report presentation

The Conformidade ABNT route SHALL present a completed ABNT report in Brazilian Portuguese with its available summary and findings in a readable, scrollable result panel. When the report contains `metadata`, `summary`, and `criteria`, the route SHALL align metadata and summary blocks at their top and bottom edges on desktop. The summary's conformity-general and criteria-attended indicators SHALL be displayed together above its available description, which SHALL occupy a separate full-width line below them. Each criterion SHALL initially show only its name and be independently expandable to show its normative reference and justification at the full available result width with translated labels. Each criterion with boolean `match` SHALL show a green conforming indicator when it is `true` and a red non-conforming indicator when it is `false`. When `metadata.article_file` is available, the route SHALL render it as a document badge containing an icon and only the file name, without exposing its backend path in visible text, title, or accessible label. It SHALL preserve backend-provided content rather than report a successful detailed assessment when the completed result contains no structured report.

#### Scenario: Completed result has a report

- **WHEN** a completed ABNT result contains a report
- **THEN** the route presents its available summary and findings with readable labels

#### Scenario: Completed report contains ABNT criteria

- **WHEN** a completed ABNT report contains `metadata`, `summary`, and a `criteria` collection
- **THEN** the route presents translated metadata and summary labels in same-height top-level blocks on desktop
- **AND** presents the conformity-general and criteria-attended indicators above the available summary description
- **AND** presents each criterion name in a full-width collapsed control below them with its conformity indicator aligned at the opposite right edge

#### Scenario: User expands one ABNT criterion

- **WHEN** the user activates a collapsed ABNT criterion
- **THEN** the route reveals only that criterion's normative reference and justification
- **AND** leaves the other criteria in their existing collapsed or expanded states

#### Scenario: Expanded criterion reaches the end of the result panel

- **WHEN** an expanded ABNT criterion is taller than the visible result panel
- **THEN** the user can scroll the independent result panel through its complete normative reference and justification
- **AND** its final content remains visible above the panel edge

#### Scenario: ABNT criterion is conforming

- **WHEN** an ABNT criterion contains `match: true`
- **THEN** the criterion shows a green visual indicator that it is in conformity

#### Scenario: ABNT criterion is non-conforming

- **WHEN** an ABNT criterion contains `match: false`
- **THEN** the criterion shows a red visual indicator that it is not in conformity

#### Scenario: Completed report identifies the analyzed file

- **WHEN** a completed ABNT report contains `metadata.article_file` with a backend path
- **THEN** the route displays only the final file name in a document badge
- **AND** does not expose the backend path in the rendered metadata

#### Scenario: Completed result lacks a structured report

- **WHEN** a completed ABNT result has no report or a report that cannot be structured for display
- **THEN** the route explains that the analysis completed without detailed findings
- **AND** keeps the execution metadata available
