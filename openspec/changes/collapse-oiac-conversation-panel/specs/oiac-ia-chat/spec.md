## ADDED Requirements

### Requirement: Collapsible internal conversation panel

Oiac IA SHALL allow the user to collapse and expand the complete internal conversation-list panel through an orange control positioned beside the internal “Oiac IA” title above “Conversas”. This control MUST NOT alter the global application sidebar, and changing the panel state MUST preserve the current conversation context.

#### Scenario: User collapses the conversation panel

- **WHEN** the user activates the collapse control beside the internal “Oiac IA” title
- **THEN** the workspace hides the “Conversas” heading, new-conversation action, conversation-type tabs, and conversation lists
- **AND** expands the available width of the selected conversation workspace
- **AND** retains a compact internal rail with the “Oiac IA” identity and a control to expand the panel again

#### Scenario: User expands the conversation panel

- **WHEN** the internal conversation panel is collapsed and the user activates its expand control
- **THEN** the complete conversation panel becomes visible again
- **AND** restores the previously active conversation type and loaded conversation list

#### Scenario: Panel state changes with an active conversation

- **WHEN** the user collapses or expands the internal panel while a conversation is selected
- **THEN** the selected conversation, messages, PDF preview, active conversation type, and composed message remain unchanged

#### Scenario: User opens Oiac IA in a new page visit

- **WHEN** the Oiac IA workspace is mounted for a new page visit
- **THEN** the internal conversation panel restores the valid expanded or collapsed preference recorded in the `lumina-oiac-conversas-recolhido` cookie
- **AND** starts expanded when that cookie is absent or invalid

#### Scenario: User changes the internal panel state

- **WHEN** the user collapses or expands the internal conversation panel
- **THEN** the application records the selected state in the `lumina-oiac-conversas-recolhido` cookie
- **AND** does not write that preference to `localStorage`, `sessionStorage`, or IndexedDB

#### Scenario: Global sidebar remains independent

- **WHEN** the user collapses or expands the internal Oiac IA conversation panel
- **THEN** the global application sidebar keeps its existing expanded or collapsed state
- **AND** the global “Oiac IA” navigation item is not used as the internal panel control
- **AND** the global sidebar preference cookie is not changed
