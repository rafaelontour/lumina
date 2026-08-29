## MODIFIED Requirements

### Requirement: Typification Creation Entry Point
The Tipificacoes page SHALL provide a “Nova tipificação” action in the header opposite the “Árvore de verificação” title only to accounts with `access_level: ADMIN`.

#### Scenario: User opens the Tipificacoes page
- **WHEN** an authenticated account with `access_level: ADMIN` displays the Tipificacoes page
- **THEN** the user sees the “Nova tipificação” action opposite the “Árvore de verificação” title

#### Scenario: Default account opens the Tipificacoes page
- **WHEN** an authenticated account without `access_level: ADMIN` displays the Tipificacoes page
- **THEN** the user does not see the “Nova tipificação” action

#### Scenario: User starts creating a typification
- **WHEN** an administrator selects “Nova tipificação”
- **THEN** the page opens a creation form without changing the currently displayed typification list

### Requirement: Hierarchical Typification Submission
The Tipificacoes page SHALL create the typification, its taxonomies, and their branches in the backend from a valid submitted draft only for accounts with `access_level: ADMIN`.

#### Scenario: User saves a valid tree
- **WHEN** an administrator submits a valid typification draft
- **THEN** the page creates the typification and all of its taxonomies and branches
- **AND** the completed tree appears in the page list with updated aggregate counts

#### Scenario: Hierarchical creation is in progress
- **WHEN** an administrator is saving a valid typification tree
- **THEN** it prevents duplicate submissions until the operation completes

#### Scenario: Backend creation fails
- **WHEN** any backend operation needed to create the tree fails for an administrator
- **THEN** the page shows the normalized failure message
- **AND** refreshes the displayed list from the backend before the user attempts another creation

### Requirement: Contextual Typification Editing
The Tipificacoes page SHALL provide edit actions only to accounts with `access_level: ADMIN`, in the visual context of the record they change: the typification card for its name, the taxonomy card for its title and description, and the selected taxonomy modal for its branches.

#### Scenario: User edits a typification name
- **WHEN** an administrator selects the edit action on a typification card
- **THEN** the page presents an edit form for that typification name
- **AND** does not expose unrelated taxonomy or branch fields

#### Scenario: User edits a taxonomy from its card
- **WHEN** an administrator selects the edit action on a taxonomy card
- **THEN** the page presents an edit form for that taxonomy title and description
- **AND** preserves the card's existing action to open its branches

#### Scenario: User edits a branch in the taxonomy modal
- **WHEN** an administrator opens a taxonomy and selects the edit action on one of its branch cards
- **THEN** the page presents an edit form for that branch title and description
- **AND** keeps the user in the context of the selected taxonomy

#### Scenario: User cancels editing
- **WHEN** an administrator closes or cancels the edit form before saving
- **THEN** the page discards the edited draft
- **AND** does not write changes to the backend

#### Scenario: Default account views a typification
- **WHEN** an account without `access_level: ADMIN` views typification cards or a taxonomy modal
- **THEN** the page shows the same data without edit actions

### Requirement: Typification Tree Structure Management
The Tipificacoes page SHALL allow only accounts with `access_level: ADMIN` to add and remove taxonomies and branches in their respective typification-card and taxonomy-modal contexts, retaining at least one taxonomy and one branch for each typification that remains saved.

#### Scenario: User adds nested records
- **WHEN** an administrator adds a taxonomy from its typification card or a branch from its taxonomy modal
- **THEN** the form provided in that context collects the required title and description fields
- **AND** saves the valid new record as part of the edited typification tree

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

### Requirement: Typification Deletion
The Tipificacoes page SHALL let only accounts with `access_level: ADMIN` delete a typification after explicit confirmation.

#### Scenario: User confirms deletion of a typification
- **WHEN** an administrator confirms the deletion action for a typification
- **THEN** the page removes the typification and its nested records from the backend
- **AND** refreshes the list, totals, search results, and open detail state from canonical backend data

#### Scenario: User cancels deletion of a typification
- **WHEN** an administrator dismisses the deletion confirmation
- **THEN** the page keeps the typification and all of its nested records unchanged

#### Scenario: Default account views a typification
- **WHEN** an account without `access_level: ADMIN` views a typification
- **THEN** no deletion action is available

### Requirement: Contextual Typification Persistence
The Tipificacoes page SHALL persist each valid contextual change only for accounts with `access_level: ADMIN` and then display the canonical state returned by the backend.

#### Scenario: User saves a valid contextual change
- **WHEN** an administrator submits a valid typification, taxonomy, or branch form
- **THEN** the page creates, updates, or removes only the record requested in that context
- **AND** refreshes the list, totals, search results, and any open detail state from the backend

#### Scenario: An update fails
- **WHEN** any backend update needed to save an administrator's edited tree fails
- **THEN** the page reports the normalized failure message
- **AND** refreshes the displayed list from the backend before another edit attempt

#### Scenario: An update is in progress
- **WHEN** an administrator's edited tree is being saved
- **THEN** the page prevents duplicate submissions and additional edits to that draft until the operation completes
