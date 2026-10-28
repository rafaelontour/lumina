## ADDED Requirements

### Requirement: Visually highlighted study guide for project owner
The application SHALL present the study-guide card with a visually distinct, theme-compatible accent surface when the project owner views their guide. The advisor's read-only monitoring view SHALL remain visually neutral.

#### Scenario: Project owner views a document project
- **WHEN** a project owner views their document project
- **THEN** the “Guia de estudo” card is visually distinguished from the surrounding document cards
- **AND** its text and controls remain readable

#### Scenario: Advisor monitors an advisee guide
- **WHEN** an advisor views an advisee's guide in read-only monitoring
- **THEN** the guide retains the neutral monitoring presentation
