## ADDED Requirements

### Requirement: Typification PDF export actions
The typification browser SHALL provide an export action on each typification and a separate action to export the complete tree as a PDF.

#### Scenario: User exports one card
- **WHEN** the user selects export on a typification card
- **THEN** the application downloads a PDF for that typification

#### Scenario: User exports the complete tree
- **WHEN** the user selects export for all typifications
- **THEN** the application downloads a PDF containing the complete tree
