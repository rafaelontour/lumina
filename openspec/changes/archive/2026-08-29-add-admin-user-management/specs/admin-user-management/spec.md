## Purpose

Permitir que administradores removam com segurança contas de teste e demais usuários pela interface administrativa do Lumina.

## ADDED Requirements

### Requirement: Restricted administrative user directory

The application SHALL provide an authenticated user-management workspace at `/usuarios` only to accounts with `access_level: ADMIN`. The workspace SHALL load user records from the backend and present each user’s username, email address, telephone number, and access level, with a text search that narrows the displayed users.

#### Scenario: Administrator opens user management

- **WHEN** an authenticated administrator opens `/usuarios`
- **THEN** the application loads and displays the available user records
- **AND** provides a text search for finding a user

#### Scenario: Non-administrator attempts user management

- **WHEN** an authenticated account without `access_level: ADMIN` navigates to `/usuarios`
- **THEN** the application does not render the user-management workspace or request its user records
- **AND** redirects the account to an allowed protected route

#### Scenario: User directory cannot be loaded

- **WHEN** the backend rejects or fails the user-list request
- **THEN** the application presents a readable error and a retry action
- **AND** does not display an unconfirmed or stale successful result as current data

### Requirement: Confirmed administrative user removal

The application SHALL allow an administrator to remove another user only after an explicit confirmation that identifies the selected account. It MUST NOT offer removal of the currently authenticated administrator’s own account.

#### Scenario: Administrator confirms removal of another user

- **WHEN** an administrator confirms removal for a listed account other than their own
- **THEN** the application requests deletion of that account through the backend
- **AND** removes the account from the displayed list only after the backend confirms success
- **AND** presents a transient success notification

#### Scenario: Administrator cancels removal

- **WHEN** an administrator closes or cancels the removal confirmation
- **THEN** the application does not send a deletion request
- **AND** keeps the user in the displayed list

#### Scenario: Removal request fails

- **WHEN** the backend rejects or fails the removal request
- **THEN** the application keeps the account in the list
- **AND** presents a readable error that permits the administrator to try again

#### Scenario: Administrator views their own account

- **WHEN** the current administrator appears in the user directory
- **THEN** the application identifies it as the current account
- **AND** does not expose a removal action for it

### Requirement: Confirmed administrative access-level management

The application SHALL allow an administrator to select only `DEFAULT` for an advisee or `ADMIN` for an advisor when changing another user’s access level, and apply the change only after explicit confirmation. It MUST NOT offer access-level changes for the currently authenticated administrator’s own account or expose any other backend-supported access level.

#### Scenario: Administrator confirms another user's access level

- **WHEN** an administrator selects `DEFAULT` or `ADMIN` for another listed user and confirms the change
- **THEN** the application sends the selected level together with the user’s required current profile data to the backend
- **AND** updates the displayed access level only after the backend confirms the change
- **AND** presents a transient success notification

#### Scenario: Administrator views available access levels

- **WHEN** an administrator opens the access-level change action for another user
- **THEN** the application offers only `DEFAULT` and `ADMIN`
- **AND** identifies `DEFAULT` as the advisee level and `ADMIN` as the advisor level

#### Scenario: Administrator cancels an access-level change

- **WHEN** an administrator cancels the access-level confirmation
- **THEN** the application does not send an update request
- **AND** keeps the displayed access level unchanged

#### Scenario: Access-level change fails

- **WHEN** the backend rejects or fails an access-level update request
- **THEN** the application keeps the user’s displayed access level unchanged
- **AND** presents a readable error that permits another attempt

#### Scenario: Administrator views their own access level

- **WHEN** the current administrator appears in the user directory
- **THEN** the application identifies the account as current
- **AND** does not expose an access-level change action for it
