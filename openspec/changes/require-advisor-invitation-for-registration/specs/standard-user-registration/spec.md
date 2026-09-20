## MODIFIED Requirements

### Requirement: Public standard-user account registration

The application SHALL provide an unauthenticated registration route, but SHALL expose and submit its account-creation form only after validating an advisor-issued invitation. The form SHALL collect username, the invitation-bound email address, telephone number, and a password created and confirmed by the invited person, then request atomic creation of the account and its advisor relationship through the public registration API. The advisor and the invitation MUST NOT define, expose, or deliver a provisional password for that account.

#### Scenario: Visitor opens registration without an invitation

- **WHEN** an anonymous visitor accesses `/cadastro` without an invitation credential
- **THEN** the application does not present an enabled account-creation form
- **AND** displays a readable notice that account creation requires a link sent by an advisor
- **AND** explains that an advisor-authorized email may become an alternative in the future without presenting that alternative as currently available

#### Scenario: Visitor opens registration with a valid invitation

- **WHEN** an anonymous visitor follows the create-account action from the login screen with a valid invitation authorization
- **THEN** the application presents the standard-user registration form
- **AND** identifies the invited email address as the email authorized for that registration
- **AND** prevents the visitor from replacing it with another email address
- **AND** lets the invited person create and confirm their own password
- **AND** does not present a password chosen by the advisor or carried by the invitation

#### Scenario: Visitor creates a valid invited account

- **WHEN** an anonymous visitor submits valid required registration information with a valid unused invitation
- **AND** the password and confirmation created by the visitor match
- **THEN** the application sends the account-creation request with the invitation credential to the backend
- **AND** the backend creates the account and its advisor relationship atomically
- **AND** the application informs the visitor that the account was created
- **AND** directs the visitor to sign in with the newly created credentials

#### Scenario: Registration information is incomplete or invalid

- **WHEN** a visitor with a valid invitation submits missing or invalid required registration information
- **THEN** the application does not create an account
- **AND** presents a readable validation message near the form

#### Scenario: Backend rejects the registration

- **WHEN** the invited account-creation request fails, including because the username or email already exists or the invitation is no longer valid
- **THEN** the application keeps the visitor on the registration experience
- **AND** preserves the non-sensitive entered information
- **AND** clears the submitted password and confirmation
- **AND** presents the normalized backend error without rendering the password
