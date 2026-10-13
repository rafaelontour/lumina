## ADDED Requirements

### Requirement: Safe Markdown presentation of monitored release analysis
The advisor monitoring experience SHALL render each monitored release's non-empty `description`, each non-empty taxonomy and branch `description`, and each non-empty `check_tree[].taxonomies[].branches[].evaluation.feedback` as CommonMark with GitHub-Flavored Markdown tables. It MUST treat these fields as untrusted content and MUST NOT interpret raw HTML.

#### Scenario: Monitored release summary contains Markdown
- **WHEN** a monitored release `description` contains paragraphs, bold text, unordered lists, or headings
- **THEN** the monitoring result presents the corresponding formatted elements instead of literal Markdown markers

#### Scenario: Monitored criterion feedback contains a table
- **WHEN** evaluation `feedback` contains a valid GFM table
- **THEN** the monitoring result presents a legible table within the criterion
- **AND** allows horizontal access to wide table content without overflowing the result panel

#### Scenario: Monitored analysis contains raw HTML
- **WHEN** a monitored release summary or criterion feedback contains raw HTML
- **THEN** the monitoring result does not create active HTML elements from that content

#### Scenario: Monitored legacy analysis contains plain text
- **WHEN** the summary or feedback comes from an older release as plain text
- **THEN** the monitoring result continues to present it legibly through the same rendering path

#### Scenario: Monitored analysis contains compact typographic bullets
- **WHEN** a monitored release, taxonomy, branch, or criterion feedback description separates list items with inline `●` markers
- **THEN** the monitoring result presents each marked item on its own line as an unordered list
