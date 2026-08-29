## ADDED Requirements

### Requirement: Handoff PDF Preview File Path
Oiac IA SHALL use a PDF file path received from Documentos handoff context to load the document preview, without replacing the backend document id used for conversation messages.

#### Scenario: Handoff includes PDF file path
- **WHEN** the Oiac IA route receives a backend document id and a PDF file path from Documentos
- **THEN** Oiac IA uses the backend document id to load and send conversation messages
- **AND** Oiac IA uses the PDF file path to download and render the PDF preview

#### Scenario: Handoff omits PDF file path
- **WHEN** the Oiac IA route receives a backend document id without a PDF file path
- **THEN** Oiac IA attempts to find a release with an available PDF file for preview using the selected document and supporting context
