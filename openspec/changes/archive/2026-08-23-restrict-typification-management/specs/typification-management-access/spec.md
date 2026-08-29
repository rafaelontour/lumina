## Purpose

Restringir a gestão da árvore de conhecimento a professores, preservando sua consulta para orientandos.

## ADDED Requirements

### Requirement: Role-based typification management access
The application SHALL allow only authenticated accounts with `access_level: ADMIN` to manage typifications, taxonomies, and branches. Accounts without that access level MUST retain read-only access to the typification browser.

#### Scenario: Default account opens Tipificacoes
- **WHEN** an authenticated account without `access_level: ADMIN` opens Tipificacoes
- **THEN** the application loads and displays typifications, taxonomies, and branches
- **AND** does not display controls that create, edit, add, remove, or delete any part of the tree

#### Scenario: Administrator opens Tipificacoes
- **WHEN** an authenticated account with `access_level: ADMIN` opens Tipificacoes
- **THEN** the application displays the management controls for typifications, taxonomies, and branches
- **AND** retains the existing browser and detail behavior

### Requirement: Protected management actions
The application MUST prevent non-ADMIN accounts from reaching typification creation or edit forms and from submitting any typification, taxonomy, or branch write operation through the Tipificacoes interface.

#### Scenario: Default account attempts a direct management flow
- **WHEN** an account without `access_level: ADMIN` reaches a management action through stale UI state or a direct client-side interaction
- **THEN** the application does not open the management form or submit a write request
- **AND** keeps the typification browser in read-only state
