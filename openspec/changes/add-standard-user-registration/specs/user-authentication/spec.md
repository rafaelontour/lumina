## ADDED Requirements

### Requirement: Public authentication navigation

The public authentication area SHALL let an anonymous visitor navigate between sign-in and standard-user registration without exposing protected platform content.

#### Scenario: Visitor chooses to create an account

- **WHEN** an anonymous visitor chooses the registration action from the login experience
- **THEN** the application presents the standard-user registration experience
- **AND** keeps the visitor outside the authenticated application shell

#### Scenario: Registered visitor returns to sign-in

- **WHEN** a visitor chooses to sign in after completing or leaving registration
- **THEN** the application presents the login experience
- **AND** does not assume that registration established an authenticated session
