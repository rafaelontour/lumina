## MODIFIED Requirements

### Requirement: Embedded PDF Viewer Controls
Oiac IA SHALL provide an embedded continuous PDF viewer that renders all pages in the document viewing area and provides exact-text search navigation and zoom controls.

#### Scenario: User reads a selected conversation PDF
- **WHEN** a selected conversation has a PDF available for preview
- **THEN** the document viewing area displays every PDF page in order in a vertically scrollable area
- **AND** the viewer provides a search field for exact text and controls to navigate its results

#### Scenario: User changes PDF zoom
- **WHEN** a selected conversation has a PDF available for preview
- **THEN** the document viewing area allows the user to zoom the PDF in and out
- **AND** preserves the currently selected PDF and any active search term
