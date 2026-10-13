## Purpose

Padronizar a apresentação segura e legível de prosa e conteúdo rico retornado pelo backend, especialmente textos produzidos por IA em análises, conversas e relatórios.

## ADDED Requirements

### Requirement: Backend rich-text presentation
The application SHALL render backend-provided prose and AI-generated content through one shared safe Markdown presentation path wherever that content is displayed in Oiac IA, advisee monitoring, Template conformity, or ABNT conformity. This content SHALL include release summaries, analysis-source descriptions, taxonomy and branch descriptions, evaluation feedback, conversation messages, conformity summary descriptions, compared textual values, normative references, and report justifications. The application MUST NOT interpret raw HTML from these fields.

#### Scenario: AI-generated content contains Markdown
- **WHEN** an eligible backend content field contains paragraphs, emphasis, headings, lists, or a GFM table
- **THEN** the application presents the corresponding formatted content rather than literal Markdown markers

#### Scenario: Backend content contains raw HTML
- **WHEN** an eligible backend content field contains raw HTML
- **THEN** the application does not create active HTML elements from that content
- **AND** does not execute scripts, event handlers, or embedded markup behavior

#### Scenario: Backend content is plain text
- **WHEN** an eligible backend content field contains only plain text
- **THEN** the application presents it legibly through the same shared path

### Requirement: Compact typographic list normalization
The application SHALL present every `●` marker in eligible backend rich text as the start of an unordered-list item on a separate line, regardless of whether the marker is adjacent to ordinary, non-breaking, or other Unicode spacing. The normalization MUST occur only for presentation and MUST NOT change content received from, persisted for, or sent to the backend.

#### Scenario: AI prose contains compact inline bullets
- **WHEN** backend rich text contains `introdução: ● primeiro item; ● segundo item`
- **THEN** the introduction is followed by a visible unordered list
- **AND** each marked item appears on its own line

#### Scenario: Typographic bullet uses non-breaking spacing
- **WHEN** a `●` marker in backend rich text is surrounded by non-breaking or other Unicode spacing
- **THEN** the application still presents that marker as a separate list item

#### Scenario: Original backend value is reused
- **WHEN** normalized rich text is rendered and the same value is later sent, persisted, compared, or cached
- **THEN** the application uses the original backend value rather than the presentation-normalized value

### Requirement: Operational metadata remains literal
The application SHALL keep backend-provided operational metadata as literal text rather than rich Markdown. Operational metadata includes user identity fields, email addresses, telephone numbers, project and document names, filenames and paths, template names, identifiers, dates, statuses, and technical error messages.

#### Scenario: Filename contains Markdown punctuation
- **WHEN** a backend filename contains characters that are meaningful in Markdown
- **THEN** the application displays those characters literally as part of the filename

#### Scenario: Backend error contains markup-like text
- **WHEN** a technical backend error includes Markdown or HTML-like syntax
- **THEN** the application presents the error as literal text rather than rich content
