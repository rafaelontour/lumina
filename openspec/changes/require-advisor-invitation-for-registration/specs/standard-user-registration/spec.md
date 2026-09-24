## MODIFIED Requirements

### Requirement: Public standard-user account registration

The application SHALL provide an unauthenticated registration experience through either a valid invitation link or an email previously authorized by an advisor. After backend validation, the form SHALL collect username, the immutable authorized email, and telephone number, then request atomic creation of the account and academic relationship without collecting a password at this stage.

#### Scenario: Visitor opens registration through a valid link

- **WHEN** a valid invitation identifies a recipient without an existing account
- **THEN** the application presents the registration form with the invited email visible and immutable
- **AND** does not request a password before creating the invited account

#### Scenario: Visitor starts registration by email

- **WHEN** an anonymous visitor accesses `/cadastro` without an invitation code
- **THEN** the application first requests the visitor's email
- **AND** exposes the account form only after the backend confirms a usable authorization for that email

#### Scenario: Visitor creates a valid invited account

- **WHEN** the visitor submits valid required data through a confirmed link or email authorization
- **THEN** the backend creates the `DEFAULT` account and its relationship atomically
- **AND** consumes the authorization
- **AND** establishes the authenticated session and requires first-password setup before protected content
- **AND** directs the user to protected content only after the password is defined successfully
- **AND** the advisor-selection modal is not displayed because the active relationship already exists

#### Scenario: Registration information is incomplete or invalid

- **WHEN** the visitor submits missing or invalid required information
- **THEN** the application does not create an account
- **AND** presents a readable validation message near the form

#### Scenario: Backend rejects the registration

- **WHEN** the request fails, including an expired authorization or existing username/email conflict
- **THEN** the application preserves only non-sensitive entered information
- **AND** presents the normalized backend error without rendering credentials

### Requirement: Standard access is mandatory for self-registration

The application SHALL create every invited self-registered account with `DEFAULT` access and MUST NOT offer or submit a browser-controlled access-level selection.

#### Scenario: Visitor submits invited registration

- **WHEN** an anonymous visitor creates an account through a confirmed invitation
- **THEN** the backend assigns `DEFAULT` access according to the invited-registration contract
- **AND** no privileged level is submitted or inferred from browser state

#### Scenario: Visitor inspects the registration interface

- **WHEN** an anonymous visitor views the registration experience
- **THEN** the interface does not display an access-level selector
- **AND** it identifies the resulting account as a standard account where applicable

### Requirement: Registration credential privacy

The application MUST submit the invitation code and the later first-password definition only through the internal backend proxy and MUST NOT persist or render passwords, access tokens, invitation codes, or authenticated-session state in browser-accessible storage. A successful invited registration MAY establish the backend-managed `HttpOnly` authenticated session.

#### Scenario: Registration request completes

- **WHEN** the backend accepts or rejects an invited registration request
- **THEN** the application does not write the invitation code, access token, or authentication state to `localStorage`, `sessionStorage`, IndexedDB, or JavaScript-managed cookies
- **AND** any authenticated state is carried only by the backend-managed `HttpOnly` cookie

## ADDED Requirements

### Requirement: Mandatory first-password setup

The application SHALL block onboarding and protected content for an authenticated invited account while the backend reports `password_setup_required: true`. It SHALL present a non-dismissible popup for the user to define and confirm their first password, and SHALL derive this requirement from authenticated backend state on every full page load rather than browser persistence.

#### Scenario: Newly invited account enters the application

- **WHEN** invited registration establishes a session whose authenticated user has `password_setup_required: true`
- **THEN** the application presents the first-password popup before onboarding or protected content
- **AND** the popup cannot be dismissed by a close action, Escape, or backdrop interaction

#### Scenario: User refreshes during mandatory setup

- **WHEN** the authenticated user refreshes or reopens a protected page before defining the first password
- **THEN** `/user/my` continues to report `password_setup_required: true`
- **AND** the application restores the mandatory popup at the same blocking stage
- **AND** it does not depend on `localStorage`, `sessionStorage`, IndexedDB, or a JavaScript-managed cookie to resume the stage

#### Scenario: User defines the first password

- **WHEN** the user submits matching valid password and confirmation values
- **THEN** the application sends the new password through the authenticated internal backend proxy
- **AND** the backend permits an absent current password only for that authenticated account while first-password setup is required
- **AND** the backend stores the password and clears `password_setup_required` atomically
- **AND** the application refreshes `/user/my` before releasing the gate

#### Scenario: First-password setup fails

- **WHEN** validation or the backend rejects the first-password request
- **THEN** the mandatory popup remains active
- **AND** the application clears password fields after the response
- **AND** presents a readable error without rendering or persisting the submitted password

#### Scenario: Existing account has no setup requirement

- **WHEN** an authenticated account has `password_setup_required: false` or no applicable pending setup state
- **THEN** the application does not present the first-password popup
