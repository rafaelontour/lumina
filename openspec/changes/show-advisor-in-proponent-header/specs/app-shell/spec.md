## ADDED Requirements

### Requirement: Associated advisor identification in orientando header

The application shell SHALL display the name of the authenticated orientando's active main advisor in the top header. This identification MUST be derived only from the authenticated orientando's active advisory relationships, MUST remain readable without expanding the header when the advisor name is long, and MUST NOT be displayed in an administrator or advisor interface.

#### Scenario: Orientando views the authenticated application shell

- **WHEN** an authenticated orientando with an active main-advisor relationship views a protected application page
- **THEN** the top header identifies the associated advisor by name
- **AND** labels that identity as the orientando's advisor
- **AND** does not expose an advisor associated with another orientando

#### Scenario: Advisor views the authenticated application shell

- **WHEN** an authenticated account with `access_level: ADMIN` views a protected application page
- **THEN** the top header does not display the orientando-only associated-advisor identification
- **AND** preserves the existing advisor header actions

#### Scenario: Associated advisor has a long name

- **WHEN** the associated advisor's name exceeds the space available in the top header
- **THEN** the identity remains contained within the header
- **AND** the theme and session actions remain usable
- **AND** the complete advisor name remains available to assistive technology or an equivalent accessible affordance

#### Scenario: Active advisor cannot be established

- **WHEN** the authenticated orientando has no active main-advisor relationship or the relationship request fails
- **THEN** the shell does not present another person's identity as the associated advisor
- **AND** the existing mandatory advisor-verification flow handles the missing or unavailable relationship before protected content is displayed
