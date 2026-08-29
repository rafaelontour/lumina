## ADDED Requirements

### Requirement: ABNT target fallback during main document analysis

The Conformidade ABNT route SHALL retain the most recent release with completed main document analysis as the displayed target while a newer release of that component is pending main analysis. It SHALL identify that a newer version is being analyzed and disable the ABNT start action until the newer release becomes available. If no prior analyzed release exists, it SHALL keep the start action disabled and explain that the source is not ready.

#### Scenario: Prior analyzed release remains available

- **WHEN** a component has a newer release with pending main analysis and an earlier release with completed main analysis
- **THEN** the ABNT route displays the earlier release as the selected target
- **AND** identifies that the newer version is still being analyzed
- **AND** keeps the ABNT start action disabled

#### Scenario: Newest release becomes available

- **WHEN** the newer release completes its main document analysis
- **THEN** the ABNT route uses that newer release as the target
- **AND** evaluates ABNT-start eligibility for that release

#### Scenario: No analyzed prior release exists

- **WHEN** the newest release is pending main analysis and the component has no earlier analyzed release
- **THEN** the ABNT route keeps the start action disabled
- **AND** explains that the document source is still being prepared

### Requirement: Mutually exclusive ABNT analysis status badges

The Conformidade ABNT selector SHALL present a processing badge instead of a terminal analyzed badge while an ABNT analysis for that target is actively processing.

#### Scenario: ABNT analysis is processing

- **WHEN** an ABNT analysis accepted during the current page visit is still processing
- **THEN** the selector displays only the processing status badge for that target
- **AND** does not display the terminal analyzed badge until processing reaches a terminal state
