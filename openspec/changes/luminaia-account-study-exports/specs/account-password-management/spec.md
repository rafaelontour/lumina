## Purpose

Permitir que pessoas usuárias alterem a senha autenticadas e recuperem o acesso por um fluxo público de solicitação e redefinição.

## ADDED Requirements

### Requirement: Authenticated password change
The application SHALL let the authenticated user change their password by submitting the current password and a new password through the authenticated backend proxy. It MUST clear password inputs after every response and MUST NOT persist or render passwords, reset tokens, or authentication credentials.

#### Scenario: User changes password successfully
- **WHEN** an authenticated user submits a valid current password and matching new password confirmation
- **THEN** the application sends the password change request for the current user's id
- **AND** confirms the change without exposing either password
- **AND** clears the password fields

#### Scenario: Current password is rejected
- **WHEN** the backend rejects the current password or change request
- **THEN** the application presents a normalized error
- **AND** clears password fields before another attempt

### Requirement: Password recovery request
The public authentication area SHALL let a visitor request password recovery by email through the published backend endpoint and SHALL present a generic confirmation that does not reveal whether the email belongs to an account.

#### Scenario: Visitor requests recovery
- **WHEN** a visitor submits a syntactically valid email address
- **THEN** the application submits the email to the backend recovery endpoint
- **AND** presents the same generic next-step confirmation regardless of account existence

### Requirement: Password reset from recovery link
The public authentication area SHALL accept the email and opaque reset token supplied by the recovery link and submit them with a new password to the backend reset endpoint. The reset token MUST remain only in the current URL and request flow.

#### Scenario: Visitor resets password
- **WHEN** a visitor with email and reset token submits matching valid new-password fields
- **THEN** the application submits the reset request
- **AND** confirms success and provides navigation to login
- **AND** clears passwords and removes the reset token from the visible URL after handling the response

#### Scenario: Recovery link is absent or invalid
- **WHEN** the email or reset token is missing, expired, or rejected
- **THEN** the application presents a readable recovery error
- **AND** does not display the token in page content or errors
