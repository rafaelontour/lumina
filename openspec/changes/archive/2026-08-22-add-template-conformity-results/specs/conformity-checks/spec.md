## MODIFIED Requirements

### Requirement: Template Listing
The Conformidade Template page SHALL request available template names from `GET /templates`.

#### Scenario: Template conformity page loads
- **WHEN** the Conformidade Template page mounts
- **THEN** the application requests `/templates` and stores the returned template names when available

### Requirement: Explicit Template Conformity Selection
The Conformidade Template page SHALL let the user select an uploaded workspace PDF and an available template before starting template conformity.

#### Scenario: Uploaded PDFs are available
- **WHEN** the backend-backed Documentos workspace contains an uploaded PDF
- **THEN** the Conformidade Template page displays it as a selectable analysis target
- **AND** displays a template selector using the available template names

### Requirement: Template Conformity Request
The frontend SHALL obtain a selected stored PDF and submit it with its template name for template conformity only after an explicit user action on the Conformidade Template page.

#### Scenario: User starts template checking
- **WHEN** the user selects an uploaded PDF, chooses a template, and starts analysis
- **THEN** the frontend obtains the stored PDF and sends the PDF and `template_name` to `/templates/{docId}/conformidade`

### Requirement: ABNT Conformity Request
The frontend SHALL NOT submit a PDF for ABNT conformity as a side effect of an upload.

#### Scenario: PDF upload completes
- **WHEN** a PDF upload completes backend document and release creation
- **THEN** the application does not send the PDF to `/abnt/{docId}/conformidade` automatically

### Requirement: Placeholder Conformity Pages
The Conformidade Template route SHALL provide the template conformity result workspace for articles whose completed template result is available from Documentos, while the Conformidade ABNT route SHALL continue to render its under-construction page until an ABNT result experience is separately specified.

#### Scenario: User opens a conformity route
- **WHEN** the user visits `/conformidade-template`
- **THEN** the application displays the template conformity result workspace
- **WHEN** the user visits `/conformidade-abnt`
- **THEN** the application displays a placeholder explaining the intended ABNT validation area rather than detailed results
