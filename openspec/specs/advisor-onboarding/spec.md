# advisor-onboarding Specification

## Purpose

Garantir que contas comuns tenham um vínculo de orientação ativo antes de usar o conteúdo protegido da plataforma.

## Requirements

### Requirement: Mandatory advisor onboarding for default accounts
After a valid session is restored, the application SHALL verify whether an authenticated user with `access_level: DEFAULT` has an active advisor relationship. A default account without an active advisor SHALL be blocked by an obligatory advisor-selection dialog before protected platform content becomes usable.

#### Scenario: Default user already has an active advisor
- **WHEN** a default account with at least one active advisor opens or reloads a protected route
- **THEN** the application keeps the advisor onboarding hidden and presents the protected route after session restoration

#### Scenario: Default user has no active advisor
- **WHEN** a default account with no active advisor opens or reloads a protected route
- **THEN** the application presents an advisor-selection dialog
- **AND** does not make protected platform content usable until an advisor relationship is created successfully

#### Scenario: Administrator opens the platform
- **WHEN** an authenticated account has `access_level: ADMIN`
- **THEN** the application does not require advisor onboarding
- **AND** presents the protected route after session restoration

### Requirement: Non-dismissible advisor selection
The required advisor-selection dialog SHALL remain open until the current user selects a candidate and the advisor relationship is saved successfully. It MUST NOT be dismissed by a close control, backdrop interaction, Escape key, or browser-persisted completion state.

#### Scenario: User attempts to dismiss onboarding
- **WHEN** a default account without an active advisor clicks outside the dialog or presses Escape
- **THEN** the dialog remains open
- **AND** protected content remains unavailable

#### Scenario: Advisor relationship save fails
- **WHEN** the relationship request fails after a candidate has been selected
- **THEN** the dialog remains open
- **AND** presents a readable error and permits a retry without exposing protected content

### Requirement: Advisor candidate selection and relationship creation
The dialog SHALL load only available user candidates with `access_level: ADMIN` from the backend, exclude the authenticated user, and let the user select one candidate. On confirmation, the application SHALL create an active `MAIN_ADVISOR` relationship with the selected candidate as advisor and the authenticated user as advisee.

#### Scenario: User saves a selected advisor
- **WHEN** a default account without an active advisor selects an administrator candidate and confirms the selection
- **THEN** the application creates the advisor relationship for the authenticated user
- **AND** closes the dialog only after the backend accepts the relationship
- **AND** makes the protected route usable

#### Scenario: Non-administrator is returned by the backend
- **WHEN** the backend user list contains accounts without `access_level: ADMIN`
- **THEN** the application does not present those accounts as advisor candidates
- **AND** only presents administrator accounts other than the authenticated user

#### Scenario: No administrator candidate is available
- **WHEN** the backend returns no administrator candidate after excluding the authenticated user
- **THEN** the dialog remains open with a readable explanation and a retry action
- **AND** does not make protected content usable

### Requirement: Administrator advisee workspace
The application SHALL provide an `/orientandos` workspace to authenticated accounts with `access_level: ADMIN`. The workspace SHALL obtain its entries from the authenticated professor's advisor summary endpoint and display only the advisees returned for that account, including their identity, advisory role, topic or project context when present, total documents, and pending reviews.

#### Scenario: Administrator views own advisees
- **WHEN** an authenticated administrator opens `/orientandos`
- **THEN** the application requests that account's advisor summary from the backend
- **AND** displays only the returned advisees and their associated review summaries

#### Scenario: Administrator has no advisees
- **WHEN** an authenticated administrator with no active advisees opens `/orientandos`
- **THEN** the application presents a readable empty state
- **AND** does not display advisees associated with another account

#### Scenario: Non-administrator attempts the advisor workspace
- **WHEN** an authenticated account without `access_level: ADMIN` navigates to `/orientandos`
- **THEN** the application does not render the advisee workspace or its data
- **AND** keeps the workspace navigation unavailable
