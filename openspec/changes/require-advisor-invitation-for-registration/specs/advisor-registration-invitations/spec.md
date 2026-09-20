## Purpose

Permitir que orientadores autorizem de forma controlada a entrada de novos orientandos por links de convite vinculados ao destinatário e ao vínculo de orientação.

## ADDED Requirements

### Requirement: Advisor-issued registration invitation

The application SHALL allow an authenticated account with `access_level: ADMIN` to create a registration invitation by providing the intended advisee's valid email address. The invitation SHALL be associated with the authenticated advisor and that normalized email address, and the application SHALL return a shareable `/convite/<code>` registration link without sending it by email.

#### Scenario: Advisor creates an invitation

- **WHEN** an authenticated advisor provides a valid email address and requests an invitation
- **THEN** the backend creates an invitation associated with that advisor and normalized email address
- **AND** the application presents a registration link that the advisor can copy
- **AND** the application does not send an email or share the link automatically

#### Scenario: Invitation email is invalid

- **WHEN** an advisor requests an invitation without a valid email address
- **THEN** the application does not create an invitation
- **AND** presents a readable validation message

#### Scenario: Non-administrator attempts to create an invitation

- **WHEN** an authenticated account without `access_level: ADMIN` attempts to create a registration invitation
- **THEN** the backend rejects the request
- **AND** no invitation link is issued

#### Scenario: Advisor copies the invitation link

- **WHEN** an invitation has been created and the advisor activates its copy action
- **THEN** the application copies the complete registration link when browser support permits
- **AND** provides readable confirmation or a selectable fallback when automatic copying is unavailable

### Requirement: Opaque and temporary invitation authority

Each registration link SHALL carry an opaque, unguessable invitation credential. The backend SHALL define and enforce its expiration and single-use status, and the frontend MUST NOT persist the credential in browser storage.

#### Scenario: Valid invitation is inspected

- **WHEN** an anonymous visitor opens a registration link whose invitation is valid and unused
- **THEN** the backend confirms the invited email and the display-safe advisor identity needed for the registration experience
- **AND** establishes a temporary invitation authorization that is unavailable to browser JavaScript
- **AND** the application removes the invitation credential from the visible URL by redirecting the visitor to `/login`

#### Scenario: Invitation is invalid, expired, or already used

- **WHEN** an anonymous visitor opens a registration link whose invitation cannot authorize a new account
- **THEN** the application does not expose the account-creation form
- **AND** explains that a new invitation link must be requested from an advisor

#### Scenario: Browser storage is inspected

- **WHEN** an advisor creates a link or a visitor opens one
- **THEN** the invitation credential is absent from `localStorage`, `sessionStorage`, IndexedDB, and JavaScript-managed cookies

### Requirement: Invited arrival at login

After accepting a valid invitation link, the application SHALL present the public login screen with an accessible invitation popup identifying the issuing advisor. The popup SHALL show the advisor's profile photo when available, use a readable avatar fallback otherwise, explain that the advisor invited the visitor, and instruct the visitor to create their account normally.

#### Scenario: Visitor arrives through a valid invitation

- **WHEN** an anonymous visitor is redirected to `/login` after opening a valid unused invitation link
- **THEN** the application opens an invitation popup above the login screen
- **AND** shows the issuing advisor's name and profile photo
- **AND** uses readable initials or an equivalent avatar fallback when the advisor has no usable photo
- **AND** states that the identified advisor invited the visitor to Lumina
- **AND** explains that the visitor only needs to create their account normally

#### Scenario: Visitor acknowledges the invitation

- **WHEN** the visitor activates the popup action “Entendi”
- **THEN** the application closes the popup
- **AND** keeps the visitor on the login screen
- **AND** preserves the valid invitation authorization for the registration action

#### Scenario: Visitor chooses to create the invited account

- **WHEN** the visitor follows the create-account action after acknowledging a valid invitation
- **THEN** the application opens `/cadastro` with the same invitation authorization
- **AND** does not require the visitor to paste or re-enter the invitation code

#### Scenario: Advisor photo cannot be displayed

- **WHEN** the issuing advisor has no profile photo or the invitation-authorized photo cannot be loaded
- **THEN** the popup displays a readable avatar fallback derived from the advisor's name
- **AND** keeps the advisor name and invitation instructions available

#### Scenario: Visitor opens an unusable invitation link

- **WHEN** an invitation link is unknown, malformed, expired, or already consumed
- **THEN** the application does not disclose an advisor identity or profile photo
- **AND** presents readable guidance to request a new link from an advisor

### Requirement: Atomic invited-account activation

The backend SHALL consume a valid invitation, create one `DEFAULT` account with the invited email, and create an active `MAIN_ADVISOR` relationship from the invitation's issuing advisor to the new account as one atomic operation. A failed operation MUST leave neither a consumed invitation nor a partially created account or relationship.

#### Scenario: Invited account is created

- **WHEN** a visitor submits valid registration data with a valid unused invitation and the invited email
- **THEN** the backend creates the `DEFAULT` account
- **AND** creates its active `MAIN_ADVISOR` relationship with the invitation's issuing advisor
- **AND** marks the invitation as consumed

#### Scenario: Account or relationship creation fails

- **WHEN** any part of invited account creation cannot be completed
- **THEN** the backend does not leave a partial account or relationship
- **AND** does not consume the invitation
- **AND** returns a readable registration error

#### Scenario: Consumed invitation is submitted again

- **WHEN** any visitor attempts to create another account with an invitation that has already been consumed
- **THEN** the backend rejects the request
- **AND** creates neither an account nor an advisory relationship

#### Scenario: Submitted email differs from invitation

- **WHEN** registration data contains an email that does not normalize to the invitation's authorized email
- **THEN** the backend rejects the request
- **AND** does not consume the invitation or create an account
