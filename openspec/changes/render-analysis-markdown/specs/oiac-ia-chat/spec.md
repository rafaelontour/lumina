## ADDED Requirements

### Requirement: Safe Markdown rendering for release analysis
Oiac IA SHALL render a selected release's non-empty `description`, each non-empty taxonomy and branch `description`, each non-empty `check_tree[].taxonomies[].branches[].evaluation.feedback`, and the content of conversation messages as CommonMark with GitHub-Flavored Markdown tables. It MUST treat the strings as untrusted content and MUST NOT interpret raw HTML. Rendering MUST NOT alter the content sent to or received from the backend.

#### Scenario: Analysis summary contains Markdown
- **WHEN** a release `description` contains paragraphs, bold text, unordered lists, or level-one headings
- **THEN** Oiac IA presents the corresponding formatted elements instead of literal Markdown markers

#### Scenario: Criterion feedback contains a GFM table
- **WHEN** an evaluation `feedback` contains a valid GFM table
- **THEN** Oiac IA presents it as a legible table within the criterion
- **AND** keeps the table accessible without expanding the analysis panel beyond its available width

#### Scenario: Analysis contains raw HTML
- **WHEN** a release `description` or evaluation `feedback` contains raw HTML
- **THEN** Oiac IA does not create active HTML elements from that content
- **AND** does not execute scripts, event handlers, or other embedded markup behavior

#### Scenario: Legacy analysis contains plain text
- **WHEN** a release `description` or evaluation `feedback` contains only plain text from an older release
- **THEN** Oiac IA presents the text legibly without requiring a distinct legacy path

#### Scenario: Conversation message contains an unordered list
- **WHEN** a sent, saved, or assistant conversation message contains valid Markdown list items
- **THEN** Oiac IA presents the content as a list with visible markers
- **AND** presents each item on its own line

#### Scenario: Analysis contains compact typographic bullets
- **WHEN** a release, taxonomy, branch, criterion feedback, or conversation description separates list items with inline `●` markers
- **THEN** Oiac IA presents each marked item on its own line as an unordered list
- **AND** does not alter the content sent to or received from the backend

#### Scenario: Conversation message contains plain text
- **WHEN** a sent, saved, or assistant conversation message contains only plain text
- **THEN** Oiac IA presents the text legibly without requiring a distinct rendering path

#### Scenario: Conversation message contains raw HTML
- **WHEN** a sent, saved, or assistant conversation message contains raw HTML
- **THEN** Oiac IA does not create active HTML elements from that content

### Requirement: Markdown summary section emphasis
Oiac IA SHALL preserve its distinct visual emphasis for the recognized level-one summary headings “Pontos atendidos”, “Pontos a aprimorar” and “Orientação final” while rendering the surrounding release description as Markdown.

#### Scenario: Markdown summary contains recognized headings
- **WHEN** the release `description` contains `# Pontos atendidos`, `# Pontos a aprimorar`, or `# Orientação final`
- **THEN** Oiac IA renders each heading without its Markdown marker
- **AND** keeps the existing positive, attention, or closing emphasis associated with that section

#### Scenario: Markdown summary contains content below a recognized heading
- **WHEN** a recognized summary heading is followed by a paragraph, unordered list, or bold text
- **THEN** Oiac IA renders that content as Markdown within the corresponding visual flow
