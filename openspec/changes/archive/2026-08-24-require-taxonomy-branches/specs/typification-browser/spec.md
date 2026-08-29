## MODIFIED Requirements

### Requirement: Typification Tree Structure Management
The Tipificacoes page SHALL allow only accounts with `access_level: ADMIN` to add and remove taxonomies and branches in their respective typification-card and taxonomy-modal contexts, retaining at least one taxonomy and one branch for each typification that remains saved. A taxonomy added to an existing typification SHALL be saved only together with at least one valid branch.

#### Scenario: User adds nested records
- **WHEN** an administrator adds a taxonomy from its typification card or a branch from its taxonomy modal
- **THEN** the form provided in that context collects the required title and description fields
- **AND** saves the valid new record as part of the edited typification tree

#### Scenario: User adds a taxonomy with its first branch
- **WHEN** an administrator requests a new taxonomy from an existing typification
- **THEN** the form collects the title and description for the taxonomy and at least one branch with its title and description
- **AND** only saves the taxonomy when all of those fields are valid
- **AND** the saved taxonomy includes its first branch

#### Scenario: New taxonomy lacks a valid branch
- **WHEN** an administrator submits a new taxonomy for an existing typification without a branch or with an empty branch title or description
- **THEN** the page identifies the incomplete branch data
- **AND** does not create the taxonomy or branch in the backend

#### Scenario: User removes a nested record
- **WHEN** an administrator requests to remove a saved taxonomy from its card or a branch from its modal card
- **THEN** the page asks for explicit confirmation before scheduling its deletion
- **AND** removes it from the backend only when the edited tree remains structurally valid

#### Scenario: User removes an unsaved nested record
- **WHEN** an administrator removes a taxonomy or branch added only to the current draft
- **THEN** the page removes it from the draft without making a backend request

#### Scenario: Default account views nested records
- **WHEN** an account without `access_level: ADMIN` opens a typification card or taxonomy modal
- **THEN** no action for adding or removing taxonomies or branches is available
