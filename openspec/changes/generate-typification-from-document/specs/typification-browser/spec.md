## MODIFIED Requirements

### Requirement: Typification Creation Entry Point
The Tipificacoes page SHALL provide a “Nova tipificação” action in the header opposite the “Árvore de verificação” title only to accounts with `access_level: ADMIN`. Activating that action SHALL allow the administrator to choose between the existing manual creation flow and document-assisted creation without changing the currently displayed typification list before a mode is selected.

#### Scenario: User opens the Tipificacoes page
- **WHEN** an authenticated account with `access_level: ADMIN` displays the Tipificacoes page
- **THEN** the user sees the “Nova tipificação” action opposite the “Árvore de verificação” title

#### Scenario: Default account opens the Tipificacoes page
- **WHEN** an authenticated account without `access_level: ADMIN` displays the Tipificacoes page
- **THEN** the user does not see the “Nova tipificação” action

#### Scenario: Administrator starts creating a typification
- **WHEN** an administrator selects “Nova tipificação”
- **THEN** the page offers distinct “Criar manualmente” and “Gerar a partir de documento” choices
- **AND** does not change the currently displayed typification list

#### Scenario: Administrator selects manual creation
- **WHEN** the administrator chooses “Criar manualmente”
- **THEN** the page opens the existing hierarchical creation form with its current validation and submission behavior

#### Scenario: Administrator selects document-assisted creation
- **WHEN** the administrator chooses “Gerar a partir de documento”
- **THEN** the page opens the document upload and suggestion-session experience
- **AND** leaves manual creation available for a later attempt
