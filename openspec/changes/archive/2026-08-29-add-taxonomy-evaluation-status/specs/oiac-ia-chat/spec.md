## MODIFIED Requirements

### Requirement: Complete Release Analysis Opening Message

Oiac IA SHALL present the selected release analysis before the saved conversation messages, indicating processing while the analysis is pending and presenting the summary plus every analyzed typification when it is complete. Each taxonomy title SHALL classify branch outcomes by score: scores below 5 are “Não atendidos”, scores from 5 through 7 are “Parcialmente atendidos”, and scores above 7 are “Atendidos”. It SHALL show a count for each classification. A branch without a numeric score MAY use its boolean `fulfilled` result as a legacy fallback; one without either result SHALL not contribute to any count.

#### Scenario: Selected release has a completed analysis

- **WHEN** the selected release has a non-empty `check_tree`
- **THEN** Oiac IA presents an initial response before the document's saved messages
- **AND** includes the release `description` when it is non-empty
- **AND** includes every typification, taxonomy, branch, evaluation status, score, feedback, and associated source available in `check_tree`

#### Scenario: Taxonomy has branches across score ranges

- **WHEN** a taxonomy has branch scores below 5, from 5 through 7, and above 7
- **THEN** its title displays the count of non-attended, partially attended, and attended branches

#### Scenario: Taxonomy has only high-scoring branches

- **WHEN** every scored branch in a taxonomy has a score above 7
- **THEN** its title displays that attended count and zero partially attended and non-attended branches

#### Scenario: Taxonomy has no evaluated branches

- **WHEN** no criterion in a taxonomy provides a score or a boolean `fulfilled` result
- **THEN** its title displays zero attended, partially attended, and non-attended branches

#### Scenario: Handoff selects a release

- **WHEN** Oiac IA receives a release identifier in the Documentos handoff and that release has a non-empty `check_tree`
- **THEN** Oiac IA presents the complete analysis from that exact release before the selected document's saved messages
- **AND** does not substitute analysis from another release

#### Scenario: Analysis has no summary text

- **WHEN** the selected release has a non-empty `check_tree` and an empty `description`
- **THEN** Oiac IA presents the structured analysis without a summary section

#### Scenario: Selected release analysis is pending

- **WHEN** the selected release has an empty or absent `check_tree`
- **THEN** Oiac IA presents an animated processing response before the saved conversation messages
- **AND** refreshes that same selected release until its analysis is complete or the conversation context changes

#### Scenario: Pending analysis completes

- **WHEN** a refresh of the selected release returns a non-empty `check_tree`
- **THEN** Oiac IA replaces the processing response with the release `description` when present and the complete structured analysis
- **AND** does not create, update, or send a document message for either presentation

#### Scenario: Structured analysis is legible

- **WHEN** Oiac IA presents the release analysis
- **THEN** it groups content by typification, taxonomy, and criterion
- **AND** makes fulfilled status, score, feedback, sources, headings, and paragraph boundaries legible
- **AND** does not expose internal identifiers such as UUIDs

#### Scenario: Initial analysis is not a saved message

- **WHEN** Oiac IA presents the initial release analysis
- **THEN** it does not create, update, or send a document message for that presentation
