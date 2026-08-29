## ADDED Requirements

### Requirement: Split Document And Chat Workspace
Oiac IA SHALL show the selected conversation's source document together with the AI chat so the user can read the document and converse about it in the same workspace.

#### Scenario: Desktop user opens a selected conversation
- **WHEN** a selected Oiac IA conversation is available on a desktop-sized viewport
- **THEN** the workspace displays the document viewing area and the AI chat area side by side with each area occupying approximately half of the conversation workspace

#### Scenario: User selects a different conversation
- **WHEN** the user selects another Oiac IA conversation
- **THEN** the document viewing area updates to the newly selected conversation's document while the chat area loads that conversation's messages

#### Scenario: No conversation is selected
- **WHEN** no Oiac IA conversation is selected
- **THEN** the workspace presents the existing empty state without trying to render a document preview

### Requirement: Embedded PDF Viewer Controls
Oiac IA SHALL provide embedded PDF controls for page navigation and zoom in the document viewing area.

#### Scenario: User navigates PDF pages
- **WHEN** a selected conversation has a PDF available for preview
- **THEN** the document viewing area allows the user to move between pages and shows the current page position

#### Scenario: User changes PDF zoom
- **WHEN** a selected conversation has a PDF available for preview
- **THEN** the document viewing area allows the user to zoom the PDF in and out
