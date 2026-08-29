## Purpose

Permitir que visitantes criem uma conta Lumina de forma autônoma, sempre limitada ao nível de acesso de usuário padrão.

## ADDED Requirements

### Requirement: Public standard-user account registration

The application SHALL provide an unauthenticated registration experience that collects username, email address, telephone number, and password, then creates the account through the public user-creation API.

#### Scenario: Visitor creates a valid account

- **WHEN** an anonymous visitor submits valid required registration information
- **THEN** the application sends the account creation request to the backend
- **AND** informs the visitor that the account was created
- **AND** directs the visitor to sign in with the newly created credentials

#### Scenario: Registration information is incomplete or invalid

- **WHEN** a visitor submits missing or invalid required registration information
- **THEN** the application does not create an account
- **AND** presents a readable validation message near the form

#### Scenario: Backend rejects the registration

- **WHEN** the account creation request fails, including because the username or email already exists
- **THEN** the application keeps the visitor on the registration experience
- **AND** preserves the non-sensitive entered information
- **AND** presents the normalized backend error without rendering the password

### Requirement: Standard access is mandatory for self-registration

The application SHALL create every self-registered account with `DEFAULT` access and MUST NOT offer a control to select or change the access level during registration.

#### Scenario: Visitor submits the registration form

- **WHEN** an anonymous visitor creates an account through the public registration experience
- **THEN** the account creation request identifies the access level as `DEFAULT`
- **AND** no privileged access level is selectable or inferred from browser state

#### Scenario: Visitor inspects the registration interface

- **WHEN** an anonymous visitor views the registration experience
- **THEN** the interface does not display an access-level selector
- **AND** it identifies the created account as a standard user account where that information is presented

### Requirement: Registration credential privacy

The application MUST submit the registration password only to the internal backend proxy and MUST NOT persist or render that password, access tokens, or authenticated-session state in browser-accessible storage.

#### Scenario: Registration request completes

- **WHEN** the backend accepts or rejects a registration request
- **THEN** the application does not write the submitted password, an access token, or authentication state to `localStorage`, `sessionStorage`, IndexedDB, or JavaScript-managed cookies
- **AND** it does not automatically authenticate the visitor solely because the account was created
