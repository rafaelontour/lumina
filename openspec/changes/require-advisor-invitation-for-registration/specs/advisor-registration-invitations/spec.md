## Purpose

Permitir que orientadores autorizem a entrada de novos orientandos por e-mail e ofereçam um link compartilhável para consultar, aceitar ou recusar o convite de orientação.

## ADDED Requirements

### Requirement: Advisor-issued registration authorization

The application SHALL allow an authenticated `ADMIN` advisor to authorize a valid recipient email and create a pending invitation. The same operation SHALL return an opaque invitation code, expiration metadata, and a shareable link without sending an email automatically.

#### Scenario: Advisor authorizes an email

- **WHEN** an authenticated advisor submits a valid recipient email
- **THEN** the backend creates a `PENDING` invitation associated with that advisor and normalized email
- **AND** the application presents the authorized email, expiration, and shareable invitation link
- **AND** it does not send the link automatically

#### Scenario: Advisor copies the invitation link

- **WHEN** the advisor activates the copy action
- **THEN** the application copies the complete link when browser support permits
- **AND** keeps a visible selectable fallback when automatic copying is unavailable

#### Scenario: Advisor enters an email already linked to them

- **WHEN** the normalized recipient email belongs to an advisee with an active relationship to the authenticated advisor
- **THEN** the application warns that an active relationship already exists with that account
- **AND** does not request creation of another invitation

#### Scenario: Invitation request is invalid or unauthorized

- **WHEN** the email is invalid or a non-administrator attempts to create an invitation
- **THEN** no invitation is issued
- **AND** the application presents readable feedback

### Requirement: Active invitation link management

The application SHALL provide authenticated advisors with a section named “Links ativos” containing only their own pending, unexpired invitation links. The section SHALL explain that links leave the active list after they are used, and SHALL allow the issuing advisor to cancel a pending link.

#### Scenario: Advisor opens active links

- **WHEN** an authenticated advisor activates “Links ativos”
- **THEN** the application requests invitations scoped to that advisor
- **AND** displays only invitations whose status is `PENDING` and whose expiration is in the future
- **AND** presents the recipient email, expiration, and a copyable link for each item

#### Scenario: Used link leaves the active list

- **WHEN** an invited account is created or an existing user accepts the invitation
- **THEN** that invitation no longer appears in “Links ativos” on the next load or refresh
- **AND** the section explains that used links are removed from the active list

#### Scenario: Terminal or expired invitation is returned

- **WHEN** the backend returns an accepted, rejected, cancelled, or expired invitation
- **THEN** the application excludes it from “Links ativos”
- **AND** does not present its link as usable

#### Scenario: Advisor deletes an active link

- **WHEN** the issuing advisor confirms deletion of a pending invitation link
- **THEN** the application requests cancellation through the backend
- **AND** removes the link from “Links ativos” after successful confirmation
- **AND** the cancelled link can no longer authorize registration or acceptance

#### Scenario: Active links cannot be loaded or deleted

- **WHEN** listing or cancellation fails
- **THEN** the application presents normalized readable feedback
- **AND** does not remove an item locally unless the backend confirms cancellation

### Requirement: Public invitation inspection

The application SHALL use the invitation code returned by the backend to inspect a shared invitation and SHALL distinguish valid, expired, consumed, rejected, cancelled, and unknown invitations without treating that code as an authenticated session token.

#### Scenario: Recipient opens a valid invitation link

- **WHEN** an anonymous visitor opens a link containing a valid pending invitation code
- **THEN** the application loads the invitation through the public backend operation
- **AND** presents the advisor name, invited email, expiration, and optional project and topic
- **AND** uses `user_exists` to choose between registration and authenticated acceptance

#### Scenario: Recipient opens an unusable invitation

- **WHEN** the invitation is expired, consumed, rejected, cancelled, malformed, or unknown
- **THEN** the application blocks registration and acceptance through that invitation
- **AND** presents generic guidance to request a new authorization from an advisor

#### Scenario: Authenticated user opens a pending invitation link

- **WHEN** a visitor opens `/convite` or `/login?convite=...` with a session that was already authenticated on entry
- **THEN** the application presents the invitation as unavailable for that visit
- **AND** does not inspect, accept, or reject the invitation
- **AND** does not consume, cancel, expire, or otherwise invalidate the pending link

#### Scenario: Invitation code is handled by the browser

- **WHEN** the visitor follows, accepts, or rejects an invitation
- **THEN** the code is used only in the URL and requests required for that flow
- **AND** it is not persisted in `localStorage`, `sessionStorage`, IndexedDB, or JavaScript-managed cookies

### Requirement: Registration through a shared invitation

The application SHALL allow a recipient without an existing account to create their own `DEFAULT` account and accept the invitation in one backend operation using the shared invitation code.

#### Scenario: New user accepts by creating an account

- **WHEN** a valid invitation reports `user_exists: false` and the recipient submits valid username and telephone
- **THEN** the backend creates the account using the invitation-bound email
- **AND** accepts the invitation and creates its academic relationship atomically
- **AND** marks the account as requiring first-password setup
- **AND** establishes the authenticated session without exposing the returned access token to browser-accessible storage

#### Scenario: Invited registration restores the relationship

- **WHEN** the newly registered user enters protected content
- **THEN** the application first requires completion of the mandatory first-password setup
- **AND** the authenticated startup check then finds the active `MAIN_ADVISOR` relationship created from the invitation
- **AND** the application does not present the advisor-selection modal

#### Scenario: Invited registration fails

- **WHEN** account creation or invitation consumption fails
- **THEN** no partial account or relationship remains
- **AND** the application preserves only non-sensitive form values and presents a normalized error

### Requirement: Registration through an authorized email

The application SHALL allow an anonymous visitor to submit an email on `/cadastro` and, when the backend confirms one usable pending authorization for that normalized email, create the account and relationship without requiring the visitor to possess the shared link.

#### Scenario: Visitor enters an authorized email

- **WHEN** an anonymous visitor provides an email with a usable pending invitation
- **THEN** the backend confirms that authorization without disclosing unrelated invitations
- **AND** the application allows the visitor to complete registration for that immutable email

#### Scenario: Visitor enters an unauthorized email

- **WHEN** no usable pending invitation exists for the submitted email
- **THEN** the application does not expose an enabled account-creation form
- **AND** explains that the visitor must be authorized by an advisor or use a received link

### Requirement: Existing-user invitation acceptance

The application SHALL direct an anonymous recipient whose invited email already has an account to sign in and SHALL accept the invitation only when that same invitation flow performs authentication and the resulting account email matches the invited email. A session that was already authenticated when the invitation route was entered SHALL NOT trigger acceptance.

#### Scenario: Existing user signs in and accepts

- **WHEN** a valid invitation reports `user_exists: true` and the matching user authenticates after entering the invitation flow anonymously
- **THEN** the application submits the invitation code to the authenticated acceptance operation
- **AND** presents confirmation after the relationship is created

#### Scenario: Authenticated email differs

- **WHEN** the authenticated user's email differs from the invited email
- **THEN** the backend rejects acceptance
- **AND** no relationship is created

### Requirement: Invitation refusal

The application SHALL allow the recipient to reject a valid pending invitation using its invitation code.

#### Scenario: Recipient rejects invitation

- **WHEN** the recipient confirms the refusal action
- **THEN** the backend changes the invitation to `REJECTED`
- **AND** the invitation can no longer create or associate an account
