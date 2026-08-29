## ADDED Requirements

### Requirement: One ABNT analysis per document version

The Conformidade ABNT route SHALL allow at most one accepted ABNT analysis for the selected current PDF version of a workspace document. Once an analysis for that version is accepted, the route SHALL disable the start action and explain that a new PDF version must be sent through Documentos before another ABNT analysis can be requested. The route SHALL retain this restriction after reload by consulting the document's ABNT result history. A later stored PDF version for the same document SHALL be eligible for one new ABNT analysis and SHALL NOT start it automatically.

#### Scenario: Selected PDF version already has an analysis

- **WHEN** the selected current PDF version has an accepted ABNT execution, regardless of whether it is processing, completed, or errored
- **THEN** the route disables “Iniciar análise” for that version
- **AND** explains that the user must send a new PDF version in Documentos to request another analysis

#### Scenario: New PDF version replaces an analyzed one

- **WHEN** Documentos has a newer stored PDF version for the same document and that version has no accepted ABNT execution
- **THEN** the Conformidade ABNT route enables one new analysis for the newer version
- **AND** does not create that analysis as a side effect of the upload

#### Scenario: ABNT start request is not accepted

- **WHEN** the route fails to receive an accepted response while starting ABNT analysis for the selected version
- **THEN** it keeps the start action available after presenting the failure
