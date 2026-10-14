## MODIFIED Requirements

### Requirement: Role-based typification management access
The application SHALL allow only authenticated accounts with `access_level: ADMIN` to manage typifications, taxonomies, and branches, including creating suggestion sessions from documents and reviewing, confirming, or discarding their items. Accounts without that access level MUST retain read-only access to the typification browser.

#### Scenario: Default account opens Tipificacoes
- **WHEN** an authenticated account without `access_level: ADMIN` opens Tipificacoes
- **THEN** the application loads and displays typifications, taxonomies, and branches
- **AND** does not display controls that create, edit, add, remove, delete, generate, enrich, confirm, or discard any part of the tree
- **AND** does not load the document-assisted session experience

#### Scenario: Administrator opens Tipificacoes
- **WHEN** an authenticated account with `access_level: ADMIN` opens Tipificacoes
- **THEN** the application displays the manual and document-assisted management controls for typifications, taxonomies, and branches
- **AND** retains the existing browser and detail behavior

### Requirement: Protected management actions
The application MUST prevent non-ADMIN accounts from reaching manual or document-assisted typification creation and edit experiences and from submitting any typification, taxonomy, branch, suggestion-session, confirmation, or discard request through the Tipificacoes interface.

#### Scenario: Default account attempts a direct management flow
- **WHEN** an account without `access_level: ADMIN` reaches a manual or document-assisted management action through stale UI state or a direct client-side interaction
- **THEN** the application does not open the management experience or submit a read or write request for suggestion sessions
- **AND** keeps the typification browser in read-only state
