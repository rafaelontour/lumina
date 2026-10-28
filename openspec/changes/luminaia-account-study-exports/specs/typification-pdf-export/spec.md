## Purpose

Permitir que usuários baixem uma tipificação específica ou a árvore completa de verificação em PDF.

## ADDED Requirements

### Requirement: Export typification tree as PDF
The typification browser SHALL provide an export action for one selected typification and an action for the complete tree. The application SHALL request the PDF through the internal backend proxy and download the binary response without rendering response metadata as JSON.

#### Scenario: User exports one typification
- **WHEN** a user requests export from a typification card
- **THEN** the application requests the PDF with that persistent typification identifier
- **AND** starts a download for the returned PDF

#### Scenario: User exports all typifications
- **WHEN** a user requests export of the complete typification tree
- **THEN** the application requests the PDF without a typification identifier
- **AND** starts a download for the returned PDF

#### Scenario: PDF export fails
- **WHEN** the backend rejects or cannot produce the export
- **THEN** the application presents a normalized readable error
- **AND** does not offer an empty or invalid file as a successful download
