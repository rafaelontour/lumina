## ADDED Requirements

### Requirement: Stable Component Ordering
The Documentos page SHALL keep document components in their document group order regardless of upload, release, or analysis state.

#### Scenario: Component receives a PDF
- **WHEN** a component receives a PDF release
- **THEN** the component remains in its original position relative to the other components in the same document

#### Scenario: Component analysis becomes ready
- **WHEN** a component's backend release transitions from pending analysis to ready analysis
- **THEN** the component remains in its original position relative to the other components in the same document

### Requirement: PDF File Path Handoff Context
The Documentos page SHALL include the selected release PDF file path as supporting context when linking a component version to Oiac IA, when that file path is available.

#### Scenario: User opens Oiac IA from a component with a PDF file path
- **WHEN** the user chooses to analyze a component version with Oiac IA
- **THEN** the link carries the backend document id as the canonical conversation identifier
- **AND** the link carries the release id and PDF file path as supporting context when available
