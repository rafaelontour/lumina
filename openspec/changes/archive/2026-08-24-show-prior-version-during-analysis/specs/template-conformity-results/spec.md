## ADDED Requirements

### Requirement: Template target fallback during main document analysis

The Conformidade Template route SHALL retain the most recent release with completed main document analysis as the displayed target while a newer release of that component is pending main analysis. It SHALL identify that a newer version is being analyzed and disable the template conformity start action until the newer release becomes available. If no prior analyzed release exists, it SHALL keep the start action disabled and explain that the source is not ready.

#### Scenario: Prior analyzed release remains available

- **WHEN** a component has a newer release with pending main analysis and an earlier release with completed main analysis
- **THEN** the Template route displays the earlier release as the selected target
- **AND** identifies that the newer version is still being analyzed
- **AND** keeps the template conformity start action disabled

#### Scenario: Newest release becomes available

- **WHEN** the newer release completes its main document analysis
- **THEN** the Template route uses that newer release as the target
- **AND** evaluates template-conformity start eligibility for that release

#### Scenario: No analyzed prior release exists

- **WHEN** the newest release is pending main analysis and the component has no earlier analyzed release
- **THEN** the Template route keeps the start action disabled
- **AND** explains that the document source is still being prepared
