## ADDED Requirements

### Requirement: Complete Release Analysis Opening Message
Oiac IA SHALL present the selected release analysis before the saved conversation messages, indicating processing while the analysis is pending and presenting the summary plus every analyzed typification when it is complete.

#### Scenario: Selected release has a completed analysis
- **WHEN** the selected release has a non-empty `check_tree`
- **THEN** Oiac IA presents an initial response before the document's saved messages
- **AND** includes the release `description` when it is non-empty
- **AND** includes every typification, taxonomy, branch, evaluation status, score, feedback, and associated source available in `check_tree`

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
