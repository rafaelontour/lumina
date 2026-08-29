## MODIFIED Requirements

### Requirement: Component PDF Upload

The Documentos page SHALL allow a PDF to be uploaded for each required backend project document component. Before it creates the external backend document and uploads the file as a release, it SHALL require the user to select one available typification for that component analysis.

#### Scenario: User uploads a component PDF

- **WHEN** the user selects a PDF for a component
- **THEN** the route presents the available typifications before starting the upload
- **AND** after the user confirms one typification, the application creates the backend document using that selected typification, uploads the file as a release, and derives the displayed component version from backend document and release data

#### Scenario: User has not selected a typification

- **WHEN** a PDF is selected but no typification is selected
- **THEN** the route keeps upload confirmation unavailable
- **AND** does not create a backend document or release

#### Scenario: No typification is available

- **WHEN** the typification catalog is empty or cannot be loaded for an upload
- **THEN** the route explains that a typification is required before analysis can begin
- **AND** does not create a backend document or release

#### Scenario: User cancels typification selection

- **WHEN** the user dismisses typification selection before confirming the upload
- **THEN** the route does not create a backend document or release
- **AND** keeps the component available for another file selection

#### Scenario: Uploaded PDF is displayed

- **WHEN** a user uploads a PDF for a component
- **THEN** the component displays the original uploaded filename and does not use generated ids or date-prefixed labels as the document title

#### Scenario: Component upload is in progress

- **WHEN** a PDF is being uploaded for one component
- **THEN** only that component hides its action buttons and shows a local progress animation, while other components remain interactive

#### Scenario: Component analysis is pending

- **WHEN** the latest release for a component has not yet produced analysis
- **THEN** that component hides its action buttons and shows a local progress animation until analysis becomes ready

### Requirement: Typification Selection

The component PDF upload flow SHALL use exactly the available typification explicitly selected by the user when it creates the external backend document for analysis. It SHALL NOT replace that selected typification with a group, item, or first-list automatic fallback.

#### Scenario: User confirms a typification

- **WHEN** the user selects an available typification and confirms a component upload
- **THEN** the backend document is created with that typification as its sole analysis typification

#### Scenario: Different component uploads use different typifications

- **WHEN** the user selects distinct typifications for separate component uploads
- **THEN** each backend document is created with the typification chosen for its own upload
