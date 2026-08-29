## ADDED Requirements

### Requirement: In-memory authenticated profile refresh

The application SHALL replace its in-memory authenticated user data only after the backend confirms a personal-profile update or after it re-reads the current user. It MUST NOT persist the updated profile as an authentication substitute in browser storage.

#### Scenario: Profile update is confirmed

- **WHEN** the backend confirms an update to the authenticated user's personal profile
- **THEN** the application updates its in-memory authenticated user data for shared UI
- **AND** does not write authentication state, credentials, or access tokens to browser storage
