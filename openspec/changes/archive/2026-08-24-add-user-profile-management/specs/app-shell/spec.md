## ADDED Requirements

### Requirement: Authenticated user identification in sidebar

The expanded sidebar SHALL show the authenticated user's profile photo, username, and a “Ver perfil” action that navigates to `/perfil`. When the sidebar is collapsed, it SHALL retain an accessible compact profile action.

#### Scenario: User views expanded sidebar

- **WHEN** an authenticated user views the expanded application sidebar
- **THEN** the sidebar displays their profile photo and username
- **AND** displays a “Ver perfil” action that navigates to the personal profile route

#### Scenario: User views collapsed sidebar

- **WHEN** an authenticated user collapses the sidebar
- **THEN** the sidebar keeps an accessible compact action for the personal profile route
- **AND** does not expose the username outside the collapsed sidebar bounds
