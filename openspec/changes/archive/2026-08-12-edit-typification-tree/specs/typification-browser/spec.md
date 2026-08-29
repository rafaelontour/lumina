## ADDED Requirements

### Requirement: Contextual Typification Editing
The Tipificacoes page SHALL place each edit action in the visual context of the record it changes: the typification card for its name, the taxonomy card for its title and description, and the selected taxonomy modal for its branches.

#### Scenario: User edits a typification name
- **WHEN** the user selects the edit action on a typification card
- **THEN** the page presents an edit form for that typification name
- **AND** does not expose unrelated taxonomy or branch fields

#### Scenario: User edits a taxonomy from its card
- **WHEN** the user selects the edit action on a taxonomy card
- **THEN** the page presents an edit form for that taxonomy title and description
- **AND** preserves the card's existing action to open its branches

#### Scenario: User edits a branch in the taxonomy modal
- **WHEN** the user opens a taxonomy and selects the edit action on one of its branch cards
- **THEN** the page presents an edit form for that branch title and description
- **AND** keeps the user in the context of the selected taxonomy

#### Scenario: User cancels editing
- **WHEN** the user closes or cancels the edit form before saving
- **THEN** the page discards the edited draft
- **AND** does not write changes to the backend

### Requirement: Typification Edit Validation
The Tipificacoes page SHALL prevent saving an incomplete existing typification tree.

#### Scenario: A required value is missing
- **WHEN** a typification name, taxonomy title or description, or branch title or description is empty
- **THEN** the page identifies the invalid field
- **AND** does not submit any update request

### Requirement: Typification Tree Structure Management
The Tipificacoes page SHALL allow the user to add and remove taxonomies and branches in their respective typification-card and taxonomy-modal contexts, retaining at least one taxonomy and one branch for each typification that remains saved.

#### Scenario: User adds nested records
- **WHEN** the user adds a taxonomy from its typification card or a branch from its taxonomy modal
- **THEN** the form provided in that context collects the required title and description fields
- **AND** saves the valid new record as part of the edited typification tree

#### Scenario: User removes a nested record
- **WHEN** the user requests to remove a saved taxonomy from its card or a branch from its modal card
- **THEN** the page asks for explicit confirmation before scheduling its deletion
- **AND** removes it from the backend only when the edited tree remains structurally valid

#### Scenario: User removes an unsaved nested record
- **WHEN** the user removes a taxonomy or branch added only to the current draft
- **THEN** the page removes it from the draft without making a backend request

### Requirement: Typification Deletion
The Tipificacoes page SHALL let the user delete a typification after explicit confirmation.

#### Scenario: User confirms deletion of a typification
- **WHEN** the user confirms the deletion action for a typification
- **THEN** the page removes the typification and its nested records from the backend
- **AND** refreshes the list, totals, search results, and open detail state from canonical backend data

#### Scenario: User cancels deletion of a typification
- **WHEN** the user dismisses the deletion confirmation
- **THEN** the page keeps the typification and all of its nested records unchanged

### Requirement: Contextual Typification Persistence
The Tipificacoes page SHALL persist each valid contextual change and then display the canonical state returned by the backend.

#### Scenario: User saves a valid contextual change
- **WHEN** the user submits a valid typification, taxonomy, or branch form
- **THEN** the page creates, updates, or removes only the record requested in that context
- **AND** refreshes the list, totals, search results, and any open detail state from the backend

#### Scenario: An update fails
- **WHEN** any backend update needed to save the edited tree fails
- **THEN** the page reports the normalized failure message
- **AND** refreshes the displayed list from the backend before another edit attempt

#### Scenario: An update is in progress
- **WHEN** the edited tree is being saved
- **THEN** the page prevents duplicate submissions and additional edits to that draft until the operation completes
