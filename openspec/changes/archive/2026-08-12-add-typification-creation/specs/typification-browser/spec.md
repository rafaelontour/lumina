## ADDED Requirements

### Requirement: Typification Creation Entry Point
The Tipificacoes page SHALL provide a “Nova tipificação” action in the header opposite the “Árvore de verificação” title.

#### Scenario: User opens the Tipificacoes page
- **WHEN** the Tipificacoes page is displayed
- **THEN** the user sees the “Nova tipificação” action opposite the “Árvore de verificação” title

#### Scenario: User starts creating a typification
- **WHEN** the user selects “Nova tipificação”
- **THEN** the page opens a creation form without changing the currently displayed typification list

### Requirement: Hierarchical Typification Draft
The creation form SHALL allow the user to compose one typification with one or more taxonomies, each containing one or more branches.

#### Scenario: User composes a typification tree
- **WHEN** the user enters a typification name
- **THEN** the form allows the user to add and remove taxonomies
- **AND** allows the user to add and remove branches within each taxonomy

#### Scenario: User enters taxonomy and branch details
- **WHEN** the user adds a taxonomy or branch
- **THEN** the form collects a title and description for the taxonomy
- **AND** collects a title and description for each branch

#### Scenario: User cancels creation
- **WHEN** the user cancels or closes the creation form before saving
- **THEN** the draft is discarded
- **AND** no typification, taxonomy, or branch is created in the backend

### Requirement: Hierarchical Typification Validation
The Tipificacoes page SHALL prevent submission of an incomplete typification tree.

#### Scenario: Required tree data is missing
- **WHEN** the typification name is empty, no taxonomy exists, a taxonomy has no branch, or a title or description is empty
- **THEN** the page identifies the invalid field or structure
- **AND** does not submit the creation request

### Requirement: Hierarchical Typification Submission
The Tipificacoes page SHALL create the typification, its taxonomies, and their branches in the backend from a valid submitted draft.

#### Scenario: User saves a valid tree
- **WHEN** the user submits a valid typification draft
- **THEN** the page creates the typification and all of its taxonomies and branches
- **AND** the completed tree appears in the page list with updated aggregate counts

#### Scenario: Hierarchical creation is in progress
- **WHEN** the page is saving a valid typification tree
- **THEN** it prevents duplicate submissions until the operation completes

#### Scenario: Backend creation fails
- **WHEN** any backend operation needed to create the tree fails
- **THEN** the page shows the normalized failure message
- **AND** refreshes the displayed list from the backend before the user attempts another creation
